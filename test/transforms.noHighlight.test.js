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
});
