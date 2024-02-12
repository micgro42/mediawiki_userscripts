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

async function searchEntities(searchText, type) {
  return session.request({
    action: 'wbsearchentities',
    search: searchText,
    language: 'en',
    uselang: 'en',
    type: type,
  });
}

module.exports = { searchEntities };
