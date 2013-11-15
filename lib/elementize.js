module.exports = function(html){
  if (typeof html === 'string'){
    return parse(html)
  } else if (Array.isArray(html)){
    return html
  } else {
    if (html.nodeName === '#document'){
      return [html.documentElement]
    } else {
      return [html]
    }
  }
}

function parse(html){
  var root = getRoot(html)
  if (root){
    return [root]
  } else {
    var wrapper = document.createElement('div')
    wrapper.innerHTML = html

    // prepare return array
    var result = []
    var current = wrapper.firstChild
    while (current){
      result.push(current)
      current = current.nextSibling
    }

    return result
  }
}

function isRoot(html){
  return /^(<!doctype |<html)/i.test(html)
}

function getRoot(html){
  var match = /^(\W*)(<!doctype \w+>)?(\W*)(<html[^>]*>)/i.exec(html)
  if (match){
    var rootElement = getNode(match[4])
    var endIndex = html.lastIndexOf('<')
    var inner = html.slice(match[0].length, endIndex)
    setRootInner(rootElement, inner)
    return rootElement
  }
}

function setRootInner(rootElement, innerHtml){
  try {
    rootElement.innerHTML = innerHtml
  } catch (ex) {
    // handle silly IE
    var headMatch = /(<head[^>]*>)(.+)(<\/head>)/i.exec(innerHtml)
    var bodyMatch = /(<body[^>]*>)(.+)(<\/body>)/.exec(innerHtml)

    if (headMatch){
      var headElement = getNode(headMatch[1])
      var fakeHead = document.createElement('body')
      fakeHead.innerHTML = headMatch[2]
      for (var i=0;i<fakeHead.children.length;i++){
        headElement.appendChild(fakeHead.children[i])
      }
      rootElement.appendChild(headElement)
    }

    if (bodyMatch){
      var bodyElement = getNode(bodyMatch[1])
      bodyElement.innerHTML = bodyMatch[2]
      rootElement.appendChild(bodyElement)
    }
  }
}

function getNode(tag){
  var match = /^<(\w+)([^>]*)>/.exec(tag)
  if (match){
    var nodeName = match[1]
    var node = document.createElement(nodeName)

    if (match[2]){
      match[2].replace(/(\w+)(=('(.*)'|"(.*)"|(\w+))|\W|^)/g, function(_, name, a, b, v1, v2, v3){
        node.setAttribute(name, v1||v2||v3||null)
      })
    }

    return node
  }
}
