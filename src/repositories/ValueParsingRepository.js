class ValueParsingRepository {
  constructor(api) {
    this.api = api;
  }

  async parseValueToHTML(value, datatype) {
    return this.api
      .get({
        action: 'wbparsevalue',
        datatype: datatype,
        format: 'json',
        values: value,
        // lang:
        // options {lang:"en"}
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
