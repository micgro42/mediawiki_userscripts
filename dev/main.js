const { createApp, markRaw } = require('vue');
const { createPinia } = require('pinia');
import '../node_modules/@wikimedia/codex/dist/codex.style.css';
const MEApp = require('../src/MEApp.js');
const i18nPlugin = require('./i18nPlugin');
const { debounce } = require('../src/util.js');
const {
  formatDatavalue,
  formatDatavaluePlain,
} = require('./DatavalueFormattingRepository.js');
const SearchEntitiesRepository = require('../src/repositories/SearchEntitiesRepository.js');
const { loadEntity } = require('./ReadingEntityRepository.js');
const {
  writeNewStatement,
  changeExistingStatement,
} = require('./StatementWritingRepository.js');
const DevApiAdapter = require('./DevApiAdapter.js');
const ValueParsingRepository = require('../src/repositories/ValueParsingRepository.js');

const devApiAdapter = new DevApiAdapter();
const searchEntitiesRepository = new SearchEntitiesRepository(devApiAdapter, 'en');
const valueParsingRepository = new ValueParsingRepository(devApiAdapter);

const app = createApp(MEApp);
const pinia = createPinia();
pinia.use(({ store }) => {
  store.debouncedFormatDatavalue = markRaw(debounce(formatDatavalue, 500));
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
  .provide('statementData', null)
  .provide('searchEntitiesRepository', searchEntitiesRepository)
  .provide('formatDatavaluePlain', formatDatavaluePlain)
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
