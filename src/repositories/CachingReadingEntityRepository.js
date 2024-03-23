// This file is maintained at https://github.com/micgro42/mediawiki_userscripts

class CachingReadingEntityRepository {
  #api;
  #cache;

  constructor(api) {
    this.#api = api;
    this.#cache = this.#getCacheFromWindow();
  }

  /**
   * @param entityIds string[]
   */
  async loadEntities(entityIds) {
    const missingIds = entityIds.filter(
      (entityId) => !this.#cache.has(entityId),
    );
    if (missingIds.length !== 0) {
      const data = await this.#api.get({
        action: 'wbgetentities',
        ids: missingIds, // does array here work? .join('|'),
      });

      for (const entityId in data.entities) {
        this.#cache.set(entityId, data.entities[entityId]);
      }
    }

    return entityIds.reduce((results, entityId) => {
      results[entityId] = this.#cache.get(entityId);
      return results;
    }, {});
  }

  /**
   * @param entityId string
   */
  async loadEntity(entityId) {
    const entities = await this.loadEntities([entityId]);
    return entities[entityId];
  }

  #getCacheFromWindow() {
    if (!window['User:Zvpunry']?.entitiesCache) {
      if (!window['User:Zvpunry']) {
        window['User:Zvpunry'] = {};
      }
      window['User:Zvpunry'].entitiesCache = new Map();
    }
    return window['User:Zvpunry'].entitiesCache;
  }
}

module.exports = CachingReadingEntityRepository;
