/* eslint-disable sort-keys */
const path = require('path');

const rootPath = path.normalize(`${__dirname}/..`);

module.exports = {
  // application config
  app: {
    name: 'sexual-health-service-finder',
  },
  root: rootPath,
  port: process.env.PORT || 3000,
  headerApiUrl: 'https://refdata-api.azurewebsites.net/api/fullheadermenu',
  env: process.env.NODE_ENV || 'development',
  // ElasticSearch config
  es: {
    host: process.env.ES_HOST || 'es',
    port: process.env.ES_PORT || '9200',
    index: process.env.ES_INDEX || 'sexual-health-services',
    type: 'sexual-health-service',
  },
  resultsLimit: process.env.RESULTS_LIMIT || 30,
  // Analytics config
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
  hotjarId: process.env.HOTJAR_ANALYTICS_TRACKING_ID,
  webtrendsId: process.env.WEBTRENDS_ANALYTICS_TRACKING_ID,
};
/* eslint-enable sort-keys */
