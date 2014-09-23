var util = require('../src/util');

describe('util#getRegex', function() {
  describe('when a string is passed', function() {
    it('should return a RegExp instance with its case insensitive flag set', function() {
      var r = util.getRegex('test');
      r.should.be.an.instanceof(RegExp).and.have.property('ignoreCase', true);
    });
    it('should return a RegExp of the form ^(.*)(val1)(.*?)(val2)(.*?)..etc(.*)$', function() {
      var r = util.getRegex('ab');
      r.should.be.an.instanceof(RegExp).and.have.property('source', '^(.*?)(a)(.*?)(b)(.*?)(.*)$');
    });
  });
});
describe('util#getMatchedList', function() {
  describe('when given a list of data to match against and a RegExp', function() {
    it('should return an array of matched string arrays', function() {
      var data = ['CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)', 'potato is the shizzle'];
      var matchedList = util.getMatchedList(data, util.getRegex('fo')).filter(function(v) {
        return !!v;
      });

      matchedList.should.be.an.Array;
      matchedList[0].should.be.an.Array;
      matchedList[1].should.be.an.Array;

      matchedList.length.should.be.exactly(2);

      matchedList[0].join().should.eql(['CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)', 'CHAAT BHAVAN - 5355 Mowry Ave, ', 'F', 'rem', 'o', '', 'nt (510-795-1100)'].join());
      matchedList[0].should.have.property('index', 0);
      matchedList[0].should.have.property('input', 'CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)');

      matchedList[1].join().should.eql(['Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)', '', 'F', '', 'o', '', 'x Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'].join());
      matchedList[1].should.have.property('index', 0);
      matchedList[1].should.have.property('input', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
    });
  });
});
