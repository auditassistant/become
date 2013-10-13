//TODO: support excluding nodes (e.g. sub templates)

var dommer = require('./dommer')
var updateAttributes = require('./update_attributes')
var elementize = require('./elementize')

var adiff = require('adiff')({equal: function(a, b){
  if(!a && !b) return true
  if(a && !b) return false
  return a.path === b.path && a.type === b.type && equal(a.value, b.value)
}})

function equal(a,b){
  if(a && !b) return false
  if(Array.isArray(a))
    if(a.length != b.length) return false
  if(a && 'object' == typeof a) {
    for(var i in a)
      if(i in a && !equal(a[i], b[i])) return false
    for(var i in b)
      if(i in b && !equal(a[i], b[i])) return false
    return true
  }
  return a == b
}

module.exports = function(original, become, options){
  // options: uniqueAttribute

  become = elementize(become, original) // normalize format (html, node, array of nodes)

  var a = dommer(original, options)
  var b = dommer(become, options)

  var difference = adiff.diff(a, b).reverse()

  difference.forEach(function(diff, i){

    var after = a[diff[0] - 1]

    if (diff[2]){
      insert(after, diff.slice(2))
    }

    if (diff[1]){
      remove(a.slice(diff[0], diff[0] + diff[1]))
    }

  })

}

function insert(after, toInsert){

  var target = [after.element]

  if (after.type == 'end'){
    target = [after.element.parentNode, after.element]
  }

  toInsert.forEach(function(ref){
    if (ref.type == 'element'){
      var element = document.createElement(ref.value)
      insertNode(element, target)
      target = [element]
    } else if (ref.type == 'text'){
      var text = document.createTextNode(ref.value)
      insertNode(text, target)
      target = [target[0], text] 
    } else if (ref.type == 'attr'){
      updateAttributes(target[0], ref.value)
    } else if (ref.type == 'end'){
      target = [target[0].parentNode, target[0]]
    }
  })
}

function remove(toRemove){
  toRemove.forEach(function(ref){
    if (ref.type == 'element' || ref.type == 'text'){
      if (ref.element.parentNode){
        ref.element.parentNode.removeChild(ref.element)
      }
    }
  })
}

function insertNode(node, target){
  if (!target[0].hasChildNodes() || target[0].lastChild === target[1]){
    target[0].appendChild(node)
  } else if (target[1]) {
    target[0].insertBefore(node, target[1].nextSibling)
  } else {
    target[0].insertBefore(node, target[0].firstChild)
  }
}

