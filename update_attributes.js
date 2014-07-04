var attributeProperties = {
    "tabindex": "tabIndex",
    "readonly": "readOnly",
    "for": "htmlFor",
    "class": "className",
    "maxlength": "maxLength",
    "cellspacing": "cellSpacing",
    "cellpadding": "cellPadding",
    "rowspan": "rowSpan",
    "colspan": "colSpan",
    "usemap": "useMap",
    "frameborder": "frameBorder",
    "contenteditable": "contentEditable",
    "checked": 'checked',
    "disabled": 'disabled',
    "contenteditable": "contentEditable"
}

module.exports = function(node, attributes, options){
  if (node.setAttribute){

    var preserve = []
    if (attributes['data-preserve-attribute']){
      preserve = attributes['data-preserve-attribute'].split(' ')
    }

    if (options.ignoreAttributes){
      preserve = preserve.concat(options.ignoreAttributes)
    }

    var removeAttributes = []
    if (!options || !options.append){
      for (var i = 0; i < node.attributes.length; i++) {
        var attribute = node.attributes[i];
        if (attribute.specified && !~preserve.indexOf(attribute.name)) {
          if (attributes[attribute.name] == null || attributes[attribute.name] === ''){
            removeAttributes.push(attribute.name)
          }
        }
      }
    }
    Object.keys(attributes).forEach(function(k){
      if (k.charAt(0) !== '_'){
        var v = attributes[k]
        if (getAttribute(node, k) != v && !~preserve.indexOf(k)){
          setAttribute(node, k, v)
        }
      }
    })
    removeAttributes.forEach(function(k){
      removeAttribute(node, k)
    })
  }
}

function getAttribute(element, key){
  var directAttribute = attributeProperties[key.toLowerCase()]
  if (directAttribute){
    return element[directAttribute]
  } else {
    element.getAttribute(key)
  }
}

function setAttribute(element, key, value){
  if (canModify(element, key)){
    if (key === 'style'){
      element.style.cssText = value
    } else {
      var directAttribute = attributeProperties[key.toLowerCase()]
      if (directAttribute){
        element[directAttribute] = value
      } else {
        element.setAttribute(key, value)
      }
    }
  }
}

function removeAttribute(element, key){
  if (canModify(element, key)){
    if (key === 'style'){
      element.style.cssText = ''
      element.removeAttribute('style')
    } else {
      var directAttribute = attributeProperties[key.toLowerCase()]
      if (directAttribute){
        element[directAttribute] = ''
      }
      element.removeAttribute(key)
    }
  }
}

function canModify(element, key){
  return !element.preserveAttributes || !~element.preserveAttributes.indexOf(key)
}