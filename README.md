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

## Some tips

When become is run on an element, it will remove any foreign elements (such as in-place editors and menus) that are not in the newContent. Adding `data-preserve='true'` to these elements will cause them to be ignored and worked around.

If you are wanting to add animations, it's a good idea to add `data-preserve-attribute='style'` to any elements you want to animate. This will ensure that the style is not overwritten mid-animation causing a horrible mess.

### Unique attribute option

You can help become know which elements are the same by setting the `uniqueAttribute` option.

```js
become(elementToUpdate, newContent, {
  uniqueAttribute: 'data-id'
})
```

Use this option if elements are likely to be reordered and moved around.