const Session = require('m3api/browser.js');

class DevApiAdapter {
  constructor() {
    this.session = new Session(
      'https://www.wikidata.org/w/api.php',
      {
        format: 'json',
        formatversion: 2,
        errorformat: 'plaintext',
        origin: '*',
        uselang: 'en',
      },
      {
        userAgent:
          'DevUserScriptApiAdapter/0.0 (https://github.com/micgro42/mediawiki_userscripts) m3api/0.8/0',
      },
    );
  }

  async get(params) {
    return this.session.request(params).catch((error /* ApiErrors */) => {
      console.log('m3api error errors', error.errors);
      return Promise.reject(error.errors);
    });
  }
}

module.exports = DevApiAdapter;
