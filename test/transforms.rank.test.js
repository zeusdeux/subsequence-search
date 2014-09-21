var rank = require('../src/transforms/rank');
var util = require('../src/util');

describe('transforms#rank', function() {
  describe('when two elements have different ranks', function() {
    it('should sort them in ascending order', function() {
      var data = ['CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'];
      data = rank(util.getMatchedList(data, util.getRegex('fo')));
      data[0][0].should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
      data[1][0].should.be.exactly('CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)');
    });
  });

  describe('when two elements have same ranks', function() {
    it('should sort them in ascending order based on whose first match is closer to the beginning of source string', function() {
      var data = ['Mr Drain Plumbing - 1556 Halford Ave, Santa Clara (408-907-2786)', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'];
      data = rank(util.getMatchedList(data, util.getRegex('fo')));
      data[0][0].should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
      data[1][0].should.be.exactly('Mr Drain Plumbing - 1556 Halford Ave, Santa Clara (408-907-2786)');
    });
  });

  describe('when two elements have same rank and are equally close to beginning of source string', function() {
    it('should sort then in ascending order based on their length', function() {
      var data = ['Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990) omg wat', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'];
      data = rank(util.getMatchedList(data, util.getRegex('fo')));
      data[0][0].should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
      data[1][0].should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990) omg wat');
    });
  });
});
