const { createApp } = require('vue');
import '../node_modules/@wikimedia/codex/dist/codex.style.css';
const { RankSelector } = require('../src/components');
const i18nPlugin = require( './i18nPlugin' );

createApp(RankSelector).use(i18nPlugin).mount('#app');
