!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.subsequenceSearch=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function cu(fn) {
  'use strict';
  var args = [].slice.call(arguments);

  if ('function' !== typeof fn) throw new Error('auto-curry: Invalid parameter. First parameter should be a function.');
  if ('function' === typeof fn && !fn.length) return fn;
  if (args.length - 1 >= fn.length) return fn.apply(this, args.slice(1));
  return function() {
    var tempArgs = args.concat([].slice.call(arguments));
    return cu.apply(this, tempArgs);
  };
};

},{}],2:[function(require,module,exports){
var util        = require('./util');
var cu          = require('auto-curry');
var messages    = require('./messages');
var rank        = require('./transforms/rank');
var highlight   = require('./transforms/highlight');
var noHighlight = require('./transforms/noHighlight');

/*
 * search :: Array -> Object -> String -> Array
 */

/**
 * This is the interface to subsequence-search.
 * It searches for a pattern in a list of strings.
 * @param  {Array}  dataList       List of string to search
 * @param  {Object} transforms     Object of transforms to perform on resulting list
 * @param  {String} searchString   Pattern to search for
 * @return {Array}                 List of matched, transformed strings
 */
function search(dataList, transforms, searchString) {
  var resultList;

  //validating inputs
  if (!dataList || !(dataList instanceof Array)) throw new SyntaxError(messages.DataMustBeArray);
  if (dataList.length <= 0) return dataList;
  if (dataList.filter(function(v) {
    return 'string' !== typeof v;
  }).length) throw new SyntaxError(messages.DataMustBeStringArray);

  if ('string' !== typeof searchString) throw new SyntaxError(messages.SearchStringMustBeString);

  if (!transforms || !Object.keys(transforms).length) {
    console.warn(messages.NoTransformsWarning);
    transforms = {};
  }
  //validations done
  //start actual logic
  if (searchString) {
    //get matched list
    resultList = util.getMatchedList(dataList, util.getRegex(searchString));
    //remove all `null` elements from array
    resultList = resultList.filter(function(v) {
      return !!v;
    });
    //apply transforms
    Object.keys(transforms).forEach(function(v) {
      v = transforms[v];
      if ('function' !== typeof v) throw new SyntaxError(messages.TransformMustBeSingleArgFunction);
      resultList = v(resultList);
    });
    //return result
    return resultList;
  }
  //return data as is
  else return dataList;
}

module.exports = {
  search: cu(search),
  transforms: {
    rank: rank,
    highlight: highlight,
    noHighlight: noHighlight
  }
};

},{"./messages":3,"./transforms/highlight":4,"./transforms/noHighlight":5,"./transforms/rank":6,"./util":7,"auto-curry":1}],3:[function(require,module,exports){
module.exports={
  "DataMustBeArray": "Data given to search function must be an array",
  "DataMustBeStringArray": "Data given to search function must be an array of strings",
  "SearchStringMustBeString": "Search string provided to search function must be a string",
  "TransformMustBeSingleArgFunction": "Transforms must be a valid function taking one parameter and returing an array",
  "NoTransformsWarning": "You haven't passed any transforms. You might want to atleast pass highlight or noHighlight to get a usable output (array of strings)."
}
},{}],4:[function(require,module,exports){
var cu = require('auto-curry');

/*
 * type Classname = String
 * getHighlightedString :: Array -> Classname -> String
 */

/**
 * Adds a span with provided class around matched characters
 * @param  {Array}  arr       A matched array
 * @param  {String} className A css class name
 * @return {String}           A string with matched character surrounded by span with given css class name
 */
function getHighlightedString(arr, className) {
  if (arr && arr.length > 0) {
    return arr.map(function(v, i) {
      if (i % 2 !== 0 && i !== arr.length - 1) return '<span class="' + className + '">' + v + '</span>';
      else return v;
    }).join('');
  }
}

/*
 * getHighlightedResultsList :: String -> Array -> Array
 */

/**
 * Gives back a transformed list of strings which contain matched items surrounded by span tags and given
 * css class
 * @param  {String} className Valid css class name
 * @param  {Array}  dataList  List of matched items
 * @return {Array}            List of transformed, highlighted (by given class name) strings
 */
function getHighlightedResultsList(className, dataList) {
  return dataList.map(function(v) {
    //slicing first el cuz it has the full matched string
    return getHighlightedString(v.slice(1), className);
  });
}

module.exports = cu(getHighlightedResultsList);

},{"auto-curry":1}],5:[function(require,module,exports){
var cu = require('auto-curry');

/*
 * getResultsList :: Array -> Array
 */

/**
 * Transforms input list into a list of usable strings
 * @param  {Array} dataList   List of matched items
 * @return {Array}            List of matched strings
 */
function getResultsList(dataList) {
  return dataList.map(function(v) {
    return v.slice(1).join(''); //slicing first el cuz it has the full matched string
  });
}

module.exports = cu(getResultsList);

},{"auto-curry":1}],6:[function(require,module,exports){
var cu = require('auto-curry');


/*
 * How it works:
 *
 * Indices array is:
 * [31, 35, 36, 40]
 * (31-31) (35-31) (36-31) (40 - 31) = 18
 *    0       4       5        9     = 18 (this number denotes loose/tight grouping)
 * closely grouped matches have a higher rank than
 * loosely grouped matches in this scheme
 * getRank :: Array -> Int
 */

/**
 * Gives a rank based on indices of capture
 * @param  {Array} indicesArray An array of indices of capture groups
 * @return {Int}                The rank of the current list item being ranked
 */
function getRank(indicesArray) {
  var firstElementIndex;
  var groupingScore;

  if (indicesArray) {
    firstElementIndex = indicesArray[1];
    groupingScore = indicesArray
    //get all odd indices
    .filter(function(v, i) {
      return i % 2 !== 0;
    })
    //remove last element (corresponds to last capture group in regex i.e., .*)
    .slice(0, -1)
    //get distance from first capture group index
    .map(function(v) {
      return v - firstElementIndex;
    })
    //sum grouping up to get grouping score
    .reduce(function(p, c) {
      return p + c;
    }, 0);
    //make a small number larger so that
    //a large rank means that it should be
    //higher in the list
    //(negative smaller number is greater than negative bigger number)
    return groupingScore * -1;
  }
  else return 9999999;
}

/*
 * gets the indices of where the capture groups matched in the
 * source string
 * type RegexCapturesArray = Array
 * getIndicesOfCaptures :: String -> RegexCapturesArray -> Array
 */

/**
 * Get the indices where capture groups have matched
 * @param  {String} inputString   Untouched input string
 * @param  {Array} matchedArray   Array that is a result of running a regexp on input string
 * @return {Array}                Array of indices of capture groups
 */
function getIndicesOfCaptures(inputString, matchedArray) {
  var currIndex;

  if (matchedArray) {
    currIndex = matchedArray.index; //index of first regex match
    if (matchedArray[0] === inputString) matchedArray = matchedArray.slice(1);
    return matchedArray.map(function(v) {
      var index = inputString.indexOf(v, currIndex);
      currIndex += v.length;
      return index;
    });
  }
}

/*
 * sort the input array and return the result as a new array
 * no mutation
 * getRankedList :: Array -> Array
 */

/**
 * Transform an unranked list into a ranked list based on proximity,
 * tightness of grouping and string length.
 * @param  {Array} dataList   List of matched items (got from util.getMatchedList)
 * @return {Array}            List of ranked matched strings
 */
function getRankedList(dataList) {
  //create a duplicate of dataList to prevent
  //mutation of Array pointed to by dataList as `sort` is in-situ
  var tempDataList = dataList.slice(0);

  return tempDataList.sort(function(a, b) {
    var aIndices = getIndicesOfCaptures(a[0], a);
    var bIndices = getIndicesOfCaptures(b[0], b);
    var aRank = getRank(aIndices);
    var bRank = getRank(bIndices);

    //rank higher? put el before
    if (aRank > bRank) return -1;
    //rank lower? put el after
    else if (aRank < bRank) return 1;
    //ranks equal?
    //The matched string with first match closer to beginning of source string ranks higher
    //ie., the smaller the index of the first capture group the higher it ranks
    else {
      if (aIndices[1] < bIndices[1]) return -1;
      else if (aIndices[1] > bIndices[1]) return 1;
      //ranks still equal? The smaller string ranks higher
      else {
        if (a[0].length < b[0].length) return -1;
        if (a[0].length > b[0].length) return 1;
        return 0;
      }
    }
  });
}

module.exports = cu(getRankedList);

},{"auto-curry":1}],7:[function(require,module,exports){
/*
 * getRegex :: String -> RegExp
 */

/**
 * Returns a regular expression that is used by the
 * subsequence search engine.
 * @param  {String} str String to search for
 * @return {RegExp}     Regular expression based off input search string
 */
function getRegex(str) {
  var s = str.split('').map(function(v) {
    return '(' + v + ')';
  });
  s = '^(.*?)' + s.join('(.*?)') + '(.*?)(.*)$';
  return new RegExp(s, 'i');
}

/*
 * getMatchedList :: Array -> RegExp -> Array
 */

/**
 * Returns a list of strings that match the input
 * search string.
 * @param  {Array}  dataList List of strings to search in
 * @param  {RegExp} regex    Regular expression to match against individual strings
 * @return {Array}           List of items that match input search pattern based regexp
 */
function getMatchedList(dataList, regex) {
  return dataList.map(function(v) {
    return v.match(regex);
  });
}

module.exports = {
  getRegex: getRegex,
  getMatchedList: getMatchedList
};

},{}]},{},[2])(2)
});