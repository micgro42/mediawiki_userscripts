// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const uiLanguage = mw.config.get('wgUserLanguage');
const api = new mw.Api();

function makeFormatDatavalueRequest(propertyId, datavalue, format) {
  return api.get({
    action: 'wbformatvalue',
    generate: format,
    property: propertyId,
    uselang: uiLanguage,
    options: { lang: uiLanguage },
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
