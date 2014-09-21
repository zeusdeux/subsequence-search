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
