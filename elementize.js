module.exports = function elementize(node, original){

  if (typeof node == 'string'){

    var wrapper = document.createElement('div')
    node = module.exports.replace(node, original)
    wrapper.innerHTML = node
    return wrapper.firstChild

  } else if (Array.isArray(node)){

    // array of sub nodes passed in - wrap with same node original
    var wrapper = document.createElement('div')
    wrapper.setAttribute('data-nodeName', original.nodeName)
    node.forEach(function(element){
      wrapper.appendChild(element)
    })
    return wrapper

  } else {
    return node
  }
}

module.exports.replace = function(html, original){
  // handle issues with IE and not being able to set innerHTML on DOCUMENT, HTML, HEAD, and BODY nodes
  
  if (original.nodeName == 'HTML' || original.nodeName == 'HEAD'){
    html = html.replace(/<(html|head|meta|title|body)([>\s\\])/gi, "<div data-nodeName='$1'$2")
    html = html.replace(/<\/(html|head|meta|title|body)>/gi, '</div>')
  }

  if (original.nodeName == 'BODY'){
    html = html.replace(/<body([>\s\\])/i, "<div data-nodeName='body'$1")
    html = html.replace(/<\/body>/i, '</div>')
  }

  return html
}