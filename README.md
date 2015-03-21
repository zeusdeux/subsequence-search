subsequence-search
==================
[![Build Status](https://travis-ci.org/zeusdeux/subsequence-search.svg?branch=master)](https://travis-ci.org/zeusdeux/subsequence-search)

Search for a given subsequence in a list of strings and transform the resulting list as required.

Out of the box it can be made to behave a lot like the sublime text fuzzy search.

The resulting list can be transformed using chainable [transforms](#transforms).

Demo it [here](http://codepen.io/zeusdeux/pen/WbwNJE).
Demo showing special character support is [here](http://codepen.io/zeusdeux/pen/emzery?editors=101).

### Installation

```javascript
npm install subsequence-search --save
```

or

```javascript
bower install subsequence-search --save
```

### Usage

##### Node

Go ahead and `require('subsequence-search)` in your `node` program after installation.

##### Browser

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

### API

#### search(transforms, dataList, searchString)

- `transforms` is an `object` containing `transform` functions (`transforms` are explained [later](#transforms))
  + `transform` functions are applied *in order* to the data list got after matching `searchString` and `dataList`.

- `dataList` is an array of `string`s that you want to match against or an` object` (__that has no circular references__) with `data` and `searchInProps` properties.
  + `data` is an `Array` of objects
  + `searchInProps` is an `Array` of the properties that you want to search for the `searchString` in. They should be valid properties contained in the each object in the `data` array
  + example
    ```javascript
    dataList = ['some string', 'some other string', 'oh look, another string'];
    /* OR */
    dataList = {
      data: [
              {id: 1, text: 'some string'},
              {id: 2, text: 'some other string'},
              {id: 3, text: 'oh look, another string'}
            ],
      searchInProps: ['text']
    };

    /* both of the above are valid dataList inputs */
    ```
  + `searchInProps` must only have properties that have `string` data

- `searchString` is the `string` you want to match against the `dataList`

`search` usage example:
```javascript
var subsearch = window.subsequenceSearch; //or require('subsequence-search') in node
var data1 = ['there is some fog', 'have an apple', 'omg! potato?', 'foxes are kinda cool!'];
var data2 = {
  data: [
    {a: 10, b: 'some text'},
    {a: 10, b: 'some more text'},
    {a: 200, b: 'you shall not pass?'}
  ],
  searchInProps: ['b']
};

console.log(subsearch.search({
  rank: subsearch.transforms.rank(0),
  highlight: subsearch.transforms.highlight('highlightClass')
}, data1, 'fo'));

/* output */
/* [
      '<span class="highlightClass">f</span><span class="highlightClass">o</span>xes are kinda cool!',
      'there is some <span class="highlightClass">f</span><span class="highlightClass">o</span>g'
    ]
  */

/*
 * Lets see another example where the dataList is an object.
 * Also, let's use the noHighlight transform instead of highlight transform.
 */
console.log(subsearch.search({
  rank: subsearch.transforms.rank('b'),
  noHighlight: subsearch.transforms.noHighlight
}, data2, 'text'));

/* output is shown in the image below */
```
![output of using subsequence.search on an object with rank and noHighlight transforms](http://i.imgur.com/msOJCwU.png)

As you can see in the image, the input object structure is maintained and the properties that you search on are ranked (and modified if required, for e.g., by the highlight transform) in place.

You can write a custom transform to pick out only the `data` property from that object if required. Example:

```javascript
console.log(subsearch.search({
  rank: subsearch.transforms.rank('b'),
  noHighlight: subsearch.transforms.noHighlight,
  pluckData: function(dataList){
    return dataList.data;
  }
}, data2, 'text'));

/* the output is in the image below */
```
![output of using a custom transform to pluck data out](http://i.imgur.com/DyxGeob.png)

### Transforms

`transforms` is an object can hold multiple `transform` functions.

It's modelled as an `Object` and not an `Array` for readability purposes (it helps to enforce naming of your function to explain what it does).

A `transform` is a `function` that accepts a `dataList` and returns transformed data.

A `dataList`, as mentioned before, is either:

- An `Array` of `String`s or
- An `Object` containing a `data` property and a `searchInProps` property

When the input to `search` is an array of strings, the `dataList` received by a `transform` `function` is of the form of an array returned by `String.prototype.match`.

For example:
```javascript
var subsearch = window.subsequenceSearch; //or require('subsequence-search') in node
//lets say you have the following data
var data = ['there is some fog', 'have an apple', 'omg! potato?', 'foxes are kinda cool!'];
//and you do
subsearch.search({
  myTransform: function(list){
    console.log(list);
    return list;
  }
}, data, 'fo');
//then you get an array containing to arrays printed in your console
//see the image below
```
![data printed in console](http://i.imgur.com/UA3ZtND.png)

As you can see in the image, each item is the same as what you get when you do
```javascript
'some string'.match(/^(s)(.*?)(e)(.*)$/);
```
i.e., a `String.prototype.match` with some capturing groups.

When the input to `search` is an `Object` that has the same shape as a `dataList` object (i.e., it has `data` and `searchInProps` properties), the `dataList` received by a `transform` is of the same shape and form as the input `dataList` with its `searchInProps` data modified in place (if needed).

Example:

![transform output when input is a dataList object](http://i.imgur.com/KGJS8LB.png)

[Transforms](#transforms) are applied *in order*. This is *very* important to remember while writing custom transforms so that you can match the output of one to the input of another.

You can chain as many `transform` functions as you want by passing them in the `transforms` object to the `search` call. The only requisite for chaining is that, the output of the *nth* transform should be in a form that is consumable by the *(n+1)th* transform (since they are applied in order.)

Keeping that in mind, you can do what you wish in those `transform` functions to get the data in a format that is useful for your application.

`subsequence-search` ships with three `transform` functions for your convenience. They are:

- `rank` : returns a re-ordered `dataList` that has the most relevant results higher in the list. It takes the following parameter:

  + `rankByKey` - the key/property/index to rank by.
    * When `dataList` is an `Array` of `String`s, this can be `0`
    * When `dataList` is an `Object` with `data` and `searchInProps`, then this can be any property in the objects contained in `data` array

- `highlight`: accepts a `css` class and transforms the result set to encapsulate the matching letters in a `span` with the given `css` class

  + its return value has the same shape as the input that was given to it

- `noHighlight`: returns back an array of plaintext matches

- `noResults`: returns a `string` that the user provides as input or default string ('No results found.') when input search string isn't found in input data

These are available on the `transforms` property on the object you get when you do `require('subsequence-search')` i.e.,

```javascript
var subsearch = window.subsequenceSearch; //or require('subsequence-search') in node
//built in transforms:
//subsearch.transforms.rank
//subsearch.transforms.highlight(classname)
//subsearch.transforms.noHighlight
var data = ['there is some fog', 'have an apple', 'omg! potato?', 'foxes are kinda cool!'];

console.log(subsearch.search({
  rank: subsearch.transforms.rank(0),
  highlight: subsearch.transforms.highlight('highlightClass'),
  noResults: subsearch.transforms.noResults('No results found for your input.')
}, data, 'fo'));
//output
//["<span class="highlightClass">f</span><span class="highlightClass">o</span>xes are kinda cool!", "there is some <span class="highlightClass">f</span><span class="highlightClass">o</span>g"]
```

### Compatibility
`subsequence-search` is compatible with browsers that are ES5 compliant and Node.js > `0.10.x`.

It uses `map`, `reduce`, `filter`, etc heavily so if you need to use `subsequence-search` on older browsers, use a [shim](https://github.com/es-shims/es5-shim).

### Changelog
- 1.0.1
  + Fixed readme for `npm` website
- 1.0.0
  + Since `0.3.4` has been in production usage for quite a while, promoting it to stable
- 0.3.4
  + Fixed a bug where an empty string as the input string would mess with the ranking algorithm
  + Added `clone` as a dependency for deep cloning, cycle detection, etc
- 0.3.3
  + Added a new transform called the `noResults` transform. This transform accepts a string that is displayed when no results are found

   ```javascript
   var s = window.subsequenceSearch.search({ noResults: window.subsequenceSearch.transforms.noResults('No results found.')});
   ```
   + Fixed the `rank` transform. It now calculates grouping score correctly
   + Fixed `searchString` with special characters ('*', '+', '(', etc) breaking `subsequence-search`
- 0.3.2
  + Built in a workaround for the instability of `Array.prototype.sort` implemented by browser vendors
- 0.3.1
  + Bugfixes
    * The way `subsequence-search` handled an empty `searchString` is now fixed and should work as a user would expect it to
- 0.3.0
  + Nuked my whole repo thanks to Google Drive and my idiocy and hence npm won't be able to download previous versions since technically they don't exist anymore. GOD DAMN IT! My apologies. :(
  + Massive rewrite to add support for `dataList` to be an object with shape

    ```javascript
      var dataList = {
        data: [ ...objects... ],
        searchInProps: [ ...properties in objects given above... ]
      };
    ```
  + Changed the signature for `search`. `transforms` object is now the first parameter. This signature, combined with the fact that `search` auto-curries, you can produce a custom search function with a particular `transform` sequence just once and use it whenever you need by supplying the remaining two parameters. Example:
    ```javascript
      var subsearch = window.subsequenceSearch; //or require('subsequence-search');
      var dataList = {
        data: [
          {a: 10, 'text': 'some text'},
          {a: 10, 'text': 'some more text'},
          {a: 200, 'text': 'you shall not pass?'}
        ],
        searchInProps: ['text']
      };
      var rankAndNohighlightSearch = subsearch.search({
        rank: subsearch.transforms.rank('text'),
        noHighlight: subsearch.transforms.noHighlight
      });

      console.log(rankAndNohighlightSearch(dataList, 'some'));
    ```

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
