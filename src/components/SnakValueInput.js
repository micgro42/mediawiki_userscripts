// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { computed } = require('vue');
const {
  StringValueInput,
  EntityValueInput,
  TimeValueInput,
} = require('User:Zvpunry/components');

module.exports = {
  name: 'SnakValueInput',
  template: `<div>
    <p>datatype: {{ datatype }}</p>
    <pre>{{ value }}</pre>
    <p v-if="!datatype"><em>Loading Property data... </em>⏳</p>
    <component
      v-else-if="valueInputComponent"
      :is="valueInputComponent"
      :datavalue="value"
      :datatype="datatype"
      @update:datavalue="onValueUpdate"
    ></component>
    <p v-else><em>Sorry, this datatype is not yet supported.</em>😢</p>
  </div>`,
  components: {
    StringValueInput,
    EntityValueInput,
    TimeValueInput,
  },
  props: ['datatype', 'value'],
  emits: ['update:value'],
  setup(props, { emit }) {
    function onValueUpdate(newValue) {
      console.log('SnakValueInput onValueUpdate', props.datatype, newValue);
      emit('update:value', newValue);
    }

    const stringValueInputTypes = [
      'string',
      'url',
      'external-id',
      'commonsMedia',
      'geo-shape',
      'tabular-data',
      'musical-notation',
      'math',
    ];
    const entityValueInputTypes = [
      'wikibase-item',
      'wikibase-property',
      'wikibase-lexeme',
      'wikibase-form',
      'wikibase-sense',
    ];
    const valueInputComponent = computed(() => {
      if (stringValueInputTypes.includes(props.datatype)) {
        return 'StringValueInput';
      }
      if (entityValueInputTypes.includes(props.datatype)) {
        return 'EntityValueInput';
      }
      if (props.datatype === 'time') {
        return 'TimeValueInput';
      }
      return null;
    });

    return {
      onValueUpdate,
      valueInputComponent,
    };
  },
};
