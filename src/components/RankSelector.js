// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { CdxRadio, CdxField } = require('@wikimedia/codex');
const { computed } = require('vue');

module.exports = {
  name: 'RankSelector',
  template: `<cdx-field :is-fieldset="true">
    <cdx-radio
      v-for="rank in ranks"
      :style="rankStyle[rank]"
      :key="'rank-' + rank"
      :model-value="selected"
      @update:model-value="$emit('update:selected', rank)"
      name="rank-selector"
      :input-value="rank"
      :inline="true"
    >
      {{ $i18n('wikibase-statementview-rank-' + rank) }}
    </cdx-radio>
    <template #label>
      Rank
    </template>
  </cdx-field>`,
  components: {
    CdxRadio,
    CdxField,
  },
  props: {
    selected: String,
  },
  emits: ['update:selected'],
  setup() {
    const ranks = ['normal', 'preferred', 'deprecated'];
    const rankStyle = computed(() => {
      return {
        normal: {},
        preferred: {
          boxShadow: '0px 0px 0px 5px #E0FFE0',
        },
        deprecated: {
          boxShadow: '0px 0px 0px 5px #FFE0E0',
        },
      };
    });

    return {
      rankStyle,
      ranks,
    };
  },
};
