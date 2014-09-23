require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function cu(fn) {
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
var cu = require('auto-curry');

//type Classname = String
//getHighlightedString :: Array -> Classname -> String
function getHighlightedString(arr, className) {
  if (arr && arr.length > 0) {
    return arr.map(function(v, i) {
      if (i % 2 !== 0 && i !== arr.length - 1) return '<span class="' + className + '">' + v + '</span>';
      else return v;
    }).join('');
  }
}
//getHighlightedResultsList :: String -> Array -> Array
function getHighlightedResultsList(className, dataList) {
  return dataList.map(function(v) {
    return getHighlightedString(v.slice(1), className); //slicing first el cuz it has the full matched string
  });
}

module.exports = cu(getHighlightedResultsList);

},{"auto-curry":1}],3:[function(require,module,exports){
var cu = require('auto-curry');

function getResultsList(dataList) {
  return dataList.map(function(v) {
    return v.slice(1).join(''); //slicing first el cuz it has the full matched string
  });
}

module.exports = cu(getResultsList);

},{"auto-curry":1}],4:[function(require,module,exports){
var cu = require('auto-curry');

//[31, 35, 36, 40]
//(31-31) (35-31) (36-31) (40 - 31) = 18
//   0       4       5        9     = 18 (this number denotes loose/tight grouping)
//closely grouped matches have a higher rank than
//loosely grouped matches in this scheme
//getRank :: Array -> Int
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

//gets the indices of where the capture groups matched in the
//source string
//type RegexCapturesArray = Array
//getIndicesOfCaptures :: String -> RegexCapturesArray -> Array
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

//sort the input array and return the result as a new array
//no mutation
//getRankedList :: Array -> Array
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
    //ranks equal? The matched string with first match closer to beginning of source string ranks higher
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

},{"auto-curry":1}],5:[function(require,module,exports){
//getRegex :: String -> RegExp
function getRegex(str) {
  var s = str.split('').map(function(v) {
    return '(' + v + ')';
  });
  s = '^(.*?)' + s.join('(.*?)') + '(.*?)(.*)$';
  return new RegExp(s, 'i');
}

//getMatchedList :: Array -> RegExp -> Array
function getMatchedList(dataList, regex) {
  return dataList.map(function(v) {
    return v.match(regex);
  });
}

module.exports = {
  getRegex: getRegex,
  getMatchedList: getMatchedList
};

},{}],"subsequence-search":[function(require,module,exports){
var util        = require('./util');
var cu          = require('auto-curry');
var rank        = require('./transforms/rank');
var highlight   = require('./transforms/highlight');
var noHighlight = require('./transforms/noHighlight');

//search :: Array -> String -> Object -> Array
function search(dataList, searchString, transforms) {
  var resultList;

  //validating inputs
  if (!dataList || !(dataList instanceof Array)) throw new SyntaxError('Data given to search function must be an array');
  if (dataList.length <= 0) return dataList;
  if (dataList.filter(function(v) {
    return 'string' !== typeof v;
  }).length) throw new SyntaxError('Data given to search function must be an array of strings');

  if ('string' !== typeof searchString) throw new SyntaxError('Search string provided to search function must be a string');

  if (!transforms || !Object.keys(transforms).length) {
    console.warn('You haven\'t passed any transform. You might want to atleast pass highlight or noHighlight for proper result');
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
      if ('function' !== typeof v) throw new SyntaxError('Transforms must be a valid function taking one parameter and returing an array');
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

},{"./transforms/highlight":2,"./transforms/noHighlight":3,"./transforms/rank":4,"./util":5,"auto-curry":1}]},{},[]);
