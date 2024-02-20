class ValueParsingRepository {
  constructor(api, langCode) {
    this.api = api;
    this.langCode = langCode;
  }

  async parseValueToHTML(value, datatype, additionalOptions = {}) {
    return this.api
      .get({
        action: 'wbparsevalue',
        datatype: datatype,
        values: value,
        options: JSON.stringify({
          lang: this.langCode,
          ...additionalOptions,
        }),
      })
      .catch((errorCodeOrErrors, responseWithErrorsOrUndefined) => {
        if (!responseWithErrorsOrUndefined) {
          // Dev
          return Promise.reject(errorCodeOrErrors);
        }
        return Promise.reject(responseWithErrorsOrUndefined.errors);
      });
  }

  async parseQuantityValueToHTML(value, unitConceptURI) {
    return this.parseValueToHTML(value, 'quantity', {
      unit: unitConceptURI,
    });
  }
}

module.exports = ValueParsingRepository;
