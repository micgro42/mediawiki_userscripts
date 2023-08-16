// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { CdxRadio, CdxField } = require('@wikimedia/codex');

module.exports = {
  name: 'SnakTypeSelector',
  template: `<cdx-field :is-fieldset="true">
		<cdx-radio
			v-for="label, type in snakTypes"
			:key="'snak-type-' + type"
			:model-value="selected"
			@update:model-value="$emit('update:selected', type)"
			name="snak-type-selector"
			:input-value="type"
			:inline="true"
		>
			{{ $i18n(snakTypes[type]) }}
		</cdx-radio>
		<template #label>
			Snak Type
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
    const snakTypes = {
      value: 'wikibase-snakview-snaktypeselector-value',
      somevalue: 'wikibase-snakview-variations-somevalue-label',
      novalue: 'wikibase-snakview-variations-novalue-label',
    };

    return {
      snakTypes,
    };
  },
};
