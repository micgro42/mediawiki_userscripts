// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { CdxTextInput, CdxField, CdxSelect } = require('@wikimedia/codex');
const { ref, computed, inject } = require('vue');
const { debounce } = require('User:Zvpunry/util.js');
const { useMobileEditingStore } = require('User:Zvpunry/MobileEditingStore.js');

const additionalPrecisions = [
  10, 1, 0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001,
];

module.exports = {
  name: 'GlobeCoordinateValueInput',
  template: `<cdx-field
    :messages="errorMessages"
    :status="errorMessages ? 'error' : 'default'"
  >
    <cdx-text-input
      v-model="coordinateInputString"
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
    {{ $i18n('valueview-expert-globecoordinateinput-precision') }}
  </template>
  </cdx-field>

  <p>Globe: {{ globe }}</p>
  `,
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

    // precision
    const precisionMenuItems = [
      {
        label: i18n(
          'valueview-expert-globecoordinateinput-precisionlabel-tenthousandth-of-arcsecond',
        ),
        value: 1 / 36000000,
      },
      {
        label: i18n(
          'valueview-expert-globecoordinateinput-precisionlabel-thousandth-of-arcsecond',
        ),
        value: 1 / 3600000,
      },
      {
        label: i18n(
          'valueview-expert-globecoordinateinput-precisionlabel-hundredth-of-arcsecond',
        ),
        value: 1 / 360000,
      },
      {
        label: i18n(
          'valueview-expert-globecoordinateinput-precisionlabel-tenth-of-arcsecond',
        ),
        value: 1 / 36000,
      },
      {
        label: i18n(
          'valueview-expert-globecoordinateinput-precisionlabel-arcsecond',
        ),
        value: 1 / 3600,
      },
      {
        label: i18n(
          'valueview-expert-globecoordinateinput-precisionlabel-arcminute',
        ),
        value: 1 / 60,
      },
      ...additionalPrecisions.map((precision) => ({
        label: `±${precision}°`,
        value: precision,
      })),
    ];
    const selectedPrecision = computed(() => {
      const precisionFromDataValue = props.datavalue?.value.precision;
      if (!precisionFromDataValue) {
        return null;
      }
      const matchingMenuOption = precisionMenuItems.find((option) => {
        return (
          Math.abs(option.value - precisionFromDataValue) / option.value <
          0.00001
        );
      });
      return matchingMenuOption?.value || precisionFromDataValue;
    });
    function onPrecisionInput(value) {
      emit('update:datavalue', {
        type: 'globecoordinate',
        value: {
          ...props.datavalue.value,
          precision: value,
        },
      });
    }

    // globe
    const globe = computed(() => {
      return props.datavalue?.value.globe || null;
    });

    // the actual coordinate input
    const coordinateInputString = ref('');
    const store = useMobileEditingStore();
    const formatDatavaluePlain = inject('formatDatavaluePlain');
    if (props.datavalue?.value.latitude) {
      formatDatavaluePlain(store.statementPropertyId, props.datavalue).then(
        (data) => {
          coordinateInputString.value = data.result;
        },
      );
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

      debouncedParseValue(value, 'globe-coordinate').then(
        ({ results, warnings }) => {
          if (warnings) {
            warnings.forEach((warning) => console.warn(warning));
          }
          emit('update:datavalue', results[0]);
          errorMessages.value = null;
        },
        (errorData) => {
          console.log('globe coordinate parse error:', errorData);
          emit('update:datavalue', null);
          errorMessages.value = { error: errorData.error.info };
        },
      );
    }

    return {
      precisionMenuItems,
      selectedPrecision,
      onPrecisionInput,
      globe,
      coordinateInputString,
      onInput,
      errorMessages,
    };
  },
};
