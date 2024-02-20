class ValueParsingRepository {
  constructor(api, langCode) {
    this.api = api;
    this.langCode = langCode;
  }

  async parseValueToHTML(value, datatype) {
    return this.api
      .get({
        action: 'wbparsevalue',
        datatype: datatype,
        format: 'json',
        values: value,
        options: JSON.stringify({
          lang: this.langCode,
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
}

module.exports = ValueParsingRepository;
