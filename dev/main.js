const { createApp, markRaw } = require('vue');
const { createPinia } = require('pinia');
import '../node_modules/@wikimedia/codex/dist/codex.style.css';
const MEApp = require('../src/MEApp.js');
const i18nPlugin = require('./i18nPlugin');
const { debounce } = require('../src/util.js');
const DatavalueFormattingRepository = require('../src/repositories/DatavalueFormattingRepository.js');
const SearchEntitiesRepository = require('../src/repositories/SearchEntitiesRepository.js');
const { loadEntity } = require('./ReadingEntityRepository.js');
const {
  writeNewStatement,
  changeExistingStatement,
} = require('./StatementWritingRepository.js');
const DevApiAdapter = require('./DevApiAdapter.js');
const ValueParsingRepository = require('../src/repositories/ValueParsingRepository.js');

window.loadApp = function loadApp(statementData = null) {
  const devApiAdapter = new DevApiAdapter();
  const searchEntitiesRepository = new SearchEntitiesRepository(
    devApiAdapter,
    'en',
  );
  const valueParsingRepository = new ValueParsingRepository(
    devApiAdapter,
    'en',
  );
  const datavalueFormattingRepository = new DatavalueFormattingRepository(
    devApiAdapter,
    'en',
    'Q123',
  );

  const app = createApp(MEApp);
  const pinia = createPinia();
  pinia.use(({ store }) => {
    store.debouncedFormatDatavalue = markRaw(
      debounce(
        (...params) => datavalueFormattingRepository.formatDatavalue(...params),
        500,
      ),
    );
  });
  pinia.use(({ store }) => {
    store.readingEntityRepository = markRaw({ loadEntity });
  });
  pinia.use(({ store }) => {
    store.statementWritingRepository = markRaw({
      writeNewStatement,
      changeExistingStatement,
    });
  });
  pinia.use(() => ({ mwConfig: { wgUserLanguage: 'en' } }));
  app.use(pinia);

  app
    .use(i18nPlugin)
    .provide('statementData', statementData)
    .provide('searchEntitiesRepository', searchEntitiesRepository)
    .provide('datavalueFormattingRepository', datavalueFormattingRepository)
    .provide('valueParsingRepository', valueParsingRepository)
    .provide('isProduction', false)
    .provide('monoLingualTextLanguages', {
      de: 'German',
      'de-at': 'Austrian German',
      'de-ch': 'Swiss High German',
      en: 'English',
      fr: 'French',
      it: 'Italian',
      sw: 'Swahili',
    })
    .mount('#app');
};
