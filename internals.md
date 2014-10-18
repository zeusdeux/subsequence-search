# Internal API


## index.js

#### search(dataList, transforms, searchString)

This is the interface to subsequence-search.
It searches for a pattern in a list of strings.

**Parameters**

**dataList**: `Array`, List of string to search

**transforms**: `Object`, Object of transforms to perform on resulting list

**searchString**: `String`, Pattern to search for

**Returns**: `Array`, List of matched, transformed strings


## util.js

#### getRegex(str)

Returns a regular expression that is used by the
subsequence search engine.

**Parameters**

**str**: `String`, String to search for

**Returns**: `RegExp`, Regular expression based off input search string


#### getMatchedList(dataList, regex)

Returns a list of strings that match the input
search string.

**Parameters**

**dataList**: `Array`, List of strings to search in

**regex**: `RegExp`, Regular expression to match against individual strings

**Returns**: `Array`, List of items that match input search pattern based regexp


## transforms/rank.js

#### getRank(indicesArray)

Gives a rank based on indices of capture

**Parameters**

**indicesArray**: `Array`, An array of indices of capture groups

**Returns**: `Int`, The rank of the current list item being ranked


#### getIndicesOfCaptures(inputString, matchedArray)

Get the indices where capture groups have matched

**Parameters**

**inputString**: `String`, Untouched input string

**matchedArray**: `Array`, Array that is a result of running a regexp on input string

**Returns**: `Array`, Array of indices of capture groups


#### getRankedList(dataList)

Transform an unranked list into a ranked list based on proximity,
tightness of grouping and string length.

**Parameters**

**dataList**: `Array`, List of matched items (got from util.getMatchedList)

**Returns**: `Array`, List of ranked matched strings


## transforms/highlight.js

#### getHighlightedString(arr, className)

Adds a span with provided class around matched characters

**Parameters**

**arr**: `Array`, A matched array

**className**: `String`, A css class name

**Returns**: `String`, A string with matched character surrounded by span with given css class name


#### getHighlightedResultsList(className, dataList)

Gives back a transformed list of strings which contain matched items surrounded by span tags and given
css class

**Parameters**

**className**: `String`, Valid css class name

**dataList**: `Array`, List of matched items

**Returns**: `Array`, List of transformed, highlighted (by given class name) strings


## transforms/noHighlight.js

#### getResultsList(dataList)

Transforms input list into a list of usable strings

**Parameters**

**dataList**: `Array`, List of matched items

**Returns**: `Array`, List of matched strings











