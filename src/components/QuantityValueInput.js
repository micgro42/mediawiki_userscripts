// This file is maintained at https://gitlab.wikimedia.org/migr/mediawiki_userscripts
const EntityLookup = require('User:Zvpunry/components/EntityLookup.js');
const { useMobileEditingStore } = require('User:Zvpunry/MobileEditingStore.js');
const { CdxTextInput, CdxField } = require('@wikimedia/codex');
const { ref, inject } = require('vue');
const { debounce } = require('User:Zvpunry/util.js');

module.exports = {
  name: 'QuantityValueInput',
  template: `<div>
    <cdx-field
    :messages="errorMessages"
    :status="errorMessages ? 'error' : 'default'"
  >
    <cdx-text-input
      v-model="amountInputString"
      @update:model-value="onAmountInput"
    ></cdx-text-input>
    <template #label>
        {{ $i18n('wikibase-quantitydetails-amount') }}
    </template>
  </cdx-field>
  <entity-lookup
      :label="$i18n('valueview-expertextender-unitsuggester-label')"
      type="item"
      placeholder="metre (Q11573)"
      :selectedEntityId="selectedUnitEntityId"
      @selectedResult="onUnitEntitySelected"
    ></entity-lookup>
    </div>`,
  components: {
    EntityLookup,
    CdxTextInput,
    CdxField,
  },
  props: {
    datavalue: Object,
    datatype: String,
  },
  emits: ['update:datavalue'],
  setup(props, { emit }) {
    const amountInputString = ref('');
    const store = useMobileEditingStore();
    const datavalueFormattingRepository = inject(
      'datavalueFormattingRepository',
    );
    if (props.datavalue?.value.amount) {
      datavalueFormattingRepository
        .formatDatavaluePlain(store.statementPropertyId, props.datavalue, {
          applyRounding: false,
          applyUnit: false,
        })
        .then((data) => {
          amountInputString.value = data.result;
        });
    }

    const selectedUnitEntityId = ref(null);
    const selectedUnitConceptURI = ref(null);
    if (props.datavalue?.value.unit) {
      selectedUnitConceptURI.value = props.datavalue.value.unit;
      selectedUnitEntityId.value = props.datavalue.value.unit.match(/Q\d+/)[0];
    }

    const errorMessages = ref(null);
    const valueParsingRepository = inject('valueParsingRepository');
    const debouncedParseValue = debounce(
      (...params) => valueParsingRepository.parseQuantityValueToHTML(...params),
      500,
    );

    function parseAndEmitValue() {
      debouncedParseValue(
        amountInputString.value,
        selectedUnitConceptURI.value,
      ).then(
        ({ results, warnings }) => {
          if (warnings) {
            warnings.forEach((warning) => console.warn(warning));
          }
          emit('update:datavalue', results[0]);
          errorMessages.value = null;
        },
        (errorData) => {
          console.log('quantity parse error:', errorData);
          emit('update:datavalue', null);
          errorMessages.value = { error: errorData[0].text };
        },
      );
    }

    function onAmountInput(newInput) {
      if (newInput === '') {
        emit('update:datavalue', null);
        selectedUnitEntityId.value = null;
        return;
      }
      parseAndEmitValue();
    }

    function onUnitEntitySelected(selectedData) {
      selectedUnitEntityId.value = selectedData ? selectedData.id : null;
      selectedUnitConceptURI.value = selectedData
        ? selectedData.concepturi
        : null;
      parseAndEmitValue();
    }

    return {
      amountInputString,
      selectedUnitEntityId,
      onAmountInput,
      onUnitEntitySelected,
      errorMessages,
    };

    // "datavalue":{"type":"quantity","value":{"amount":"+1","unit":"http://www.wikidata.org/entity/Q11573"}}
    // "datavalue":{"type":"quantity","value":{"amount":"+1","unit":"1"}}
    // "datavalue":{"type":"quantity","value":{"amount":"+42","unit":"1","upperBound":"+42.5","lowerBound":"+41.5"}}
  },
};
