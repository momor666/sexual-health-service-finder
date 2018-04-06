const cheerio = require('cheerio');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
const constants = require('../../app/lib/constants');
const iExpect = require('../lib/expectations');
const utils = require('../lib/testUtils');

const expect = chai.expect;

chai.use(chaiHttp);

const resultsRoute = `${constants.siteRoot}/results/`;

function assertSearchResponse(location, type, origin, done, assertions) {
  chai.request(app)
    .get(resultsRoute)
    .query({ location, origin, type })
    .end((err, res) => {
      expect(err).to.equal(null);
      iExpect.htmlWith200Status(res);
      assertions(err, res);
      done();
    });
}

describe('Results page', function test() {
  // Setting this timeout as it is calling the real DB...
  this.timeout(utils.maxWaitTimeMs);

  before((done) => {
    utils.waitForSiteReady(done);
  });

  const location = 'ls1';
  const type = constants.serviceTypes.kit;
  const origin = constants.serviceChoices['16to24'];

  describe('layout', () => {
    it('should contain HTML', (done) => {
      assertSearchResponse(location, type, origin, done, (err, res) => {
        iExpect.htmlWith200Status(res);
      });
    });

    it('should contain a header and other info related to the search', (done) => {
      assertSearchResponse(location, type, origin, done, (err, res) => {
        const $ = cheerio.load(res.text);
        const resultsHeader = $('.local-header--title--question').text();
        const resultsSubHeader = $('.results p').text();

        expect(resultsHeader).to.contain('Where you can pick up a free test kit near \'LS1\'');
        expect(resultsSubHeader).to.contain('You can pick up a chlamydia test kit from any of the places below. You\'ll ' +
          'take your own samples and send them by Freepost to be tested. You\'ll usually get the results within 2 weeks.');
      });
    });
  });

  describe('matching sexual health professionals found', () => {
    describe('multiple matches', () => {
      it('should have more than one result', (done) => {
        assertSearchResponse(location, type, origin, done, (err, res) => {
          const $ = cheerio.load(res.text);
          const searchResults = $('.results__item--nearby');

          expect(searchResults.length).to.equal(30);
        });
      });
    });
  });

  describe('Each service', () => {
    it('should have distance', (done) => {
      assertSearchResponse(location, type, origin, done, (err, res) => {
        const $ = cheerio.load(res.text);
        const searchResults = $('.results__address.results__address-distance').first();

        expect(searchResults).to.not.equal(undefined);
        expect(searchResults.text()).to.contain('Distance: 0.46 miles');
      });
    });

    it('should have a name', (done) => {
      assertSearchResponse(location, type, origin, done, (err, res) => {
        const $ = cheerio.load(res.text);
        const searchResults = $('.results__name').first();

        expect(searchResults).to.not.equal(undefined);
        expect(searchResults.text()).to.contain('Leeds Sexual Health @ The Merrion Centre');
      });
    });

    it('should have the address and telephone number', (done) => {
      assertSearchResponse(location, type, origin, done, (err, res) => {
        const $ = cheerio.load(res.text);
        const searchResultsAddress = $('.results__address.results__address-lines').first();
        const searchResultsPhone = $('.results__address.results__telephone a').first();

        expect(searchResultsAddress).to.not.equal(undefined);
        expect(searchResultsPhone).to.not.equal(undefined);
        expect(searchResultsAddress.text()).to.contain('Merrion Centre - 1st Floor');
        expect(searchResultsPhone.text()).to.contain('0113 392 0333');
      });
    });

    it('should have a google map link', (done) => {
      assertSearchResponse(location, type, origin, done, (err, res) => {
        const $ = cheerio.load(res.text);
        const searchResults = $('.results__item__link a').first();

        expect(searchResults).to.not.equal(undefined);
        expect(searchResults.text()).to.contain('See map and directions');
      });
    });

    it('should have a See opening times toggle', (done) => {
      assertSearchResponse(location, type, origin, done, (err, res) => {
        const $ = cheerio.load(res.text);
        const searchResults = $('.results__item__opening-times summary span').first();

        expect(searchResults.text()).to.contain('See opening times');
      });
    });

    it('should have a See service information toggle', (done) => {
      assertSearchResponse(location, type, origin, done, (err, res) => {
        const $ = cheerio.load(res.text);
        const searchResults = $('.results__item__service-details summary span').first();

        expect(searchResults.text()).to.contain('See service information');
      });
    });
  });
});