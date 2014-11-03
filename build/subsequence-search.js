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
var util            = require('./util');
var cu              = require('auto-curry');
var messages        = require('./messages');
var rank            = require('./transforms/rank');
var highlight       = require('./transforms/highlight');
var noHighlight     = require('./transforms/noHighlight');
var or              = util.or;
var isArray         = util.isArray;
var isObject        = util.isObject;
var isObjectOrArray = or(isObject, isArray);
var isArrayAndContainsNonString;


isArrayAndContainsNonString = util.and(isArray, function(arg) {
  return !!arg.filter(function(v) {
    return 'string' !== typeof v;
  }).length;
});

/*
 * search :: Object -> Array or Object -> String -> Array or Object
 */

/**
 * This is the interface to subsequence-search.
 * It searches for a pattern in a list of strings.
 * @param  {Object} transforms                Object of transforms to perform on resulting list
 * @param  {Array or Object}  dataList        List of string to search or an object containing data (Array) and keys (Array) to search in
 * @param  {String} searchString              Pattern to search for
 * @return {Array}                            List of matched, transformed strings
 */
function search(transforms, dataList, searchString) {
  var resultList;

  //validating inputs
  if (!dataList || !isObjectOrArray(dataList)) throw new SyntaxError(messages.DataMustBeArrayOrObject);
  if (isArrayAndContainsNonString(dataList)) throw new SyntaxError(messages.DataMustBeStringArray);
  if ('string' !== typeof searchString) throw new SyntaxError(messages.SearchStringMustBeString);

  if (!transforms || !Object.keys(transforms).length) {
    console.warn(messages.NoTransformsWarning);
    transforms = {};
  }

  //validations done
  //start actual logic
  if (
      dataList.length <= 0                          ||
      (dataList.data && dataList.data.length <= 0)  ||
      (dataList.searchInProps && dataList.searchInProps.length <= 0)  ||
      Object.keys(dataList).length <= 0
     ) return dataList;

  if (searchString) {
    //get matched list
    resultList = util.getMatchedList(dataList, util.getRegex(searchString));
    if (isArray(resultList)) {
      //remove all `null` elements from array
      resultList = resultList.filter(function(v) {
        return !!v;
      });
    }
    else {
      resultList.data = resultList.data.filter(function(v) {
        return !!v;
      });
    }
    //apply transforms
    Object.keys(transforms).forEach(function(v) {
      v = transforms[v];
      if ('function' !== typeof v) throw new SyntaxError(messages.TransformMustBeSingleArgFunction);
      resultList = v(resultList);
    });
    //return result
    return resultList;
  }
  //return data as is if searchString is falsy
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
  "DataMustBeArrayOrObject": "Data given to search function must be an array or object",
  "DataMustBeStringArray": "Data given to search function must be an array of strings",
  "SearchStringMustBeString": "Search string provided to search function must be a string",
  "TransformMustBeSingleArgFunction": "Transforms must be a valid function taking one parameter and returing an array",
  "NoTransformsWarning": "You haven't passed any transforms. You might want to atleast pass highlight or noHighlight to get a usable output (array of strings).",
  "OnlyObjectCanBeCloned": "Argument to clone must be a valid javascript object",
  "OnlyStringsAreSearchable": "A search can be performed only on properties that are defined and text i.e., properties that are defined and contain a text value "
}
},{}],4:[function(require,module,exports){
var util = require('../util');
var cu = require('auto-curry');
var messages = require('../messages');
var clone = util.clone;
var isArray = util.isArray;
var isObject = util.isObject;

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
 * getHighlightedResultsList :: String -> Object or Array -> Object or Array
 */

/**
 * Gives back a transformed list of strings which contain matched items surrounded by span tags and given
 * css class
 * @param  {String} className Valid css class name
 * @param  {Object or Array}  dataList  List of matched items
 * @return {Object or Array}            List of transformed, highlighted (by given class name) strings
 */
function getHighlightedResultsList(className, dataList) {
  if (isObject(dataList)) {
    if (isArray(dataList)) {
      return dataList.map(function(v) {
        //slicing first el cuz it has the full matched string
        return getHighlightedString(v.slice(1), className);
      });
    }
    else {
      /*
       * Example dataList:
       *
       * data: [{a: 10, b: ['dude', 'd', '', 'ude'], c:['dumb', 'd', '', 'umb']}, {a: 10, b: ['dude man', 'd', '', 'ude man'], c: null}]
       * searchInProps: ['b', 'c']
       */
      var tempDataList = clone(dataList);

      tempDataList.data = tempDataList.data.map(function(data){
        tempDataList.searchInProps.forEach(function(key){
          if (data[key]) data[key] = getHighlightedString(data[key].slice(1), className);
        });
        return data;
      });
      return tempDataList;
    }
  }
  else throw new SyntaxError(messages.DataMustBeArrayOrObject);
}

module.exports = cu(getHighlightedResultsList);

},{"../messages":3,"../util":7,"auto-curry":1}],5:[function(require,module,exports){
var util     = require('../util');
var cu       = require('auto-curry');
var messages = require('../messages');
var clone    = util.clone;
var isArray  = util.isArray;
var isObject = util.isObject;

/*
 * getResultsList :: Array -> Array
 */

/**
 * Transforms input list into a list of usable strings
 * @param  {Array} dataList   List of matched items
 * @return {Array}            List of matched strings
 */
function getResultsList(dataList) {
  if (isObject(dataList)) {
    if (isArray(dataList)) {
      return dataList.map(function(v) {
        return v[0]; //v[0] contains full string
      });
    }
    else {
      /*
       * Example dataList:
       *
       * data: [{a: 10, b: ['dude', 'd', '', 'ude'], c:['dumb', 'd', '', 'umb']}, {a: 10, b: ['dude man', 'd', '', 'ude man'], c: null}]
       * searchInProps: ['b', 'c']
       */
      var tempDataList = clone(dataList);

      tempDataList.data = tempDataList.data.map(function(data) {
        tempDataList.searchInProps.forEach(function(key) {
          if (data[key]) data[key] = data[key][0];
        });
        return data;
      });
      return tempDataList;
    }
  }
  else throw new SyntaxError(messages.DataMustBeArrayOrObject);
}

module.exports = cu(getResultsList);

},{"../messages":3,"../util":7,"auto-curry":1}],6:[function(require,module,exports){
var util     = require('../util');
var cu       = require('auto-curry');
var messages = require('../messages');
var clone    = util.clone;
var isArray  = util.isArray;
var isObject = util.isObject;


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
  else return -9999999;
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

  if (!inputString || !matchedArray) return void 0;
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
 * Key subclasses String and Int (index ie)
 * getRankingFnForIndices :: Key -> Key -> Function
 */

/**
 * Returns the sorting function that will be used to sort the incoming array
 * i.e., either dataList or dataList.data
 * @param  {String or int} idx1 Index of the element we are sorting on
 * @param  {String or int} idx2 Index of the full string in that element
 * @return {Function}      Sort function that can be given to [].sort
 */
function getRankingFnForIndices(idx1, idx2) {
  return function(a, b) {
    /*
     * If there is a valid idx2:
     * check if the value at idx1 for 'a' and 'b' is a valid value
     * and not some falsy value.
     * If it is falsy, make it an empty string. This is done because
     * if we try to index on a falsy value (e.g., a[idx1] = null, a[idx1][idx2] will throw)
     * then it will throw as we can't index on something that isn't present.
     * If we set it to an empty string (or empty array or empty object) then indexing on it
     * wont throw, but will instead return undefined.
     * This undefined, when received by getIndicesOfCaptures, it will return undefined too.
     * This undefined when given to getRank, it will return -9999999.
     * Hence, all falsy values will get the same rank and won't be moved.
     */
    if (idx2 || idx2 === 0) {
      if (!a[idx1]) a[idx1] = '';
      if (!b[idx1]) b[idx1] = '';
    }
    var aIndices = idx2 || idx2 === 0 ? getIndicesOfCaptures(a[idx1][idx2], a[idx1]) : getIndicesOfCaptures(a[idx1], a);
    var bIndices = idx2 || idx2 === 0 ? getIndicesOfCaptures(b[idx1][idx2], b[idx1]) : getIndicesOfCaptures(b[idx1], b);
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
        var aLen = idx2 || idx2 === 0 ? a[idx1][idx2].length : a[idx1].length;
        var bLen = idx2 || idx2 === 0 ? b[idx1][idx2].length : b[idx1].length;
        if (aLen < bLen) return -1;
        if (aLen > bLen) return 1;
        return 0;
      }
    }
  };
}

