subsequence-search
==================
[![Build Status](https://travis-ci.org/zeusdeux/subsequence-search.svg?branch=master)](https://travis-ci.org/zeusdeux/subsequence-search)

Search for a given subsequence in a list of strings and transform the resulting list as required.

It behaves a lot like the sublime text fuzzy search.

The resulting list can be transformed using chainable transforms.

Demo it [here](http://codepen.io/anon/pen/HvxlL).

###Installation

```javascript
npm install subsequence-search --save
```

###Usage

#####Node

Go ahead and `require('subsequence-search)` in `node` after installation.

#####Browser

After installation, serve:

- `subsequence-search.js` or
- `subsequence-search.min.js`

out of `node_modules/subsequence-search/build/`

In your browser code, go ahead and `require('subsequence-search)` to use it.

###API

####search(dataList, searchString, transforms)

- `dataList` is an array of `string`s that you want to match against
- `searchString` is the `string` you want to match against the `dataList`
- `transforms` is an `object` containing transform functions 
   - `transform` functions are applied *in order* to the data list got after matching `searchString` and `dataList`. (transforms are explained [later](#transforms))

E.g.,
```javascript
var subsearch = require('subsequence-search');
var data = ['there is some fog', 'have an apple', 'omg! potato?', 'foxes are kinda cool!'];
console.log(subsearch.search(data, 'fo', {
  rank: subsearch.transforms.rank,
  highlight: subsearch.transforms.highlight('highlightClass')
}));
//output
//["<span class="highlightClass">f</span><span class="highlightClass">o</span>xes are kinda cool!", "there is some <span class="highlightClass">f</span><span class="highlightClass">o</span>g"]
```

####transforms

The `transforms` object can hold multiple `transform` functions.

A `transform` is a `function` that accepts an `Array` and returns a transformed `Array`.

The `Array` received by a `transform` `function` is of the form of an `Array` returned by `String.prototype.match`.
For example:
```javascript
var subsearch = require('subsequence-search');
//lets say you have the following data
var data = ['there is some fog', 'have an apple', 'omg! potato?', 'foxes are kinda cool!'];
//and you do
subsearch.search(data, 'fo', {
  myTransform: function(list){
    console.log(list);
    return list;
  }
});
//then you get an array containing to arrays printed in your console
//see the image below
```
![data printed in console](http://i.imgur.com/UA3ZtND.png)

As you can see in the image, each item is the same as what you get when you do `'some string'.match(/^(s)(.*?)(e)(.*)$/)` i.e., a `match` with some capturing groups.

You can chain as many `transforms` as you want by passing them in the `transforms` object to the `search` call.

The only thing to keep in mind is that they are applied *in order*.

Keeping that in mind, you can do what you wish in those `transforms` to get the data in a format that is useful for your application.

`subsequence-search` ships with three transforms for your convenience. They are:

- `rank` : re-order the result to have most relevant results first
- `highlight`: accepts a `css` class and transforms the result set to encapsulate the matching letters in a `span` with the given `css class`.
- `noHighlight`: returns back plaintext matches

These are available on the `transforms` property on the object you get when you do `require('subsequence-search')` i.e.,

```javascript
var subsearch = require('subsequence-search');
//built in transforms:
//subsearch.transforms.rank
//subsearch.transforms.highlight(classname)
//subsearch.transforms.noHighlight
var data = ['there is some fog', 'have an apple', 'omg! potato?', 'foxes are kinda cool!'];
console.log(subsearch.search(data, 'fo', {
  rank: subsearch.transforms.rank,
  highlight: subsearch.transforms.highlight('highlightClass')
}));
//output
//["<span class="highlightClass">f</span><span class="highlightClass">o</span>xes are kinda cool!", "there is some <span class="highlightClass">f</span><span class="highlightClass">o</span>g"]
```

###Changelog

- 0.1.2
  + Fixed `package.json` (missing git repo)
- 0.1.1
  + Fixed documentation (added demo)
- 0.1.0
  + added chainable `transforms`
  + added test suite
