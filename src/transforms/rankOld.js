var cu = require('auto-curry');


/*
 * How it works:
 *
 * Indices array is:
 * [31, 35, 36, 40]
 * (31-31) (35-31) (36-31) (40 - 31) = 18
 *    0       4       5        9     = 18 (this number denotes loose/tight grouping)
 * closely grouped matches have a higher rank than
 * loosely grouped matches in this scheme
 * getRank :: Array -> Int
 */

/**
 * Gives a rank based on indices of capture
 * @param  {Array} indicesArray An array of indices of capture groups
 * @return {Int}                The rank of the current list item being ranked
 */
function getRank(indicesArray) {
  var firstElementIndex;
  var groupingScore;

  if (indicesArray) {
    firstElementIndex = indicesArray[1];
    groupingScore = indicesArray
    //get all odd indices
    .filter(function(v, i) {
      return i % 2 !== 0;
    })
    //remove last element (corresponds to last capture group in regex i.e., .*)
    .slice(0, -1)
    //get distance from first capture group index
    .map(function(v) {
      return v - firstElementIndex;
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

/*
 * gets the indices of where the capture groups matched in the
 * source string
 * type RegexCapturesArray = Array
 * getIndicesOfCaptures :: String -> RegexCapturesArray -> Array
 */

/**
 * Get the indices where capture groups have matched
 * @param  {String} inputString   Untouched input string
 * @param  {Array} matchedArray   Array that is a result of running a regexp on input string
 * @return {Array}                Array of indices of capture groups
 */
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

/*
 * sort the input array and return the result as a new array
 * no mutation
 * getRankedList :: Array -> Array
 */

/**
 * Transform an unranked list into a ranked list based on proximity,
 * tightness of grouping and string length.
 * @param  {Array} dataList   List of matched items (got from util.getMatchedList)
 * @return {Array}            List of ranked matched strings
 */
function getRankedList(dataList) {
  //create a duplicate of dataList to prevent
  //mutation of Array pointed to by dataList as `sort` is in-situ
  var tempDataList = dataList.slice(0);

  return tempDataList.sort(function(a, b) {
    var aIndices = getIndicesOfCaptures(a[0], a);
    var bIndices = getIndicesOfCaptures(b[0], b);
    var aRank = getRank(aIndices);
    var bRank = getRank(bIndices);

    //rank higher? put el before
    if (aRank > bRank) return -1;
    //rank lower? put el after
    else if (aRank < bRank) return 1;
    //ranks equal?
    //The matched string with first match closer to beginning of source string ranks higher
    //ie., the smaller the index of the first capture group the higher it ranks
    else {
      if (aIndices[1] < bIndices[1]) return -1;
      else if (aIndices[1] > bIndices[1]) return 1;
      //ranks still equal? The smaller string ranks higher
      else {
        if (a[0].length < b[0].length) return -1;
        if (a[0].length > b[0].length) return 1;
        return 0;
      }
    }
  });
}

module.exports = cu(getRankedList);
