// This file is maintained at https://github.com/micgro42/mediawiki_userscripts

class DatavalueFormattingRepository {
  #api;
  #langCode;
  #currentPageTitle;

  constructor(api, langCode, currentPageTitle) {
    this.#api = api;
    this.#langCode = langCode;
    this.#currentPageTitle = currentPageTitle;
  }

  async formatDatavalue(propertyId, datavalue) {
    return this.makeFormatDatavalueRequest(
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
          this.#currentPageTitle,
        );
      }
      return response;
    });
  }

  async formatDatavaluePlain(propertyId, datavalue, additionalOptions = {}) {
    return this.makeFormatDatavalueRequest(
      propertyId,
      datavalue,
      'text/plain',
      additionalOptions,
    );
  }

  async makeFormatDatavalueRequest(
    propertyId,
    datavalue,
    format,
    additionalOptions = {},
  ) {
    return this.#api.get({
      action: 'wbformatvalue',
      generate: format,
      property: propertyId,
      options: JSON.stringify({
        lang: this.#langCode,
        ...additionalOptions,
      }),
      datavalue: JSON.stringify(datavalue),
    });
  }
}

module.exports = DatavalueFormattingRepository;
