var cu = require('auto-curry');

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
 * getHighlightedResultsList :: String -> Array -> Array
 */

/**
 * Gives back a transformed list of strings which contain matched items surrounded by span tags and given
 * css class
 * @param  {String} className Valid css class name
 * @param  {Array}  dataList  List of matched items
 * @return {Array}            List of transformed, highlighted (by given class name) strings
 */
function getHighlightedResultsList(className, dataList) {
  return dataList.map(function(v) {
    //slicing first el cuz it has the full matched string
    return getHighlightedString(v.slice(1), className);
  });
}

module.exports = cu(getHighlightedResultsList);
