var search    = require('../src').search;
var noResults = require('../src/transforms/noResults');


describe('transforms#noResults', function() {
  describe('when a search doesn\'t match anything', function() {
    it('should output should be given string to noResults', function() {
      var data = ['omg man', 'this is a test', 'woah that was some crazy shizzle', 'merry chrismizzle bizzle'];
      var data2 = {
        data: [{
          val: 1,
          text: 'lets give this a shot'
        }, {
          val: 2,
          text: 'omg potatoes'
        }, {
          val: 3,
          text: 'i have no idea what i am typing'
        }, {
          val: 4,
          text: 'yay for long island ice teas'
        }],
        searchInProps: ['text']
      };
      var temp;

      temp = search({
        noResults: noResults('No results found.')
      }, data, 'boopity');
      temp.should.be.eql(['No results found.']);

      temp = search({
        noResults: noResults('No results found son.')
      }, data2, 'zebra');
      temp.data.should.be.eql([{
        noResult: 'No results found son.'
      }]);
    });
  });
});
