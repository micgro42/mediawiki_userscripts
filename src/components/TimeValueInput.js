// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { CdxTextInput, CdxField, CdxSelect } = require('@wikimedia/codex');
const { ref, computed, inject } = require('vue');
const { debounce } = require('User:Zvpunry/util.js');
const {
  formatDatavaluePlain,
} = require('User:Zvpunry/repositories/DatavalueFormattingRepository.js');
const { useMobileEditingStore } = require('User:Zvpunry/MobileEditingStore.js');

module.exports = {
  name: 'TimeValueInput',
  template: `<cdx-field
		:messages="errorMessages"
		:status="errorMessages ? 'error' : 'default'"
	>
		<cdx-text-input
			:model-value="timeInputString"
			@update:model-value="onInput"
		></cdx-text-input>
		<template #label>
			Add value for datatype "{{datatype}}"
		</template>
	</cdx-field>

	<cdx-field>
	<cdx-select
		:menu-items="precisionMenuItems"
		v-model:selected="selectedPrecision"
		@update:selected="onPrecisionInput"
	>
	</cdx-select>
	<template #label>
		{{ $i18n('valueview-expert-timeinput-precision') }}
	</template>
	</cdx-field>

	<cdx-field>
	<cdx-select
		:menu-items="calendarMenuItems"
		v-model:selected="selectedCalendarModel"
		@update:selected="onCalendarInput"
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
  setup(props, { emit }) {
    const i18n = inject('i18n');
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

    const selectedCalendarModel = computed(() => {
      return props.datavalue?.value.calendarmodel;
    });
    const selectedPrecision = computed(() => {
      return props.datavalue?.value.precision;
    });
    const timeInputString = ref('');
    const store = useMobileEditingStore();
    if (props?.datavalue.value.time) {
      formatDatavaluePlain(store.statementPropertyId, props?.datavalue).then(
        (data) => {
          timeInputString.value = data.result;
        },
      );
      // timeInputString.value = props.datavalue.value.time;
    }

    function onPrecisionInput(value) {
      emit('update:value', {
        type: 'time',
        value: {
          ...props.datavalue.value,
          precision: value,
        },
      });
    }

    function onCalendarInput(value) {
      emit('update:value', {
        type: 'time',
        value: {
          ...props.datavalue.value,
          calendarmodel: value,
        },
      });
    }

    const api = new mw.Api();

    function parseValueWithApi(value) {
      return api
        .get({
          action: 'wbparsevalue',
          datatype: 'time',
          format: 'json',
          values: value,
          // lang:
          // options {lang:"en"}
        })
        .catch((errorCode, errorData) => Promise.reject(errorData));
    }

    const debouncedParseValue = debounce(parseValueWithApi, 500);
    const errorMessages = ref(null);

    function onInput(value) {
      if (value === '') {
        return;
      }

      debouncedParseValue(value).then(
        ({ results, warnings }) => {
          if (warnings) {
            warnings.forEach((warning) => console.warn(warning));
          }
          emit('update:value', results[0]);
          errorMessages.value = null;
        },
        (errorData) => {
          console.log('time parse error:', errorData);
          emit('update:value', null);
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
