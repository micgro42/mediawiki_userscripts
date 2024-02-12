const { createApp } = require('vue');
import '../node_modules/@wikimedia/codex/dist/codex.style.css';
const { MEApp } = require('../src/MEApp.js');
const i18nPlugin = require('./i18nPlugin');

createApp(MEApp)
  .use(i18nPlugin)
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
