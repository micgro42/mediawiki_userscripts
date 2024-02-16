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
      .catch((errorCode, errorData) => {
        if (!errorData) {
          // Dev
          return Promise.reject(errorCode);
        }
        return Promise.reject(errorData);
      });
  }
}

module.exports = ValueParsingRepository;