/*
 * sort the input array and return the result as a new array
 * no mutation plz. kthx.
 * getRankedList :: Key -> Object or Array -> Object or Array
 */

/**
 * Transform an unranked list into a ranked list based on proximity,
 * tightness of grouping and string length.
 * @param  {Key}    rankByKey   Key or index to rank on. Default is 0
 * @param  {Array}  dataList    List of matched items (got from util.getMatchedList)
 * @return {Array}              List of ranked matched strings
 */
function getRankedList(rankByKey, dataList) {
  var tempDataList;

  rankByKey = rankByKey || 0;

  if (isObject(dataList)) {
    if (isArray(dataList)) {
      //create a duplicate of dataList to prevent
      //mutation of Array pointed to by dataList as `sort` is in-situ
      tempDataList = dataList.slice(0);
      return tempDataList.sort(getRankingFnForIndices(rankByKey));
    }
    else {
      /*
       * Example dataList:
       *
       * data: [{a: 10, b: ['dude', 'd', '', 'ude'], c:['dumb', 'd', '', 'umb']}, {a: 10, b: ['dude man', 'd', '', 'ude man'], c: null}]
       * searchInProps: ['b', 'c']
       */

      //cloning to prevent mutations as objects are passed by reference
      tempDataList = clone(dataList);
      //rank the items in tempDataList.data based on ranking key provided
      //its in-situ. freaking js sort.
      tempDataList.data.sort(getRankingFnForIndices(rankByKey, 0));
      return tempDataList;
    }
  }
  else throw new SyntaxError(messages.DataMustBeArrayOrObject);
}

