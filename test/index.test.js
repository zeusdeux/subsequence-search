var index = require('../src/');
var data = [
  'CHAAT BHAVAN - 5355 Mowry Ave, Fremont (*+\\510-795-1100)',
  'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)',
  'Mr Drain Plumbing - 1556 Halford Ave, Santa Clara (408-907-2786)',
  'Madras Cafe - 1177 W El Camino Real, Sunnyvale (408-737-2323)',
  'Carpenter School - 4250 Central Blvd, Ann Arbor (734-997-1214)'
];
var data2 = {
  data: [{
    a: 30,
    b: 'god no dude. dafaq?!',
    c: 'this is weird'
  }, {
    a: 10,
    b: 'dude what',
    c: 'omg no dude'
  }, {
    a: 40,
    b: 'dude no',
    c: 'go away dude.'
  }],
  searchInProps: ['b', 'c']
};
var data3 = [
  'Daivine Moving & Storage - 845 3rd Ave, New York (212-244-4011)',
  'Gilmore Car Museum - 6865 W Hickory Rd, Illinois (269-671-5089)',
  'Waterfront Fountains - 202 Murberry Rd, Illinois (269-123-4322)',
  'Arya Bhavan - 2508 W Devon Ave, Chicago (773-274-5800)',
  'CHAAT BHAVAN - 5355 Mowry Ave, Fremont (510-795-1100)',
  'Carpenter School - 4250 Central Blvd, Ann Arbor (734-997-1214)',
  'Carpenter Community Charter School - 3909 Carpenter Ave, Studio City (818-761-4363)',
  'Vivere - 71 W Monroe St, Chicago (312-332-4040)',
  'Total Plumbing & Heating Inc - 1671 Utica Ave, Brooklyn (718-377-1900)',
  'Saravana Bhavan -  Wood Ave, Edison (732-767-0033)',
  'Madras Cafe - 1177 W El Camino Real, Sunnyvale (408-737-2323)',
  'Saravanaa Bhavan - 81 Lexington Ave, New York (212-679-0204)',
  'Saravana Bhavan - 1305 S Mary Ave, Sunnyvale (309-493-50396)',
  'Mr Drain Plumbing - 1556 Halford Ave, Santa Clara (408-907-2786)',
  'Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)'
];
var rank = require('../src/transforms/rank');
var highlight = require('../src/transforms/highlight');
var noHighlight = require('../src/transforms/noHighlight');


