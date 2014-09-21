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
  if (dataList.filter(function(v) {
    return 'string' !== typeof v;
  }).length) throw new SyntaxError('Data given to search function must be an array of strings');
  if (dataList.length <= 0) return dataList;

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
