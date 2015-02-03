var util     = require('../util');
var cu       = require('auto-curry');
var messages = require('../messages');
var clone    = util.clone;
var isArray  = util.isArray;
var isObject = util.isObject;


/*
 * How it works:
 *
 * Indices array is:
 * [31, 35, 36, 41]
 * Get distance between adjacent elements
 * (35 - 31) + (36 - 35) + (41 - 36) = 10
 *     4     +     1     +     5     = 10 (this number denotes loose/tight grouping)
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
  var tempArray;

  if (indicesArray) {
    firstElementIndex = indicesArray[1];

    tempArray = indicesArray
      //get all odd indices because they correspond to the capture groups in the regex (see util#getRegex)
      .filter(function(v, i) {
        return i % 2 !== 0;
      })
      //remove last element (corresponds to last capture group in regex i.e., .*)
      .slice(0, -1);

    //slicing 1st element from 'ys' to zip adjacent indices together
    groupingScore = util.zip(tempArray, tempArray.slice(1))
      //get distance between adjacent matches
      //and sum em up to get grouping score
      .reduce(function(p, c) {
        return p + (c[1] - c[0]);
      }, 0);
    //make a small number larger so that
    //a large rank means that it should be
    //higher in the list
    //(negative smaller number is greater than negative bigger number son)
    return groupingScore * -1;
  }
  else return -9999999;
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
  else return void 0;
}

/*
 * Key subclasses String and Int (index ie)
 * getRankingFnForIndices :: Key -> Key -> Function
 */

/**
 * Returns the sorting function that will be used to sort the incoming array
 * i.e., either dataList or dataList.data
 * @param  {String or int} idx1 Index of the element we are sorting on
 * @param  {String or int} idx2 Index of the full string in that element
 * @return {Function}      Sort function that can be given to [].sort
 */
function getRankingFnForIndices(idx1, idx2) {
  return function(a, b) {
    /*
     * If there is a valid idx2:
     * check if the value at idx1 for 'a' and 'b' is a valid value
     * and not some falsy value.
     * If it is falsy, make it an empty string. This is done because
     * if we try to index on a falsy value (e.g., a[idx1] = null, a[idx1][idx2] will throw)
     * then it will throw as we can't index on something that isn't present.
     * If we set it to an empty string (or empty array or empty object) then indexing on it
     * wont throw, but will return undefined cuz strings can have properties as they're objects too
     * Because you know, JS and its strings 乁( ◔ ౪◔)ㄏ
     * This undefined, when received by getIndicesOfCaptures, it will return undefined too.
     * This undefined when given to getRank, it will return -9999999.
     * Hence, all falsy values will get the same rank and won't be moved.
     */
    if (idx2 || idx2 === 0) {
      if (!a[idx1]) a[idx1] = '';
      if (!b[idx1]) b[idx1] = '';
    }
    var aIndices = idx2 || idx2 === 0 ? getIndicesOfCaptures(a[idx1][idx2], a[idx1]) : getIndicesOfCaptures(a[idx1], a);
    var bIndices = idx2 || idx2 === 0 ? getIndicesOfCaptures(b[idx1][idx2], b[idx1]) : getIndicesOfCaptures(b[idx1], b);
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
        var aLen = idx2 || idx2 === 0 ? a[idx1][idx2].length : a[idx1].length;
        var bLen = idx2 || idx2 === 0 ? b[idx1][idx2].length : b[idx1].length;

        //an element can have rank 0 only if the indices array for it contained only zeroes
        //that can happen only when the regex used was for searchString === ''
        //which means empty searchString was given to index#search
        //So just return 0 i.e., don't change the order of elements
        //and keep em as is
        if (aRank === 0 && bRank === 0) return 0;
        if (aLen < bLen) return -1;
        if (aLen > bLen) return 1;
        return 0;
      }
    }
  };
}

/*
 * Sort the input array and return the result as a new array
 * no mutation plz. kthx.
 * getRankedList :: Key -> Object or Array -> Object or Array
 */

/**
 * Transform an unranked list into a ranked list based on proximity,
 * tightness of grouping and string length.
 * @param  {Key}    rankByKey   Key or index to rank on. Default is 0
 * @param  {Array}  dataList    List of matched items (got from util.getMatchedList)
 * @return {Array}              List of ranked matched strings
 */
function getRankedList(rankByKey, dataList) {
  var tempDataList;

  rankByKey = rankByKey || 0;

  if (isObject(dataList)) {
    if (isArray(dataList)) {
      //create a duplicate of dataList to prevent
      //mutation of Array pointed to by dataList as `sort` is in-situ
      tempDataList = dataList.slice(0);

      //if the rank of all elements is 0 then return input dataList
      //as is as its the searchString falsy to index#search condition
      //We have to do this cuz browsers dont use stable sorting
      //check: http://blog.rodneyrehm.de/archives/14-Sorting-Were-Doing-It-Wrong.html
      if (
        tempDataList
        .reduce(function(p, c) {
          //rank for all will be 0 when searchString is falsy
          return p + getRank(getIndicesOfCaptures(c[rankByKey], c));
        }, 0) === 0
      ) return tempDataList;
      else return tempDataList.sort(getRankingFnForIndices(rankByKey));
    }
    else {
      /*
       * Example dataList:
       *
       * data: [{a: 10, b: ['dude', 'd', '', 'ude'], c:['dumb', 'd', '', 'umb']}, {a: 10, b: ['dude man', 'd', '', 'ude man'], c: null}]
       * searchInProps: ['b', 'c']
       */

      //cloning to prevent mutations as objects are passed by reference
      tempDataList = clone(dataList);

      //if the rank of all elements is 0 then return input dataList
      //as is as its the searchString falsy to index#search condition
      //else run the sort
      //We have to do this cuz browsers dont use stable sorting
      //check: http://blog.rodneyrehm.de/archives/14-Sorting-Were-Doing-It-Wrong.html
      if (
        tempDataList.data
        .reduce(function(p, c) {
          //rank for all will be 0 when searchString is falsy
          if (c[rankByKey]) return p + getRank(getIndicesOfCaptures(c[rankByKey][0], c[rankByKey]));
          else return p;
        }, 0) < 0
      ) {
        //rank the items in tempDataList.data based on ranking key provided
        //its in-situ. freaking js sort.
        tempDataList.data.sort(getRankingFnForIndices(rankByKey, 0));
      }

      return tempDataList;
    }
  }
  else throw new SyntaxError(messages.DataMustBeArrayOrObject);
}

module.exports = cu(getRankedList);
