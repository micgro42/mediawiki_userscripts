// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { CdxTextInput, CdxField } = require('@wikimedia/codex');

module.exports = {
  name: 'StringValueInput',
  template: `<cdx-field>
    <cdx-text-input
      :model-value="datavalue?.value"
      @update:model-value="onInput"
    ></cdx-text-input>
    <template #label>
      Add value for datatype "{{datatype}}"
    </template>
  </cdx-field>`,
  components: {
    CdxTextInput,
    CdxField,
  },
  props: {
    datavalue: Object,
    datatype: String,
  },
  emits: ['update:datavalue'],
  setup(props, { emit }) {
    function onInput(newInput) {
      const trimmedInput = newInput.trim();
      if (trimmedInput === '') {
        emit('update:datavalue', null);
        return;
      }

      emit('update:datavalue', { type: 'string', value: newInput });
    }

    return {
      onInput,
    };
  },
};
