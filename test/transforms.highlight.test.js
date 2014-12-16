var util      = require('../src/util');
var highlight = require('../src/transforms/highlight')('highlight');

describe('transforms#highlight', function() {
  describe('when a list of data is passed to highlight', function() {
    it('should return the combined string for each item in the list with a span surrounding every matched item with passed class', function() {
      var data = ['CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'];

      data = highlight(util.getMatchedList(data, util.getRegex('fo')));
      data[0].should.be.exactly('CHAAT BHAVAN - 5355 Mowry Ave, <span class="highlight">F</span>rem<span class="highlight">o</span>nt (510-795-1100)');
      data[1].should.be.exactly('<span class="highlight">F</span><span class="highlight">o</span>x Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
    });
  });
  describe('when an object of data is passed to highlight', function() {
    it('should return the object with its data property for given keys highlighted', function() {
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

      data2 = highlight(util.getMatchedList(data2, util.getRegex('dude')));
      data2.data[0].a.should.be.exactly(30);
      data2.data[0].b.should.be.exactly('go<span class="highlight">d</span> no d<span class="highlight">u</span><span class="highlight">d</span><span class="highlight">e</span>. dafaq?!');
      (data2.data[0].c === null).should.be.ok;

      data2.data[1].a.should.be.exactly(10);
      data2.data[1].b.should.be.exactly('<span class="highlight">d</span><span class="highlight">u</span><span class="highlight">d</span><span class="highlight">e</span> what');
      data2.data[1].c.should.be.exactly('omg no <span class="highlight">d</span><span class="highlight">u</span><span class="highlight">d</span><span class="highlight">e</span>');

    });
  });
});
