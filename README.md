subsequence-search
==================
[![Build Status](https://travis-ci.org/zeusdeux/subsequence-search.svg?branch=master)](https://travis-ci.org/zeusdeux/subsequence-search)

Search for a given subsequence in a list of strings and transform the resulting list as required.

Out of the box it can be made to behave a lot like the sublime text fuzzy search.

The resulting list can be transformed using chainable [transforms](#transforms).

Demo it [here](http://codepen.io/anon/pen/HvxlL).

###Installation

```javascript
npm install subsequence-search --save
```

or

```javascript
bower install subsequence-search --save
```

###Usage

#####Node

Go ahead and `require('subsequence-search)` in your `node` program after installation.

#####Browser

After installation, serve:

- `subsequence-search.js` or
- `subsequence-search.min.js`

out of `node_modules/subsequence-search/build/`

In your browser code, go ahead and use `window.subsequenceSearch` to use it globally

or

If you use a UMD compatible loader like `require.js` then go ahead and `require('subsequence-search')`.

>The `search` as well as the built-in `transform` functions, all [auto-curry](https://github.com/zeusdeux/auto-curry)
>when given an incomplete set of arguments. Therefore, you can make reusable
>curried versions of those methods.
>For example, `search` that works on some fixed input `dataList` and fixed set
>of `transforms` but for varying `searchString`.
>Cleaner, composable code should be the result.

###API

####search(dataList, transforms, searchString)

- `dataList` is an array of `string`s that you want to match against
- `searchString` is the `string` you want to match against the `dataList`
- `transforms` is an `object` containing `transform` functions (`transforms` are explained [later](#transforms))
   - `transform` functions are applied *in order* to the data list got after matching `searchString` and `dataList`.

E.g.,
```javascript
var subsearch = window.subsequenceSearch; //or require('subsequence-search') in node
var data = ['there is some fog', 'have an apple', 'omg! potato?', 'foxes are kinda cool!'];

console.log(subsearch.search(data, {
  rank: subsearch.transforms.rank,
  highlight: subsearch.transforms.highlight('highlightClass')
}, 'fo'));
//output
//["<span class="highlightClass">f</span><span class="highlightClass">o</span>xes are kinda cool!", "there is some <span class="highlightClass">f</span><span class="highlightClass">o</span>g"]
```

####transforms

The `transforms` object can hold multiple `transform` functions.

A `transform` is a `function` that accepts an `Array` and returns a transformed `Array`.

The `Array` received by a `transform` `function` is of the form of an `Array` returned by `String.prototype.match`.

For example:
```javascript
var subsearch = window.subsequenceSearch; //or require('subsequence-search') in node
//lets say you have the following data
var data = ['there is some fog', 'have an apple', 'omg! potato?', 'foxes are kinda cool!'];
//and you do
subsearch.search(data, {
  myTransform: function(list){
    console.log(list);
    return list;
  }
}, 'fo');
//then you get an array containing to arrays printed in your console
//see the image below
```
![data printed in console](http://i.imgur.com/UA3ZtND.png)

As you can see in the image, each item is the same as what you get when you do
```javascript
'some string'.match(/^(s)(.*?)(e)(.*)$/);
```
i.e., a `String.prototype.match` with some capturing groups.

You can chain as many `transform` functions as you want by passing them in the `transforms` object to the `search` call.

The only thing to keep in mind is that they are applied *in order*.

Keeping that in mind, you can do what you wish in those `transform` functions to get the data in a format that is useful for your application.

`subsequence-search` ships with three `transform` functions for your convenience. They are:

- `rank` : returns a re-ordered `Array` that has the most relevant results higher in the list
- `highlight`: accepts a `css` class and transforms the result set to encapsulate the matching letters in a `span` with the given `css` class
   - it returns an array of strings
- `noHighlight`: returns back an array of plaintext matches

These are available on the `transforms` property on the object you get when you do `require('subsequence-search')` i.e.,

```javascript
var subsearch = window.subsequenceSearch; //or require('subsequence-search') in node
//built in transforms:
//subsearch.transforms.rank
//subsearch.transforms.highlight(classname)
//subsearch.transforms.noHighlight
var data = ['there is some fog', 'have an apple', 'omg! potato?', 'foxes are kinda cool!'];

console.log(subsearch.search(data, {
  rank: subsearch.transforms.rank,
  highlight: subsearch.transforms.highlight('highlightClass')
}, 'fo'));
//output
//["<span class="highlightClass">f</span><span class="highlightClass">o</span>xes are kinda cool!", "there is some <span class="highlightClass">f</span><span class="highlightClass">o</span>g"]
```

###Compatibility
`subsequence-search` is compatible with browsers that are ES5 compliant.

It uses `map`, `reduce`, `filter`, etc heavily so if you need to use `subsequence-search` on older browsers, use a [shim](https://github.com/es-shims/es5-shim).

###Changelog
- 0.2.0
  + Changed the `search` signature to `search(dataList, transforms, searchString)` to enable users to curry it more effectively
  + Added `bower` support
  + Refactored some code
  + Update [auto-curry](https://github.com/zeusdeux/auto-curry/) dependency
  + Jsdoc-ed them files
- 0.1.4
  + Subsequence is now searched for, non-greedily from the beginning of input string
- 0.1.3
  + Change the order in which inputs are validated in `index.js`
  + Added some more comments
- 0.1.2
  + Fixed `package.json` (missing git repo)
- 0.1.1
  + Fixed documentation (added demo)
- 0.1.0
  + added chainable `transforms`
  + added test suite
