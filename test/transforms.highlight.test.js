var highlight = require('../src/transforms/highlight')('highlight');
var util = require('../src/util');

describe('transforms#highlight', function() {
  describe('when a list of data is passed to highlight', function() {
    it('should return the combined string for each item in the list with a span surrounding every matched item with passed class', function() {
      var data = ['CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'];
      data = highlight(util.getMatchedList(data, util.getRegex('fo')));
      data[0].should.be.exactly('CHAAT BHAVAN - 5355 Mowry Ave, <span class="highlight">F</span>rem<span class="highlight">o</span>nt (510-795-1100)');
      data[1].should.be.exactly('<span class="highlight">F</span><span class="highlight">o</span>x Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
    });
  });
});
