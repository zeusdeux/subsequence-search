var util            = require('./util');
var cu              = require('auto-curry');
var messages        = require('./messages');
var rank            = require('./transforms/rank');
var noResults       = require('./transforms/noResults');
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

  //no transforms warning
  if (!transforms || !Object.keys(transforms).length) {
    console.warn(messages.NoTransformsWarning);
    transforms = {};
  }

  //validations done
  //start actual logic

  //return dataList as is, if
  //  - dataList is an array and is empty
  //  - dataList is an object
  //    * it has data prop which is an array and that data prop is an empty array
  //    * it has searchInProps property which is an array and is empty
  //  - dataList is an empty object i.e., {}
  if (
    dataList.length <= 0                                            ||
    (dataList.data && dataList.data.length <= 0)                    ||
    (dataList.searchInProps && dataList.searchInProps.length <= 0)  ||
    Object.keys(dataList).length <= 0
  ) return dataList;


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
    if ('function' !== typeof transforms[v]) throw new SyntaxError(messages.TransformMustBeSingleArgFunction);
    resultList = transforms[v](resultList);
  });

  //return result
  return resultList;
}

module.exports = {
  search: cu(search),
  transforms: {
    rank: rank,
    highlight: highlight,
    noResults: noResults,
    noHighlight: noHighlight
  }
};
