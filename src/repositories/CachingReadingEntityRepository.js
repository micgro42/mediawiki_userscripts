// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const api = new mw.Api();
if (!window['User:Zvpunry']?.entitiesCache) {
  if (!window['User:Zvpunry']) {
    window['User:Zvpunry'] = {};
  }
  window['User:Zvpunry'].entitiesCache = new Map();
}
const cache = window['User:Zvpunry'].entitiesCache;

/**
 * @param entityIds string[]
 */
async function loadEntities(entityIds) {
  const missingIds = entityIds.filter((entityId) => !cache.has(entityId));
  if (missingIds.length !== 0) {
    const data = await api
      .get({
        action: 'wbgetentities',
        ids: missingIds, // does array here work? .join('|'),
        format: 'json',
      })
      .promise();

    console.debug('CachingReadingEntityRepository load', missingIds, data);

    for (const entityId in data.entities) {
      cache.set(entityId, data.entities[entityId]);
    }
  }

  return entityIds.reduce((results, entityId) => {
    results[entityId] = cache.get(entityId);
    return results;
  }, {});
}

/**
 * @param entityId string
 */
async function loadEntity(entityId) {
  const entities = await loadEntities([entityId]);
  console.log('loadEntity', entityId, entities);
  return entities[entityId];
}

module.exports = { loadEntities, loadEntity };
