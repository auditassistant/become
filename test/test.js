require('es5-shim')

var test = require('tape')
var become = require('../')

test('add class and wrap text', function(t){
  t.plan(1)

  var originalElement = document.createElement('div')
  originalElement.innerHTML = "Testing 123 <span>some stuff</span>"

  var newHtml = "<div class='test2'>Testing 123 <span><strong>some</strong> stuff</span></div>"

  become(originalElement, newHtml, {tolerance: 0})
  elementEqual(t, originalElement, newHtml)
})

test('add new elements', function(t){
  t.plan(1)

  var originalElement = document.createElement('ul')
  originalElement.innerHTML = "<li>Test 123</li><li>Test 1234</li>"

  var newHtml = "<ul><li>Test 123</li><li>Test 1234</li><li>Test 12345</li><li>Test 123456</li></ul>"

  become(originalElement, newHtml)
  elementEqual(t, originalElement, newHtml)
})

test('update element with whitespace padded', function(t){
  t.plan(1)

  var originalElement = document.createElement('ul')
  originalElement.innerHTML = "<li>Test 123</li> <li>Test 1234</li>"

  var newHtml = " <ul><li>Test 123</li> <li>Test 1234</li></ul> "

  become(originalElement, newHtml)
  elementEqual(t, originalElement, newHtml.trim())
})

test('swap elements with white space', function(t){
  t.plan(1)

  var rootElement = document.createElement('div')
  var originalElement = document.createElement('em')
  originalElement.innerHTML = "Test 1234"
  rootElement.appendChild(originalElement)
  rootElement.appendChild(document.createElement('span'))

  var newHtml = "<strong>Test 1234</strong>"

  become(originalElement, newHtml)
  elementEqual(t, rootElement, "<div>" + newHtml + "<span></span></div>")
})

test('update inner', function(t){
  t.plan(1)

  var originalElement = document.createElement('div')
  originalElement.innerHTML = "Some <strong>content</strong> and more stuff"

  var newHtml = "Some <strong>content</strong> and <em>more really cool</em> stuff"

  become(originalElement, newHtml, {tolerance: 0, inner: true})
  
  elementEqual(t, originalElement, '<div>' + newHtml + '</div>')
})

test('notify changes', function(t){
  t.plan(2)

  var originalElement = document.createElement('div')
  originalElement.innerHTML = "<div id='123' style='color: red'>Test Things</div> <div>Remove me</div>"

  var newHtml = "<div id='123'>Test <strong>Things</strong></div>"

  var expectedChanges = [ 
    { 
      action: 'data', 
      node: { nodeName: '#text', data: 'Test ' }, 
      changeInfo: { oldData: 'Test Things' } 
    }, { 
      action: 'append', 
      node: { nodeName: 'STRONG', attributes: {  } }, 
      changeInfo: {  } 
    }, { 
      action: 'update', 
      node: { nodeName: 'DIV', attributes: { id: '123' } }, 
      changeInfo: { oldAttributes: { style: 'color: red', id: '123' }, inner: true } 
    }, { 
      action: 'remove', 
      node: { nodeName: '#text', data: ' ' }, 
      changeInfo: {  } 
    }, { 
      action: 'remove', 
      node: { nodeName: 'DIV', attributes: {  } }, 
      changeInfo: {  } 
    }, { 
      action: 'update', 
      node: { nodeName: 'DIV', attributes: {  } }, 
      changeInfo: { inner: true } 
    } 
  ]


  var changes = []
  function notifyChange(action, node, changeInfo){
    if (node.nodeName === '#text'){
      changes.push({action: action, node: {nodeName: node.nodeName, data: node.data}, changeInfo: changeInfo})
    } else {
      changes.push({action: action, node: {nodeName: node.nodeName, attributes: getAttributes(node)}, changeInfo: changeInfo})
    }
  }

  become(originalElement, newHtml, {tolerance: 0, inner: true, onChange: notifyChange})
  
  t.deepEqual(changes, expectedChanges)
  
  elementEqual(t, originalElement, '<div>' + newHtml + '</div>')
})

