const chai = require('chai');
const chaiHttp = require('chai-http');
const cheerio = require('cheerio');

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

describe('Results page for sexual health professionals for over 25', function test() {
  // Setting this timeout as it is calling the real DB...
  this.timeout(utils.maxWaitTimeMs);

  before((done) => {
    utils.waitForSiteReady(done);
  });

  const location = 'ls1';
  const type = constants.serviceTypes.professional;
  const origin = constants.serviceChoices.over25;

  describe('layout', () => {
    it('should contain a header and other info related to the search', (done) => {
      assertSearchResponse(location, type, origin, done, (err, res) => {
        const $ = cheerio.load(res.text);
        const resultsHeader = $('.local-header--title--question').text();
        const resultsSubHeader = $('.results p.explanation').text();
        const resultsOnwards = $('.results p.links').text();

        expect(resultsHeader).to.contain('Sexual health professionals near \'LS1\'');
        expect(resultsSubHeader).to.contain('You can get tested for chlamydia at these places.');
        expect(resultsOnwards).to.contain('Or: see where you can buy a test kit.');
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

  describe('First service', () => {
    it('should have distance, name, an address and phone number', (done) => {
      assertSearchResponse(location, type, origin, done, (err, res) => {
        const $ = cheerio.load(res.text);
        const searchResultsDistance = $('.results__address.results__address-distance').first();
        const searchResultsName = $('.results__name').first();
        const searchResultsAddress = $('.results__address.results__address-lines').first();
        const searchResultsPhone = $('.results__address.results__telephone a').first();

        expect(searchResultsDistance).to.not.equal(undefined);
        expect(searchResultsName).to.not.equal(undefined);
        expect(searchResultsAddress).to.not.equal(undefined);
        expect(searchResultsPhone).to.not.equal(undefined);

        expect(searchResultsDistance.text()).to.contain('0.5 miles away');
        expect(searchResultsName.text()).to.contain('Leeds Sexual Health @ The Merrion Centre');
        expect(searchResultsAddress.text()).to.contain('Merrion Centre - 1st Floor');
        expect(searchResultsPhone.text()).to.contain('0113 392 0333');
      });
    });
  });
});
