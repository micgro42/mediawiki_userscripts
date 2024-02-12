import Session from 'm3api/browser.js';

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

async function loadEntities(entityIds) {
  const response = await session.request({
    action: 'wbgetentities',
    ids: entityIds.join('|'),
  });
  console.log('loadEntities', entityIds, response);

  return response.entities;
}

async function loadEntity(entityId) {
  const entities = await loadEntities([entityId]);
  console.log('loadEntity', entityId, entities);
  return entities[entityId];
}

module.exports = { loadEntities, loadEntity };
