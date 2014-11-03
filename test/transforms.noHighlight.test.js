var noH = require('../src/transforms/noHighlight');
var util = require('../src/util');

describe('transforms#noHighlight', function() {
  describe('when a list of data is passed to noHighlight', function() {
    it('should return the combined string for each item in the list without any extra html', function() {
      var data = ['CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'];

      data = noH(util.getMatchedList(data, util.getRegex('fo')));
      data[0].should.be.exactly('CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)');
      data[1].should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
    });
  });
  describe('when an object of data is passed to noHighlight', function() {
    it('should return the object with its data property for given keys as plain strings', function() {
      var data2 = {
        data: [{
          a: 30,
          b: 'god no dude. dafaq?!',
          c: 'this is weird'
        }, {
          a: 10,
          b: 'dude what',
          c: 'omg no dude'
        }],
        searchInProps: ['b', 'c']
      };

      data2 = noH(util.getMatchedList(data2, util.getRegex('dude')));
      data2.data[0].a.should.be.exactly(30);
      data2.data[0].b.should.be.exactly('god no dude. dafaq?!');
      (data2.data[0].c === null).should.be.exactly(true);

      data2.data[1].a.should.be.exactly(10);
      data2.data[1].b.should.be.exactly('dude what');
      data2.data[1].c.should.be.exactly('omg no dude');
    });
  });
});
