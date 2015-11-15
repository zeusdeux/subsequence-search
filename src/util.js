var clone    = require('clone');
var cu       = require('auto-curry');
var messages = require('./messages');
/*
 * and :: (a -> Bool) -> (a -> Bool) -> (a -> Bool)
 */

/**
 * "And or &&" the result of two functions
 * @param  {Function} fn1 Single arg function from arg to Boolean
 * @param  {Function} fn2 Single arg function from arg to Boolean
 * @return {Boolean}      && of results of fn1 and fn2
 */
function and(fn1, fn2) {
  return function(arg) {
    return fn1(arg) && fn2(arg);
  };
}

/*
 * or :: (a -> Bool) -> (a -> Bool) -> (a -> Bool)
 */

/**
 * "or or ||" the result of two functions
 * @param  {Function} fn1 Single arg function from arg to Boolean
 * @param  {Function} fn2 Single arg function from arg to Boolean
 * @return {Boolean}      || of results of fn1 and fn2
 */
function or(fn1, fn2) {
  return function(arg) {
    return fn1(arg) || fn2(arg);
  };
}

/**
 * zip :: [a] -> [b] -> [[a, b]]
 * (Not a valid haskell type signature nor is it the usual type sign., for zip, I know.)
 */

/**
 * Takes two arrays and returns an array of arrays that each have
 * a pair of elements, one from each array.
 * Example zip [1,2,3] [4,5] = [[1,4], [2,5]]
 * @param  {Array}  Input array one
 * @param  {Array}  Input array two
 * @return {Array}  Zipped array
 */
function zip(xs, ys) {
  var zipped = [];

  if (!isArray(xs) || !isArray(ys)) throw new Error(messages.InputMustBeArray);
  xs = xs.slice();
  ys = ys.slice();
  while (xs.length && ys.length) zipped.push([xs.shift(), ys.shift()]);
  return zipped;
}

/*
 * isObject :: Anything -> Bool
 */

/**
 * Tests if the argument is a javascript object and not null
 * @param  {Any}      arg
 * @return {Boolean}
 */
function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

/*
 * isArray :: Anything -> Bool
 */

/**
 * Tests if argument is a javascript Array
 * @param  {Any}      arg
 * @return {Boolean}
 */
function isArray(arg) {
  return Array.isArray(arg);
}

/*
 * isString :: Anything -> Bool
 */

/**
 * Tests if argument is a String
 * @param  {Any}  arg
 * @return {Boolean}
 */
function isString(arg) {
  return 'string' === typeof arg;
}

/*
 * getRegex :: String -> RegExp
 */

/**
 * Returns a regular expression that is used by the
 * subsequence search engine.
 * @param  {String} str String to search for
 * @return {RegExp}     Regular expression based off input search string
 */
function getRegex(str) {
  var s = str.split('').map(function(v) {
    // escape special chars
    if (
        '*'  === v   ||
        '.'  === v   ||
        '+'  === v   ||
        '('  === v   ||
        ')'  === v   ||
        '\\' === v   ||
        '?'  === v   ||
        '\'' === v   ||
        '$'  === v   ||
        '^'  === v   ||
        '/'  === v   ||
        '['  === v   ||
        ']'  === v
      ) v = '\\' + v;

    return '(' + v + ')';
  });
  s = '^(.*?)' + s.join('(.*?)') + '(.*?)(.*)$';
  return new RegExp(s, 'i');
}

/*
 * getMatchedList :: Object -> RegExp -> Object
 */

/**
 * Returns a list of strings that match the input
 * search string.
 * @param  {Array}  dataList List of strings to search in
 * @param  {RegExp} regex    Regular expression to match against individual strings
 * @return {Array}           List of items that match input search pattern based regexp
 */
function getMatchedList(dataList, regex) {
  if (isObject(dataList)) {
    if (isArray(dataList)) {
      return dataList.map(function(v) {
        return v.match(regex);
      });
    }
    else {
      /*
       * Example dataList:
       *
       * data: [{a: 10, b: 'dude', c:'omg'}, {a: 10, b: 'dude man', c: 'omg what?!'}]
       * searchInProps: ['b', 'c']
       */
      var tempDataList = clone(dataList);

      tempDataList.data = tempDataList.data.map(function(obj) {
        var keysWithMatchesCount = 0;
        var matchItALLRegex      = /(.*)/;
        var temp                 = clone(obj);

        keysWithMatchesCount = dataList.searchInProps.filter(function(prop) {
          var match = obj[prop].match(regex);

          /*
           * hidden side-effect T_T
           * move on functional boys
           * The matchItALLRegex is to preserve the shape of array stored
           * in temp[prop]. It should be of the same shape as what is returned
           * by `.match(regex)` operation.
           * This is done so that the value doesn't get nulled for a prop.
           * Now THAT is done since searchInProps is an OR proposition
           * So we don't want an object where since only one prop matched
           * only that prop retains its value and the other props that were
           * also in searchInProps, all get nulled.
           */
          if (isString(obj[prop])) temp[prop] = match || obj[prop].match(matchItALLRegex);
          else throw new SyntaxError(messages.OnlyStringsAreSearchable);

          /*
           * tag the property if it's value had no match
           * this is used by the ranking transform currently
           */
          if (!match) temp[prop].__SUBSEARCHNOMATCH__ = true;

          return !!match;
        }).length;

        /*
         * If an element has no matches in any keys then return null
         * in its place, effectively removing that element from the
         * final list.
         */
        if (keysWithMatchesCount > 0) return temp;
        else return null;
      });
      return tempDataList;
    }
  }
  else throw new SyntaxError(messages.DataMustBeArrayOrObject);
}

module.exports = {
  or: cu(or),
  and: cu(and),
  zip: cu(zip),
  clone: clone,
  isArray: isArray,
  isObject: isObject,
  getRegex: getRegex,
  getMatchedList: cu(getMatchedList)
};
