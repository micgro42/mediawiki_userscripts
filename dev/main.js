const { createApp } = require('vue');
import '../node_modules/@wikimedia/codex/dist/codex.style.css';
const { MonoLingualTextValueInput } = require('../src/components');
const i18nPlugin = require('./i18nPlugin');

createApp(MonoLingualTextValueInput)
  .use(i18nPlugin)
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
