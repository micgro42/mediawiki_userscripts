// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { computed, inject } = require('vue');
const StringValueInput = require('User:Zvpunry/components/StringValueInput.js');
const EntityValueInput = require('User:Zvpunry/components/EntityValueInput.js');
const TimeValueInput = require('User:Zvpunry/components/TimeValueInput.js');
const QuantityValueInput = require('User:Zvpunry/components/QuantityValueInput.js');
const MonoLingualTextValueInput = require('User:Zvpunry/components/MonoLingualTextValueInput.js');
const GlobeCoordinateValueInput = require('User:Zvpunry/components/GlobeCoordinateValueInput.js');

module.exports = {
  name: 'SnakValueInput',
  template: `<div>
    <p v-if="!isProduction">datatype: {{ datatype }}</p>
    <pre v-if="!isProduction">{{ value }}</pre>
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
    QuantityValueInput,
    MonoLingualTextValueInput,
    GlobeCoordinateValueInput,
  },
  props: ['datatype', 'value'],
  emits: ['update:value'],
  setup(props, { emit }) {
    function onValueUpdate(newValue) {
      console.log('SnakValueInput onValueUpdate', props.datatype, newValue);
      emit('update:value', newValue);
    }
    const isProduction = inject('isProduction', false);

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
      if (props.datatype === 'monolingualtext') {
        return 'MonoLingualTextValueInput';
      }
      if (props.datatype === 'globe-coordinate') {
        return 'GlobeCoordinateValueInput';
      }
      if (props.datatype === 'quantity') {
        return 'QuantityValueInput';
      }
      return null;
    });

    return {
      isProduction,
      onValueUpdate,
      valueInputComponent,
    };
  },
};