describe('index#search', function() {
  describe('when a list of input strings, a search string and an object containing transform functions are passed to search', function() {
    it('should return a new list containing matching elements with required transforms', function() {
      var res = index.search({
        rank: index.transforms.rank(0),
        highlight: index.transforms.highlight('highlight')
      }, data, 'fo');

      res.length.should.be.eql(4);
      res[0].should.be.exactly('<span class="highlight">F</span><span class="highlight">o</span>x Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');

      res = index.search({
        rank: index.transforms.rank(0),
        noHighlight: index.transforms.noHighlight
      }, data, '(*+\\50)');

      res.length.should.be.eql(1);
      res[0].should.be.exactly('CHAAT BHAVAN - 5355 Mowry Ave, Fremont (*+\\510-795-1100)');
    });
  });
  describe('when an empty data list is passed', function() {
    it('should return same list back', function() {
      var res;

      res = index.search({}, [], 'fo');
      res.length.should.be.eql(0);

      res = index.search({}, {}, 'fo');
      res.should.be.eql({});

      res = index.search({}, {
        data: []
      }, 'fo');
      res.should.be.eql({
        data: []
      });

      res = index.search({}, {
        searchInProps: []
      }, 'fo');
      res.should.be.eql({
        searchInProps: []
      });
    });
  });
  describe('when a non-object (array or otherwise) data list or list of non strings is passed', function() {
    it('should throw', function() {
      index.search.bind(index, {}, null, 'fo').should.throw();
      index.search.bind(index, {}, 'dude', 'fo').should.throw();
      index.search.bind(index, {}, false, 'fo').should.throw();
      index.search.bind(index, {}, void 0, 'fo').should.throw();
      index.search.bind(index, {}, 1, 'fo').should.throw();
      index.search.bind(index, {}, ['fox', 'folly', 1, 'banana'], 'fo').should.throw();
      index.search.bind(index, {}, ['fox', 'folly', 'apply', 'banana'], 'fo').should.not.throw();
    });
  });
  describe('when a non string is passsed as search string', function() {
    it('should throw', function() {
      index.search.bind(index, {}, ['fox', 'dog'], 123).should.throw();
      index.search.bind(index, {}, ['fox', 'dog'], 'fo').should.not.throw();
    });
  });
  describe('when empty search string is passed', function() {
    it('should return back the data list as is with given transforms applied', function() {
      var res = index.search({
        noHighlight: noHighlight,
        pluck: function(d) {
          return d.map(function(v) {
            return v + ' dude';
          });
        }
      }, data3, '');

      res.should.eql(data3.map(function(v) {
        return v + ' dude';
      }));

      res = index.search({
        rank: rank(0),
        highlight: highlight('dude'),
        pluck: function(d) {
          return d.map(function(v) {
            return v + ' dude';
          });
        }
      }, data3, '');
      res.should.eql(data3.map(function(v) {
        return v + ' dude';
      }));
    });
  });
  describe('when transforms is not an object or empty', function() {
    it('should not alter the ordering or elements in the result set', function() {
      var res = index.search({}, data, 'fo');

      res[0].join().should.be.exactly('CHAAT BHAVAN - 5355 Mowry Ave, Fremont (*+\\510-795-1100),CHAAT BHAVAN - 5355 Mowry Ave, ,F,rem,o,,nt (*+\\510-795-1100)');
      res[1].join().should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990),,F,,o,,x Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');

      res = index.search(void 0, data, 'fo');
      res[0].join().should.be.exactly('CHAAT BHAVAN - 5355 Mowry Ave, Fremont (*+\\510-795-1100),CHAAT BHAVAN - 5355 Mowry Ave, ,F,rem,o,,nt (*+\\510-795-1100)');
      res[1].join().should.be.exactly('Fox Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990),,F,,o,,x Plumbing & Heating - 7501 2nd Ave S, Seattle (206-654-4990)');
    });
  });
  describe('when an object containing data and searchInProps with some transforms is passed to search', function() {
    it('should return a transformed list with data[...searchInProps] that matched', function() {
      var output = index.search({
        rank: index.transforms.rank('b'),
        hh: index.transforms.highlight('highlighted'),
        extractData: function(d) {
          return d.data;
        }
      }, data2, 'dude');

      output.should.be.an.Array;
      output.length.should.be.exactly(3);

      output[0].should.be.an.Object;
      output[0].a.should.be.exactly(40);
      output[0].b.should.be.exactly('<span class="highlighted">d</span><span class="highlighted">u</span><span class="highlighted">d</span><span class="highlighted">e</span> no');
      output[0].c.should.be.exactly('go away <span class="highlighted">d</span><span class="highlighted">u</span><span class="highlighted">d</span><span class="highlighted">e</span>.');

      output[1].should.be.an.Object;
      output[1].a.should.be.exactly(10);
      output[1].b.should.be.exactly('<span class="highlighted">d</span><span class="highlighted">u</span><span class="highlighted">d</span><span class="highlighted">e</span> what');
      output[1].c.should.be.exactly('omg no <span class="highlighted">d</span><span class="highlighted">u</span><span class="highlighted">d</span><span class="highlighted">e</span>');

      output[2].should.be.an.Object;
      output[2].a.should.be.exactly(30);
      output[2].b.should.be.exactly('go<span class="highlighted">d</span> no d<span class="highlighted">u</span><span class="highlighted">d</span><span class="highlighted">e</span>. dafaq?!');
      (output[2].c === null).should.be.exactly(true);
    });
  });
  describe('when search string doesnt match any input', function() {
    it('should return output with transforms applied', function() {
      var output = index.search({
        rank: index.transforms.rank('b'),
        hh: index.transforms.highlight('highlighted')
      }, data2, 'palfaksja');

      output.data.length.should.be.exactly(0);
      output.searchInProps.should.eql(data2.searchInProps);
    });
  });
});
