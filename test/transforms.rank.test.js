var rank = require('../src/transforms/rank');
var util = require('../src/util');


describe('transforms#rank', function() {
  describe('when two elements have different ranks', function() {
    it('should sort them in ascending order', function() {
      var data = ['CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'];

      data = rank(0, util.getMatchedList(data, util.getRegex('fo')));
      data[0][0].should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
      data[1][0].should.be.exactly('CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)');
    });
  });

  describe('when two elements have same ranks', function() {
    it('should sort them in ascending order based on whose first match is closer to the beginning of source string', function() {
      var data = ['Mr Drain Plumbing - 1556 Halford Ave, Santa Clara (408-907-2786)', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'];

      data = rank(0, util.getMatchedList(data, util.getRegex('fo')));
      data[0][0].should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
      data[1][0].should.be.exactly('Mr Drain Plumbing - 1556 Halford Ave, Santa Clara (408-907-2786)');
    });
  });

  describe('when two elements have same rank and are equally close to beginning of source string', function() {
    it('should sort then in ascending order based on their length', function() {
      var data = ['Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990) omg wat', 'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'];

      data = rank(0, util.getMatchedList(data, util.getRegex('fo')));
      data[0][0].should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
      data[1][0].should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990) omg wat');
    });
  });

  describe('when an object containing data and keys is given to rank', function() {
    it('should rank the data property of the object based on the key given to rank', function() {
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
      var data3 = {
        data: [{
          id: 1,
          text: 'some more text'
        }, {
          id: 2,
          text: 'some text'
        }],
        searchInProps: ['text']
      };

      data2 = rank('c', util.getMatchedList(data2, util.getRegex('dude')));
      data2.data[0].a.should.be.exactly(10);
      data2.data[1].a.should.be.exactly(30);
      data2.data[1].c.should.be.exactly('');

      data3 = rank('text', util.getMatchedList(data3, util.getRegex('text')));
      data3.data[0].id.should.be.exactly(2);
      data3.data[0].text[0].should.be.exactly('some text');
    });
  });
  describe('when the data contains empty strings', function() {
    it('should work properly', function() {
      var data = {
        data:[{
          a: '',
          b: 'man'
        }, {
          a: 'dude',
          b: 'what up'
        }],
        searchInProps: ['a']
      };

      data = rank('a', util.getMatchedList(data, util.getRegex('')));
      data.data[0].b.should.be.exactly('man');
      data.data[1].b.should.be.exactly('what up');
    });
  });

});
