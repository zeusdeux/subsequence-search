//getRegex :: String -> RegExp
function getRegex(str) {
  var s = str.split('').map(function(v) {
    return '(' + v + ')';
  });
  s = '^(.*)' + s.join('(.*?)') + '(.*?)(.*)$';
  return new RegExp(s, 'i');
}

module.exports = {
  getRegex: getRegex
};