// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { CdxTextInput, CdxField, CdxSelect } = require('@wikimedia/codex');
const { ref, computed, inject } = require('vue');
const { debounce } = require('User:Zvpunry/util.js');
const { useMobileEditingStore } = require('User:Zvpunry/MobileEditingStore.js');

module.exports = {
  name: 'TimeValueInput',
  template: `<cdx-field
    :messages="errorMessages"
    :status="errorMessages ? 'error' : 'default'"
  >
    <cdx-text-input
      v-model="timeInputString"
      @update:model-value="onInput"
    ></cdx-text-input>
    <template #label>
      Add value for datatype "{{datatype}}"
    </template>
  </cdx-field>

  <cdx-field>
  <cdx-select
    :menu-items="precisionMenuItems"
    :selected="selectedPrecision"
    @update:selected="onPrecisionInput"
    :disabled="!selectedPrecision"
  >
  </cdx-select>
  <template #label>
    {{ $i18n('valueview-expert-timeinput-precision') }}
  </template>
  </cdx-field>

  <cdx-field>
  <cdx-select
    :menu-items="calendarMenuItems"
    :selected="selectedCalendarModel"
    @update:selected="onCalendarInput"
    :disabled="!selectedCalendarModel"
  >
  </cdx-select>
  <template #label>
    {{ $i18n('valueview-expert-timeinput-calendar') }}
  </template>
  </cdx-field>`,
  components: {
    CdxTextInput,
    CdxSelect,
    CdxField,
  },
  props: {
    datavalue: Object,
    datatype: String,
  },
  emits: ['update:datavalue'],
  setup(props, { emit }) {
    const i18n = inject('i18n');

    // calendar model
    const calendarMenuItems = [
      {
        label: i18n('valueview-expert-timevalue-calendar-julian'),
        value: 'http://www.wikidata.org/entity/Q1985786',
      },
      {
        label: i18n('valueview-expert-timevalue-calendar-gregorian'),
        value: 'http://www.wikidata.org/entity/Q1985727',
      },
    ];
    const selectedCalendarModel = computed(() => {
      return props.datavalue?.value.calendarmodel || null;
    });
    function onCalendarInput(value) {
      emit('update:datavalue', {
        type: 'time',
        value: {
          ...props.datavalue.value,
          calendarmodel: value,
        },
      });
    }

    // precision
    const precisionMenuItems = [
      { label: i18n('valueview-expert-timeinput-precision-day'), value: 11 },
      { label: i18n('valueview-expert-timeinput-precision-month'), value: 10 },
      { label: i18n('valueview-expert-timeinput-precision-year'), value: 9 },
      { label: i18n('valueview-expert-timeinput-precision-year10'), value: 8 },
      { label: i18n('valueview-expert-timeinput-precision-year100'), value: 7 },
      { label: i18n('valueview-expert-timeinput-precision-year1k'), value: 6 },
      { label: i18n('valueview-expert-timeinput-precision-year10k'), value: 5 },
      {
        label: i18n('valueview-expert-timeinput-precision-year100k'),
        value: 4,
      },
      { label: i18n('valueview-expert-timeinput-precision-year1m'), value: 3 },
      { label: i18n('valueview-expert-timeinput-precision-year10m'), value: 2 },
      {
        label: i18n('valueview-expert-timeinput-precision-year100m'),
        value: 1,
      },
      { label: i18n('valueview-expert-timeinput-precision-year1g'), value: 0 },
    ];
    const selectedPrecision = computed(() => {
      return props.datavalue?.value.precision;
    });
    function onPrecisionInput(value) {
      emit('update:datavalue', {
        type: 'time',
        value: {
          ...props.datavalue.value,
          precision: value,
        },
      });
    }

    // the actual time input
    const timeInputString = ref('');
    const store = useMobileEditingStore();
    const datavalueFormattingRepository = inject(
      'datavalueFormattingRepository',
    );
    if (props.datavalue?.value.time) {
      datavalueFormattingRepository
        .formatDatavaluePlain(store.statementPropertyId, props.datavalue)
        .then((data) => {
          timeInputString.value = data.result;
        });
    }

    const valueParsingRepository = inject('valueParsingRepository');
    const debouncedParseValue = debounce(
      (...params) => valueParsingRepository.parseValueToHTML(...params),
      500,
    );
    const errorMessages = ref(null);

    function onInput(value) {
      if (value === '') {
        emit('update:datavalue', null);
        errorMessages.value = null;
        return;
      }

      debouncedParseValue(value, 'time').then(
        ({ results, warnings }) => {
          if (warnings) {
            warnings.forEach((warning) => console.warn(warning));
          }
          emit('update:datavalue', results[0]);
          errorMessages.value = null;
        },
        (errorData) => {
          console.log('time parse error:', errorData);
          emit('update:datavalue', null);
          errorMessages.value = { error: errorData.error.info };
        },
      );
    }

    return {
      calendarMenuItems,
      precisionMenuItems,
      selectedCalendarModel,
      selectedPrecision,
      timeInputString,
      onInput,
      onPrecisionInput,
      onCalendarInput,
      errorMessages,
    };
  },
  // valueview-listrotator-manually
};
