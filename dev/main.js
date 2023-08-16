const { createApp } = require('vue');
import '../node_modules/@wikimedia/codex/dist/codex.style.css';
const { SnakTypeSelector } = require('../src/components');
const i18nPlugin = require('./i18nPlugin');

createApp(SnakTypeSelector).use(i18nPlugin).mount('#app');
