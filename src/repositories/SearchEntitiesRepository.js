// This file is maintained at https://gitlab.wikimedia.org/migr/mediawiki_userscripts
class SearchEntitiesRepository {
  constructor(api, langCode) {
    this.api = api;
    this.langCode = langCode;
  }

  async searchEntities(searchText, type) {
    const params = {
      action: 'wbsearchentities',
      search: searchText,
      language: this.langCode,
      uselang: this.langCode,
      type: type,
      limit: 10,
    };

    return this.api.get(params);
  }
}

module.exports = SearchEntitiesRepository;
