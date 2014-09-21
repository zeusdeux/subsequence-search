var cu = require('auto-curry');

function getResultsList(dataList) {
  return dataList.map(function(v) {
    return v.slice(1).join(''); //slicing first el cuz it has the full matched string
  });
}

module.exports = cu(getResultsList);