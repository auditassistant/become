module.exports = function(rootNode, options){
  var options = options || {}
  var result = []
  result.push({path: '/', type: 'element', value: nodeName(rootNode), element: rootNode})
  result.push({path: '/', type: 'attr', value: getAttributes(rootNode), element: rootNode})

  var previousNode = rootNode
  var count = 1

  walkDom(rootNode, function(element){
    if (shouldPreserve(element)) return false

    var path = getPath(element, rootNode)

    if (nodeName(previousNode) == nodeName(element)){
      path += count++
    } else {
      count = 1
    }

    if (element.nodeType == 1){

      element.dommerPath = path
      result.push({path: path, type: 'element', value: nodeName(element), element: element})

      var attributes = getAttributes(element)
      if (Object.keys(attributes).length){
        result.push({path: path, type: 'attr', value: attributes, element: element})
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
      if (element.getAttribute && options.uniqueAttribute && element.getAttribute(options.uniqueAttribute)){
        path = nodeName(element) + '<' + element.getAttribute(options.uniqueAttribute) + '>/' + path
      } else {
        path = nodeName(element) + '[' + getIndex(element) + ']/' + path
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
      if (nodeName(target.previousSibling) == nodeName(element)){
        if (!shouldPreserve(target.previousSibling)){
          count += 1
          distance = 0
        }
      } else {
        distance += 1
      }
      target = target.previousSibling
    }
    return count
  }

  return result
}

//var slice = Array.prototype.slice
function iterativelyWalk(nodes, cb) {
  nodes = Array.prototype.slice.call(nodes)

  while(nodes.length) {
    var node = nodes.shift()
    var ret = cb(node)

    if (ret !== false && node.childNodes.length) {
      nodes = Array.prototype.slice.call(node.childNodes).concat(nodes)
    }
  }
}

function walkDom(rootNode, iterator){
  var currentNode = rootNode.firstChild
  while (currentNode){
    var lookInside = iterator(currentNode)
    if (lookInside !== false && currentNode.firstChild){
      currentNode = currentNode.firstChild
    } else {
      while (currentNode && !currentNode.nextSibling){
        if (currentNode !== rootNode) {
          currentNode = currentNode.parentNode
        } else {
          currentNode = null
        }
      }
      currentNode = currentNode && currentNode.nextSibling
    }
  }
}

function nodeName(element){
  var attribute = element.getAttribute && element.getAttribute('data-node-name')
  if (attribute){
    if (attribute.charAt(0) == '#'){
      return element.getAttribute('data-node-name')
    } else {
      return element.getAttribute('data-node-name').toUpperCase()
    }
  } else {
    return element.nodeName
  }
}


function getAttributes(element){
  var obj = {}
  var attrs = element.attributes
  if (attrs){
    for(var i=attrs.length-1; i>=0; i--) {
      var attribute = attrs[i]
      var name = attribute.name.toLowerCase()
      if (attribute.specified && name != 'dommerpath' && name != 'data-nodename') {
        obj[attribute.name] = attribute.value
      }
    }
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