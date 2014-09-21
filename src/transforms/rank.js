//[31, 35, 36, 40]
//(31-31) (35-31) (36-31) (40 - 31) = 18
//   0       4       5        9     = 18 (this number denotes loose/tight grouping)
//closely grouped matches have a higher rank than
//loosely grouped matches in this scheme
//getRank :: Array -> Int
function getRank(indicesArray) {
  var firstElement;
  var groupingScore;
  if (indicesArray) {
    firstElement = indicesArray[1];
    groupingScore = indicesArray
    //get all odd indices
    .filter(function(v, i) {
      return i % 2 !== 0;
    })
    //remove last element (corresponds to last capture group in regex i.e., .*)
    .slice(0, -1)
    //get distance from first capture group index
    .map(function(v) {
      return v - firstElement;
    })
    //sum grouping up to get grouping score
    .reduce(function(p, c) {
      return p + c;
    }, 0);
    //make a small number larger so that
    //a large rank means that it should be
    //higher in the list
    //(negative smaller number is greater than negative bigger number)
    return groupingScore * -1;
  }
  else return 9999999;
}

//gets the indices of where the capture groups matched in the
//source string
//type RegexCapturesArray = Array
//getIndicesOfCaptures :: String -> RegexCapturesArray -> Array
function getIndicesOfCaptures(inputString, matchedArray) {
  var currIndex;
  if (matchedArray) {
    currIndex = matchedArray.index; //index of first regex match
    if (matchedArray[0] === inputString) matchedArray = matchedArray.slice(1);
    return matchedArray.map(function(v) {
      var index = inputString.indexOf(v, currIndex);
      currIndex += v.length;
      return index;
    });
  }
}

function getRankedList(dataList) {
  return dataList.sort(function(a, b) {
    var aRank = getRank(getIndicesOfCaptures(a[0], a));
    var bRank = getRank(getIndicesOfCaptures(b[0], b));
    //rank higher? put el before
    if (aRank > bRank) return -1;
    //rank lower? put el after
    else if (aRank < bRank) return 1;
    //ranks equal? The string with shorter length must come first then
    else {
      if (a[0].length < b[0].length) return -1;
      if (a[0].length > b[0].length) return 1;
      return 0;
    }
  });
}

module.exports = getRankedList;
