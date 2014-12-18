var util     = require('../util');
var messages = require('../messages');
var isArray  = util.isArray;
var isObject = util.isObject;


function noResults(msg) {
  return function(dataList) {
    if (isObject(dataList)) {
      if (isArray(dataList)) {
        if (!dataList.length) dataList.push(msg || 'No Results found.');
      }
      else {
        if (isArray(dataList.data) && !dataList.data.length) dataList.data.push({
          noResult: msg || 'No results found.'
        });
      }
      return dataList;
    }
    else throw new SyntaxError(messages.DataMustBeArrayOrObject);
  };
}

module.exports = noResults;
