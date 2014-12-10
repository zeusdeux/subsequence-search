var util     = require('../util');
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

module.exports = getResultsList;
