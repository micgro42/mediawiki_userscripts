// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { ref, inject } = require('vue');
const { CdxField, CdxLookup, CdxTextInput } = require('@wikimedia/codex');

module.exports = {
  name: 'MonoLingualTextValueInput',
  template: `<div><cdx-field>
    <cdx-text-input
    v-model="textInputString"
    @update:model-value="onTextInput"
    ></cdx-text-input>
    <template #label>
    Add monolingual text
    </template>
  </cdx-field>

    <cdx-field v-if="textInputString">
    <cdx-lookup
        v-model:selected="selectedLanguage"
        @update:selected="onLanguageSelected"
        :menu-items="menuItems"
        @input="onLanguageInput"
    ></cdx-lookup>
    <template #label>
    {{ $i18n('valueview-expertextender-languageselector-label') }}
    </template>
    </cdx-field>
  </div>`,
  components: {
    CdxField,
    CdxLookup,
    CdxTextInput,
  },
  props: {
    datavalue: Object,
    datatype: String,
  },
  emits: ['update:datavalue'],
  setup(props, { emit }) {
    const textInputString = ref(props.datavalue?.value.text || '');
    function onTextInput(newInput) {
      if (newInput === '') {
        emit('update:datavalue', null);
        selectedLanguage.value = null;
        return;
      }
      if (!selectedLanguage.value) {
        return;
      }
      emit('update:datavalue', {
        value: {
          text: newInput,
          language: selectedLanguage.value,
        },
        type: 'monolingualtext',
      });
    }

    const languageMap = inject('monoLingualTextLanguages');
    const fullMenuItems = Object.keys(languageMap).map((key) => {
      return {
        label: `${languageMap[key]} (${key})`,
        value: key,
      };
    });

    const initialLanguage = props.datavalue?.value.language || null;
    const selectedLanguage = ref(null);
    const menuItems = ref(
      initialLanguage
        ? [fullMenuItems.find((item) => item.value === initialLanguage)]
        : [],
    );
    if (initialLanguage) {
      window.setTimeout(() => {
        selectedLanguage.value = initialLanguage;
      }, 0);
    }

    function onLanguageInput(newInput) {
      const directMatch = fullMenuItems.filter(
        (item) => item.value === newInput.toLowerCase(),
      );
      const directLangCodeMatches = fullMenuItems.filter((item) =>
        item.value.includes(newInput.toLowerCase()),
      );
      const labelMatches = fullMenuItems.filter((item) =>
        item.label.toLowerCase().includes(newInput.toLowerCase()),
      );
      menuItems.value = [
        ...new Set([...directMatch, ...directLangCodeMatches, ...labelMatches]),
      ];
    }
    function onLanguageSelected(newLanguage) {
      if (!newLanguage) {
        emit('update:datavalue', null);
        return;
      }
      emit('update:datavalue', {
        value: {
          text: textInputString.value,
          language: selectedLanguage.value,
        },
        type: 'monolingualtext',
      });
    }

    return {
      textInputString,
      selectedLanguage,
      menuItems,
      onTextInput,
      onLanguageInput,
      onLanguageSelected,
    };
  },
};
