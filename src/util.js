//getRegex :: String -> RegExp
function getRegex(str) {
  var s = str.split('').map(function(v) {
    return '(' + v + ')';
  });
  s = '^(.*)' + s.join('(.*?)') + '(.*?)(.*)$';
  return new RegExp(s, 'i');
}

//getMatchedList :: Array -> RegExp -> Array
function getMatchedList(dataList, regex) {
  return dataList.map(function(v) {
    return v.match(regex);
  });
}

module.exports = {
  getRegex: getRegex,
  getMatchedList: getMatchedList
};