module.exports = function(rootNode){
  var result = []
  result.push({path: '/', type: 'element', value: rootNode.nodeName, element: rootNode})
  result.push({path: '/', type: 'attr', value: getAttributes(rootNode), element: rootNode})

  iterativelyWalk(rootNode.childNodes, function(element){
    if (shouldPreserve(element)) return false

    var path = getPath(element)
    if (element.nodeType == 1){
      result.push({path: path, type: 'element', value: element.nodeName, element: element})
      result.push({path: path, type: 'attr', value: getAttributes(element), element: element})
      if (!hasChildNodes(element)){
        result.push({path: path, type: 'end', element: element})
        addEnds(element, result)
      }
    } else if (element.nodeType == 3){
      result.push({path: path, type: 'text', value: element.data, element: element})
      addEnds(element, result)
    }
  })

  result.push({path: '/', type: 'end', element: rootNode})
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

function getPath(element, rootNode){
  var path = ''
  while (element.parentNode && element != rootNode){
    path = element.nodeName + '/' + path
    element = element.parentNode
  }
  return path
}

function getAttributes(element){
  var obj = {}
  var attrs = element.attributes
  for(var i=attrs.length-1; i>=0; i--) {
    obj[attrs[i].name] = attrs[i].value
  }
  return obj
}

function addEnds(element, result){
  if (element.parentNode && lastChild(element.parentNode) == element){
    result.push({path: getPath(element.parentNode), type: 'end', element: element.parentNode})
    addEnds(element.parentNode, result)
  }
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