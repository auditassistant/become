module.exports = function(rootNode, options){
  var options = options || {}
  var result = []
  result.push({path: '/', type: 'element', value: rootNode.nodeName, element: rootNode})
  result.push({path: '/', type: 'attr', value: getAttributes(rootNode), element: rootNode})

  var previousNode = rootNode
  var count = 1

  iterativelyWalk(rootNode.childNodes, function(element){
    if (shouldPreserve(element)) return false

    var path = getPath(element, rootNode)
    element.dommerPath = path

    if (previousNode.nodeName == element.nodeName){
      path += count++
    } else {
      count = 1
    }

    if (element.nodeType == 1){
      result.push({path: path, type: 'element', value: element.nodeName, element: element})

      var attrs = element.attributes
      for(var i=attrs.length-1; i>=0; i--) {
        var val = {}
        val[attrs[i].name] = attrs[i].value
        result.push({path: path, type: 'attr', value: val, element: element})
      }

      if (!hasChildNodes(element)){
        result.push({path: path, type: 'end', element: element})
        addEnds(element, result, rootNode)
      }
    } else if (element.nodeType == 3){
      result.push({path: path, type: 'text', value: element.data, element: element})
      addEnds(element, result, rootNode)
    }

    previousNode = element
  })

  function getPath(element){
    var path = ''
    while (element.parentNode && element != rootNode){
      if (element.hasAttribute && options.uniqueAttribute && element.hasAttribute(options.uniqueAttribute)){
        path = element.nodeName + '<' + element.getAttribute(options.uniqueAttribute) + '>/' + path
      } else {
        path = element.nodeName + '[' + getIndex(element) + ']/' + path
      }
      element = element.parentNode
    }
    return '/' + path
  }

  function addEnds(element, result){
    if (element.parentNode && lastChild(element.parentNode) == element){
      result.push({path: element.parentNode.dommerPath || getPath(element.parentNode, rootNode), type: 'end', element: element.parentNode})
      if (element.parentNode != rootNode){
        addEnds(element.parentNode, result, rootNode)
      }
    }
  }

  function getIndex(element){
    var target = element
    var count = 0
    var distance = 0
    while (target.previousSibling && distance < 2){
      if (target.previousSibling.nodeName == element.nodeName){
        count += 1
        distance = 0
      } else {
        distance += 1
      }
      target = target.previousSibling
    }
    return count
  }

  return result
}

var slice = Array.prototype.slice
function iterativelyWalk(nodes, cb) {
  nodes = slice.call(nodes)

  while(nodes.length) {
    var node = nodes.shift()
    var ret = cb(node)

    if (ret !== false && node.childNodes.length) {
      nodes = slice.call(node.childNodes).concat(nodes)
    }
  }
}


function getAttributes(element){
  var obj = {}
  var attrs = element.attributes
  for(var i=attrs.length-1; i>=0; i--) {
    obj[attrs[i].name] = attrs[i].value
  }
  return obj
}


function hasChildNodes(element){
  if (!element.hasChildNodes()) return false
  for (var i=0;i<element.childNodes.length;i++){
    if (!shouldPreserve(element)){
      return true
    }
  }
  return false
}

function lastChild(element){
  var last = element.lastChild
  while (shouldPreserve(last) && last.previousSibling){
    last = last.previousSibling
  }
  return last
}

function shouldPreserve(element){
  return element.nodeType == 1 && element.getAttribute('data-preserve') == 'true'
}