var cu = require('auto-curry');

/*
 * getResultsList :: Array -> Array
 */

/**
 * Transforms input list into a list of usable strings
 * @param  {Array} dataList   List of matched items
 * @return {Array}            List of matched strings
 */
function getResultsList(dataList) {
  return dataList.map(function(v) {
    return v.slice(1).join(''); //slicing first el cuz it has the full matched string
  });
}

module.exports = cu(getResultsList);
