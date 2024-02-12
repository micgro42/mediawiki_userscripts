const Session = require('m3api/browser.js');
const session = new Session(
  'https://www.wikidata.org/w/api.php',
  {
    format: 'json',
    formatversion: 2,
    errorformat: 'plaintext',
    origin: '*',
  },
  {
    userAgent:
      'DevRepos/0.0 (https://github.com/micgro42/mediawiki_userscripts) m3api/0.8/0',
  },
);

function makeFormatDatavalueRequest(propertyId, datavalue, format) {
  return session.request({
    action: 'wbformatvalue',
    generate: format,
    property: propertyId,
    uselang: 'en',
    options: { lang: 'en' },
    datavalue: JSON.stringify(datavalue),
  });
}

function formatDatavalue(propertyId, datavalue) {
  return makeFormatDatavalueRequest(
    propertyId,
    datavalue,
    'text/html; disposition=verbose-preview',
  ).then((response) => {
    console.log(response.result);
    const brokenKartographerTitle =
      'Special%3ABadtitle%2Fdummy+title+for+API+calls+set+in+api.php';
    if (response.result.includes(brokenKartographerTitle)) {
      response.result = response.result.replaceAll(
        brokenKartographerTitle,
        mw.config.get('wgTitle'),
      );
    }
    return response;
  });
}

function formatDatavaluePlain(propertyId, datavalue) {
  return makeFormatDatavalueRequest(propertyId, datavalue, 'text/plain');
}

module.exports = { formatDatavalue, formatDatavaluePlain };
