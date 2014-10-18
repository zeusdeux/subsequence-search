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
