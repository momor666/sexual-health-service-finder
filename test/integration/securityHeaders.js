const chai = require('chai');
const chaiHttp = require('chai-http');

const constants = require('../../app/lib/constants');
const server = require('../../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('app', () => {
  it('should include required security headers', async () => {
    const res = await chai.request(server)
      .get(`${constants.siteRoot}`);
    expect(res).to.have.header('Content-Security-Policy', 'child-src *.hotjar.com; connect-src \'self\' assets.adobedtm.com *.google-analytics.com *.hotjar.com:* nhs.funnelback.co.uk; default-src \'self\'; font-src *.nhs.uk *.hotjar.com; img-src \'self\' data: *.2o7.net *.google-analytics.com *.hotjar.com *.omtrdc.net *.webtrends.com *.webtrendslive.com *.nhs.uk; script-src \'self\' \'unsafe-eval\' \'unsafe-inline\' data: assets.adobedtm.com *.google-analytics.com *.hotjar.com *.webtrends.com *.webtrendslive.com; style-src \'self\' \'unsafe-inline\' *.nhs.uk');
    expect(res).to.have.header('X-Xss-Protection', '1; mode=block');
    expect(res).to.have.header('X-Frame-Options', 'DENY');
    expect(res).to.have.header('X-Content-Type-Options', 'nosniff');
    expect(res).to.not.have.header('X-Powered-By');
    expect(res).to.have.header('X-Download-Options', 'noopen');
    expect(res).to.have.header('Strict-Transport-Security', 'max-age=15552000');
  });
});
