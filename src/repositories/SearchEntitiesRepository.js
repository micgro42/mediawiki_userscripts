// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const api = new mw.Api();
// FIXME: turn this into a class and inject actual ui language in constructor
async function searchEntities(searchText, type) {
  return await api.get({
    action: 'wbsearchentities',
    search: searchText,
    language: 'en',
    uselang: 'en',
    type: type,
  });
}

module.exports = { searchEntities };
