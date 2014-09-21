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
    return getHighlightedString(v.slice(1), className);
  });
}

module.exports = getHighlightedResultsList;
},{}],3:[function(require,module,exports){
function getResultsList(dataList) {
  return dataList.map(function(v) {
    return v.slice(1).join(''); //slicing first el cuz it has the full matched string
  });
}

module.exports = getResultsList;
},{}],4:[function(require,module,exports){
//[31, 35, 36, 40]
//(31-31) (35-31) (36-31) (40 - 31) = 18
//   0       4       5        9     = 18 (this number denotes loose/tight grouping)
//closely grouped matches have a higher rank than
//loosely grouped matches in this scheme
//getRank :: Array -> Int
function getRank(indicesArray) {
  var firstElement;
  var groupingScore;
  if (indicesArray) {
    firstElement = indicesArray[1];
    groupingScore = indicesArray
    //get all odd indices
    .filter(function(v, i) {
      return i % 2 !== 0;
    })
    //remove last element (corresponds to last capture group in regex i.e., .*)
    .slice(0, -1)
    //get distance from first capture group index
    .map(function(v) {
      return v - firstElement;
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

function getRankedList(dataList) {
  return dataList.sort(function(a, b) {
    var aRank = getRank(getIndicesOfCaptures(a[0], a));
    var bRank = getRank(getIndicesOfCaptures(b[0], b));
    //rank higher? put el before
    if (aRank > bRank) return -1;
    //rank lower? put el after
    else if (aRank < bRank) return 1;
    //ranks equal? The string with shorter length must come first then
    else {
      if (a[0].length < b[0].length) return -1;
      if (a[0].length > b[0].length) return 1;
      return 0;
    }
  });
}

module.exports = getRankedList;

},{}],5:[function(require,module,exports){
//getRegex :: String -> RegExp
function getRegex(str) {
  var s = str.split('').map(function(v) {
    return '(' + v + ')';
  });
  s = '^(.*)' + s.join('(.*?)') + '(.*?)(.*)$';
  return new RegExp(s, 'i');
}

module.exports = {
  getRegex: getRegex
};
},{}],"subsequence-search":[function(require,module,exports){
var util = require('./util');
var cu = require('auto-curry');
var rank = cu(require('./transforms/rank'));
var noHighlight = cu(require('./transforms/noHighlight'));
var highlight = cu(require('./transforms/highlight'));

function getMatchedList(dataList, regex) {
  return dataList.map(function(v) {
    return v.match(regex);
  });
}

function search(dataList, searchString, transforms) {
  var resultList;

  if (searchString) {
    resultList = getMatchedList(dataList, util.getRegex(searchString));
    resultList = resultList.filter(function(v) {
      return !!v;
    });
    Object.keys(transforms).forEach(function(v) {
      v = transforms[v];
      if ('function' !== typeof v) throw new SyntaxError('Transforms must be a valid function taking one parameter and returing an array');
      resultList = v(resultList);
    });

    return resultList;
  }
  else return dataList;
}

module.exports = {
  search: search,
  transforms: {
    rank: rank,
    highlight: highlight,
    noHighlight: noHighlight
  }
};

},{"./transforms/highlight":2,"./transforms/noHighlight":3,"./transforms/rank":4,"./util":5,"auto-curry":1}]},{},[]);
