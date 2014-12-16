var util     = require('../util');
var cu       = require('auto-curry');
var messages = require('../messages');
var clone    = util.clone;
var isArray  = util.isArray;
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
      if (i % 2 !== 0 && i !== arr.length - 1 && v !== '') return '<span class="' + className + '">' + v + '</span>';
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
 * @param  {String}           className Valid css class name
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

      tempDataList.data = tempDataList.data.map(function(data) {
        tempDataList.searchInProps.forEach(function(key) {
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
