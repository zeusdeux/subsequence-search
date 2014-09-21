var cu = require('auto-curry');

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
    return getHighlightedString(v.slice(1), className); //slicing first el cuz it has the full matched string
  });
}

module.exports = cu(getHighlightedResultsList);
