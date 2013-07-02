become
===

[![browser support](https://ci.testling.com/mmckegg/become.png)](https://ci.testling.com/mmckegg/become)

Transform target DOM elements to become incoming HTML. 

Useful for faking realtime updates on a page. The module performs a diff against the original element and the new html and will only update the nodes that have actually changed.

## Install

```bash
$ npm install become
```

## Example

```html
<body>
  <div id='update'>
    Testing 123 <span>some stuff</span>
  </div>
</body>
```

```js
var become = require('become')

var elementToUpdate = document.querySelector('div#update')
var newContent = "<div id='update' class='something'>" + 
    "Testing 123 <span>some <strong>stuff</strong></span>" + 
  "</div>"

become(elementToUpdate, newContent)
```

This example adds the class "something" to the element and wraps the word 'stuff' with strong tags. No other nodes will be touched.