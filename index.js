var elementize = require('elementize')
var attributeUpdate = require('./update_attributes')

module.exports = function(original, become, options){
  // options: tolerance, ignoreAttributes, onChange, inner

  options = options || {}

  original = elementize(original)
  become = elementize(become)

  if (options.inner){
    var wrapper = original[0].cloneNode(false)
    for (var i=0;i<become.length;i++){
      wrapper.appendChild(become[i])
    }
    become = [wrapper]
  }

  var tolerance = options.tolerance == null ? 50 : options.tolerance
  var ignoreAttributes = options.ignoreAttributes || []
  var notifyChange = options.onChange || function(){}

  var changedNodes = []

  var length = Math.max(original.length, become.length)

  var offset = 0

  for (var i=0;i<length;i++){

    if (shouldPreserve(original[i+offset])){
      offset += 1
      length = Math.max(original.length-offset, become.length)
    }

    var a = original[i+offset]
    var b = become[i]

    var origin = a

    while (a || b){
      var diff = difference(a, b, ignoreAttributes, tolerance)
      if ('equal' == diff){
        next()
      } else if (!beOptimistic()) {

        if ('data' == diff){
          updateData()
        } else if ('object' == typeof diff) {

          // push for notify on stepOut
          if (diff.inner || diff.attributes){
            changedNodes.push(a)
          }

          if (diff.attributes){
            updateAttributes()
          }

          if (diff.near){
            if (updateInner()){
              next()
            } else {
              stepIn()
            }
          } else if (diff.inner) {
            stepIn()
          } else {
            next()
          }

        } else {
          replace()
          next()
        }
      }
    }

  }

  function beOptimistic(){
    // check if the next node on either side is a match
    var aNext = nextSibling(a)
    var bNext = nextSibling(b)

    var diff = difference(aNext, b, ignoreAttributes)
    if ('equal' == diff){
      a.parentNode.removeChild(a)
      notifyChange('remove', a)
      setA(aNext)
      next()
      return true
    } else {
      var diff = difference(a, bNext, ignoreAttributes)
      if ('equal' == diff){
        var bNew = b.cloneNode(true)
        a.parentNode.insertBefore(bNew, a)
        notifyChange('append', bNew)
        setA(bNew)
        next()
        return true
      }
    }
  }

  function checkChanged(node){
    if (~changedNodes.indexOf(node)){
      notifyChange('update', node)
    }
  }

  function next(){
    checkChanged(a)

    if (a === origin){
      a = null
      b = null
    } else if (nextSibling(a) && nextSibling(b)){
      a = nextSibling(a)
      b = nextSibling(b)
    } else if (!nextSibling(a) && !nextSibling(b)){
      a = a.parentNode || document
      b = b.parentNode
      next()
    } else {

      if (nextSibling(a)){
        var remove = null
        while (remove = nextSibling(a)){
          a.parentNode.removeChild(remove)
          notifyChange('remove', remove)
        }
        a = a.parentNode || document
        b = b.parentNode

      } else if (nextSibling(b)){
        var container = a.parentNode
        b = nextSibling(b)
        a = b.cloneNode(true)

        container.appendChild(a)
        notifyChange('append', a)
      }

      next()
    }
  }

  function stepIn(){
    if (firstChild(a) && firstChild(b)){
      a = firstChild(a)
      b = firstChild(b)
    } else if (!firstChild(a) && !firstChild(b)){
      next()
    } else if (!firstChild(a) || !firstChild(b)){
      updateInner()
      next()
    }
  }

  function setA(value){
    if (a === origin){
      origin = value
    }
    a = value
  }


  function updateInner(){
    try {
      a.innerHTML = b.innerHTML
    } catch (ex){
      return false
    }
    
    notifyChange('inner', a)
    return true
  }

  function updateAttributes(){
    attributeUpdate(a, getAttributes(b), {ignoreAttributes: ignoreAttributes})
  }

  function updateData(){
    a.data = b.data
    notifyChange('data', a)
  }

  function replace(){
    if (b){
      var newNode = b.cloneNode(true)
      if (!a){
        insertAfter(newNode, original[original.length-1])
      } else {
        ;(a.parentNode || document).replaceChild(newNode, a)
        notifyChange('remove', a)
      }

      notifyChange('append', newNode)
      setA(newNode)
    }
  }

}


function difference(a, b, ignoreAttributes, tolerance){

  if (!a || !b){
    return 'fail'
  }

  if (a.nodeType === b.nodeType){

    if (a.nodeType === 1){
      var aOuter = stripAttributes(a.outerHTML, ignoreAttributes)
      var bOuter = stripAttributes(b.outerHTML, ignoreAttributes)

      if (aOuter === bOuter){
        return 'equal'
      } else {

        var aStartIndex = aOuter.indexOf('>'), bStartIndex = bOuter.indexOf('>')
        var aEndIndex = aOuter.lastIndexOf('<'), bEndIndex = bOuter.lastIndexOf('<')
        var startA = aOuter.slice(0, aStartIndex+1), startB = bOuter.slice(0, bStartIndex+1)
        var innerA = aOuter.slice(aStartIndex+1, aEndIndex), innerB = bOuter.slice(bStartIndex+1, bEndIndex)

        if (a.nodeName == b.nodeName){

          var diff = {}

          if (startA !== startB){
            diff.attributes = true
          }

          if (innerA != innerB){
            diff.inner = true
            var containsPreserve = !!~innerA.indexOf('data-preserve')
            var withinTolerence = (innerA.length < (tolerance||0) || innerB.length < (tolerance||0))
            if (!containsPreserve && withinTolerence){
              diff.near = true
            }
          }

          if (Object.keys(diff).length){
            return diff
          }
        }

      }

    } else if (a.nodeType === 3 || a.nodeType == 8){
      if (a.data == b.data){
        return 'equal'
      } else {
        return 'data'
      }
    }

  }


  return 'all'
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

var regExpCache = {}
function stripAttributes(html, attributes){
  if (attributes && attributes.length){
    var key = attributes.join(';')
    if (!regExpCache[key]){
      regExpCache[key] = new RegExp(' (' + attributes.join('|') + ')="([^"]*)"', 'g')
    }
    return html.replace(regExpCache[key], '')
  } else {
    return html
  }
}

function nextSibling(node){
  if (node){
    var next = node.nextSibling
    if (shouldPreserve(next)){
      return nextSibling(next)
    } else {
      return next
    }
  }
}

function insertAfter(node, after){
  if (after.nextSibling){
    after.parentNode.insertBefore(node, after.nextSibling)
  } else {
    after.parentNode.appendChild(node)
  }
}

function firstChild(node){
  var child = node.firstChild
  if (shouldPreserve(child)){
    return nextSibling(child)
  } else {
    return child
  }
}

function shouldPreserve(node){
  if (node && node.getAttribute){
    var value = node.getAttribute('data-preserve')
    return (value === '' || value === 'true' || value === 'preserve')
  }
}