module.exports = cu(getRankedList);

},{"../messages":3,"../util":7,"auto-curry":1}],7:[function(require,module,exports){
var cu       = require('auto-curry');
var messages = require('./messages');

/*
 * and :: (a -> Bool) -> (a -> Bool) -> (a -> Bool)
 */

/**
 * "And or &&" the result of two functions
 * @param  {Function} fn1 Single arg function from arg to Boolean
 * @param  {Function} fn2 Single arg function from arg to Boolean
 * @return {Boolean}      && of results of fn1 and fn2
 */
function and(fn1, fn2) {
  return function(arg) {
    return fn1(arg) && fn2(arg);
  };
}

/*
 * or :: (a -> Bool) -> (a -> Bool) -> (a -> Bool)
 */

/**
 * "or or ||" the result of two functions
 * @param  {Function} fn1 Single arg function from arg to Boolean
 * @param  {Function} fn2 Single arg function from arg to Boolean
 * @return {Boolean}      || of results of fn1 and fn2
 */
function or(fn1, fn2) {
  return function(arg) {
    return fn1(arg) || fn2(arg);
  };
}

/*
 * isObject :: Anything -> Bool
 */

/**
 * Tests if the argument is a javascript object and not null
 * @param  {Any}      arg
 * @return {Boolean}
 */
function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

/*
 * isArray :: Anything -> Bool
 */

/**
 * Tests if argument is a javascript Array
 * @param  {Any}      arg
 * @return {Boolean}
 */
function isArray(arg) {
  return Array.isArray(arg);
}

/*
 * isString :: Anything -> Bool
 */

/**
 * Tests if argument is a String
 * @param  {Any}  arg
 * @return {Boolean}
 */
function isString(arg){
  return 'string' === typeof arg;
}

/*
 * clone :: Object -> Object
 */

/**
 * Clone the given object
 * Use this only with light objects
 * @param  {Object} obj Any valid javascript object
 * @return {Object}     A clone of the input object
 */
function clone(obj) {
  var temp;
  if (isObject(obj)) {
    temp = {};
    for (var key in obj){
      if (obj.hasOwnProperty(key)) temp[key] = obj[key];
    }
    return temp;
  }
  else throw new SyntaxError(messages.OnlyObjectCanBeCloned);
}

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
 * getMatchedList :: Object -> RegExp -> Object
 */

/**
 * Returns a list of strings that match the input
 * search string.
 * @param  {Array}  dataList List of strings to search in
 * @param  {RegExp} regex    Regular expression to match against individual strings
 * @return {Array}           List of items that match input search pattern based regexp
 */
function getMatchedList(dataList, regex) {
  if (isObject(dataList)) {
    if (isArray(dataList)) {
      return dataList.map(function(v) {
        return v.match(regex);
      });
    }
    else {
      /*
       * Example dataList:
       *
       * data: [{a: 10, b: 'dude', c:'omg'}, {a: 10, b: 'dude man', c: 'omg what?!'}]
       * searchInProps: ['b', 'c']
       */
      var tempDataList = clone(dataList);

      tempDataList.data = tempDataList.data.map(function(obj) {
        var temp = clone(obj);
        var keysWithMatchesCount = 0;

        keysWithMatchesCount = dataList.searchInProps.filter(function(prop) {
          //hidden side-effect T_T
          //move on functional boys
          if (isString(obj[prop])) temp[prop] = obj[prop].match(regex);
          else throw new SyntaxError(messages.OnlyStringsAreSearchable);
          return !!temp[prop];
        }).length;

        /*
         * If an element has no matches in any keys then return null
         * in its place, effectively removing that element from the
         * final list.
         */
        if (keysWithMatchesCount > 0)
          return temp;
        else return null;
      });
      return tempDataList;
    }
  }
  else throw new SyntaxError(messages.DataMustBeArrayOrObject);
}

module.exports = {
  or: cu(or),
  and: cu(and),
  clone: clone,
  isArray: isArray,
  isObject: isObject,
  getRegex: getRegex,
  getMatchedList: cu(getMatchedList)
};

},{"./messages":3,"auto-curry":1}]},{},[2])(2)
});