test('add new elements (with spaces)', function(t){
  t.plan(1)

  var originalElement = document.createElement('ul')
  originalElement.innerHTML = "<li>Test 123</li><li>Test 1234</li>"

  var newHtml = "<ul><li>Test 123</li> <li>Test 1234</li> <li>Test 12345</li> <li>Test 123456</li></ul>"

  become(originalElement, newHtml)
  elementEqual(t, originalElement, newHtml)
})

test('insert same element', function(t){
  t.plan(1)

  var originalElement = document.createElement('div')
  originalElement.innerHTML = "<div>Test 123</div><div>Test 1234</div>"

  var newHtml = "<div><div>Test 123</div><div>Insert</div><div>Test 1234</div></div>"

  become(originalElement, newHtml)
  elementEqual(t, originalElement, newHtml)
})

test('insert same element with identifiers (test optimistic)', function(t){
  t.plan(3)

  var originalElement = document.createElement('div')
  originalElement.innerHTML = "<div id='1'>Test 123</div><div id='2'>Test 1234</div>"

  var node1 = originalElement.childNodes[0]
  var node2 = originalElement.childNodes[1]


  var newHtml = "<div><div id='1'>Test 123</div><div id='3'>Insert</div><div id='2'>Test 1234</div></div>"

  become(originalElement, newHtml, {tolerance: 0})
  elementEqual(t, originalElement, newHtml)

  t.ok(originalElement.childNodes[0] == node1, 'node 1 is still id 1')
  t.ok(originalElement.childNodes[2] == node2, "node 2 is still id 2")
})

test('insert different element', function(t){
  t.plan(1)

  var originalElement = document.createElement('div')
  originalElement.innerHTML = "<div>Test 123</div><div>Test 1234</div>"

  var newHtml = "<div><div>Test 123</div><span>Insert</span><div>Test 1234</div></div>"

  become(originalElement, newHtml)
  elementEqual(t, originalElement, newHtml)
})

test('reorder elements (test optimistic)', function(t){
  t.plan(3)

  var originalElement = document.createElement('div')
  originalElement.innerHTML = "<div id='1'>Test 123</div><div id='2'>Test 1234</div><div id='3'>Insert</div>"

  var node1 = originalElement.childNodes[0]
  var node2 = originalElement.childNodes[1]
  var node3 = originalElement.childNodes[2]

  var newHtml = "<div><div id='1'>Test 123</div><div id='3'>Insert</div><div id='2'>Test 1234</div></div>"

  become(originalElement, newHtml, {tolerance: 0})
  elementEqual(t, originalElement, newHtml)

  t.ok(originalElement.childNodes[0] == node1, 'node 1 is still id 1')
  t.ok(originalElement.childNodes[1] == node3, "node 3 is still id 3")
})

test('update html root', function(t){
  t.plan(1)

  var originalElement = document.createElement('html')
  var head = document.createElement('head')
  var title = document.createElement('title')
  title.innerHTML = 'Test'
  head.appendChild(title)
  var body = document.createElement('body')
  body.innerHTML = "Testing 123 <span>some stuff</span>"

  originalElement.appendChild(head)
  originalElement.appendChild(body)

  var newInnerHtml = "<div class='test2'>Testing 123 <span><strong>some</strong> stuff</span></div>"
  var newHtml = "<html><head><title>Test</title></head><body>" + newInnerHtml + "</body></html>"

  become(originalElement, newHtml, {tolerance: 0})

  var newWrapper = document.createElement('div')
  newWrapper.innerHTML = newInnerHtml
  t.equal(body.innerHTML, newWrapper.innerHTML)
})

function elementEqual(t, original, html, msg){
  var wrapperOriginal = document.createElement('div')
  wrapperOriginal.appendChild(original.cloneNode(true))

  var wrapperNew = document.createElement('div')
  wrapperNew.innerHTML = html

  t.equal(wrapperOriginal.innerHTML, wrapperNew.innerHTML, msg)
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