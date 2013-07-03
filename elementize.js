module.exports = function elementize(html, rootNode){
  var wrapper = document.createElement('div')
  html = module.exports.replace(html, rootNode)
  wrapper.innerHTML = html
  return wrapper.firstChild
}

module.exports.replace = function(html, rootNode){
  if (rootNode.nodeName == 'HTML' || rootNode.nodeName == 'HEAD'){
    html = html.replace(/<(html|head|meta|title|body)([>\s\\])/gi, "<div data-nodeName='$1'$2")
    html = html.replace(/<\/(html|head|meta|title|body)>/gi, '</div>')
  }

  if (rootNode.nodeName == 'BODY'){
    html = html.replace(/<body([>\s\\])/i, "<div data-nodeName='body'$1")
    html = html.replace(/<\/body>/i, '</div>')
  }

  return html
}