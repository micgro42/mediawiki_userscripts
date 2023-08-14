const { createApp } = require('vue');
import '../node_modules/@wikimedia/codex/dist/codex.style.css';
const { RankSelector } = require('../src/components');

createApp(RankSelector).mount('#app');
