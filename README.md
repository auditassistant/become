become
===

[![browser support](https://ci.testling.com/mmckegg/become.png)](https://ci.testling.com/mmckegg/become)

Transform target DOM elements to become incoming HTML. 

Useful for faking realtime updates on a page. This module works a lot like setting `innerHTML` but will **only** update the nodes that have actually **changed**.

[![NPM](https://nodei.co/npm/become.png?compact=true)](https://nodei.co/npm/become/)

## API

```js
var become = require('become')
```

### become(`original`, `newHtml`, `options`)

**`original`**: A `Node`, array of Nodes or `NodeList` that you want to update

**`newHTML`**: The new html you would like replace the original with.

**options:**

- `ignoreAttribtutes`: An `Array` of attributes to ignore and leave in place (e.g. add style to ensure animations work correctly)
- `inner`: (default `false`) Update the innerHTML of `original` instead of the outer.
- `tolerance`: (default `50`) An integer that represents the minimum size innerHTML to search for inner changes. Higher values may increase speed, but won't be as precise.
- `onChange`: calls `function(action, node)` every time this module makes a change to the DOM.

## Example

```html
<html>
  <head>
    <title>Page</title>
  <body>
    <div id='update'>
      Testing 123 <span>some stuff</span>
    </div>
  </body>
</html>
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

You can also use become to update the entire dom with a new one, but only updating the elements that have changed:

```js
var become = require('become')
var request = require('request')

function softRefresh(){
  request(window.location.href, function(err, res, content){
    become(document, content)
  })
})
```

## Some tips

When become is run on an element, it will remove any foreign elements (such as in-place editors and menus) that are not in the newContent. Adding `data-preserve` to these elements will cause them to be ignored and worked around.

If you are wanting to add animations, it's a good idea to add `data-preserve-attribute='style'` to any elements you want to animate. This will ensure that the style is not overwritten mid-animation causing a horrible mess.