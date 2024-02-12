// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { computed } = require('vue');
const EntityLookup = require('User:Zvpunry/components/EntityLookup.js');

module.exports = {
  name: 'EntityValueInput',
  template: `<div>
    <entity-lookup
      :label="label"
      :type="type"
      :placeholder="placeholder"
      :selectedEntityId="selectedEntityId"
      @selected="onSelected"
    ></entity-lookup>
  </div>`,
  components: {
    EntityLookup,
  },
  props: {
    datavalue: Object,
    datatype: String,
  },
  emits: ['update:datavalue'],
  setup(props, { emit }) {
    function onSelected(newEntityId) {
      if (!newEntityId) {
        emit('update:datavalue', null);
        return;
      }

      emit('update:datavalue', {
        type: 'wikibase-entityid',
        value: {
          id: newEntityId,
        },
      });
    }

    const datatypeMeta = {
      'wikibase-item': {
        type: 'item',
        label: 'Select an Item',
        placeholder: 'Douglas Adams (Q42)',
      },
      'wikibase-property': {
        type: 'property',
        label: 'Select a Property',
        placeholder: 'instance of (P31)',
      },
      'wikibase-lexeme': {
        type: 'lexeme',
        label: 'Select a Lexeme',
        placeholder: 'speak (L380)',
      },
      'wikibase-form': {
        type: 'form',
        label: 'Select a Form of a Lexeme',
        placeholder: 'speaking (L380-F1)',
      },
      'wikibase-sense': {
        type: 'sense',
        label: 'Select a Sense of a Lexeme',
        placeholder: 'L1-S1',
      },
    };

    const label = computed(() => {
      return datatypeMeta[props.datatype].label;
    });
    const type = computed(() => {
      return datatypeMeta[props.datatype].type;
    });
    const placeholder = computed(() => {
      return datatypeMeta[props.datatype].placeholder;
    });

    const selectedEntityId = computed(() => {
      return props.datavalue?.value.id;
    });

    return {
      onSelected,
      label,
      type,
      placeholder,
      selectedEntityId,
    };
  },
};
