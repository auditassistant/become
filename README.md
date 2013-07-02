become
===

Transform target DOM elements to become incoming HTML. 

Useful for faking realtime updates on a page. You can rerender as little or as much of the html as you like and the page will only update the nodes that have actually changed.

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
    Testing 123 <span>some <strong>stuff</strong></span>" + 
  "</div>"

become(elementToUpdate, newContent)
```

This example adds the class "something" to the element and wraps the word 'stuff' with strong tags. No other nodes will be touched.