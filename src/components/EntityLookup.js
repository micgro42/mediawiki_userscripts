// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { ref, inject } = require('vue');
const { CdxField, CdxLookup } = require('@wikimedia/codex');
const { debounce } = require('User:Zvpunry/util.js');

module.exports = {
  name: 'EntityLookup',
  template: `
      <cdx-field>
        <p v-if="isInitialEntitySearching">Searching for Entity...🔎</p>
        <cdx-lookup
          v-show="!isInitialEntitySearching"
          :placeholder="placeholder"
          :menu-items="menuItems"
          v-model:selected="selection"
          :menuConfig="menuConfig"
          @input="onNewInput"
          @update:selected="onSelection"
          @load-more="onLoadMore"
        ></cdx-lookup>
        <template #label>
          {{ label }}
        </template>
      </cdx-field>
  `,
  components: {
    CdxField,
    CdxLookup,
  },
  props: {
    type: String, // item, property, ...; used in wbsearchentities api call
    label: String,
    placeholder: String,
    selectedEntityId: String, // can be null
  },
  emits: ['selected', 'selectedResult'],
  setup(props, { emit }) {
    const searchEntitiesRepository = inject('searchEntitiesRepository');
    const currentSearchTerm = ref('');
    const menuItems = ref([]);
    const selection = ref(null);
    const searchResults = new Map();
    async function searchOption(newInput, offset) {
      return searchEntitiesRepository.searchEntities(
        newInput,
        props.type,
        offset,
      );
    }
    const debouncedSearch = debounce(searchOption, 500);
    async function onNewInput(newInput) {
      currentSearchTerm.value = newInput;
      if (!newInput) {
        menuItems.value = [];
        return;
      }

      const response = await debouncedSearch(newInput);
      console.log(currentSearchTerm.value, response.searchinfo, newInput);
      if (currentSearchTerm.value !== newInput) {
        console.log('old response, doing nothing');
        return;
      }
      const requestResults = [];
      response.search.forEach((result) => {
        requestResults.push({
          label: result.label,
          description: result.description,
          value: result.id,
        });
        searchResults.set(result.id, result);
      });

      menuItems.value = requestResults;
    }

    function deduplicateResults(results) {
      const seen = new Set(menuItems.value.map((result) => result.value));
      return results.filter((result) => !seen.has(result.value));
    }

    function onLoadMore() {
      if (!currentSearchTerm.value) {
        return;
      }

      searchOption(currentSearchTerm.value, menuItems.value.length).then(
        (data) => {
          if (!data.search || data.search.length === 0) {
            return;
          }

          const results = data.search.map((result) => {
            searchResults.set(result.id, result);
            return {
              label: result.label,
              value: result.id,
              description: result.description,
            };
          });

          // Update menuItems.
          const deduplicatedResults = deduplicateResults(results);
          menuItems.value.push(...deduplicatedResults);
        },
      );
    }

    const { selectedEntityId: initialEntityId } = props;
    const isInitialEntitySearching = ref(false);
    if (initialEntityId) {
      isInitialEntitySearching.value = true;
      console.log('searching for', initialEntityId);
      // selection.value = initialEntityId;
      // onNewInput( initialEntityId );
      (async () => {
        await onNewInput(initialEntityId);
        console.log('received results', menuItems.value);
        selection.value = initialEntityId;
        console.log('selected value set', selection.value);
        isInitialEntitySearching.value = false;
      })();
    }

    function onSelection(value) {
      console.log('onSelection', value);
      emit('selected', value);
      // some need the full result
      emit('selectedResult', value ? searchResults.get(value) : value);
    }

    const menuConfig = {
      visibleItemLimit: 6,
    };
    console.log('User:Zvpunry/components/EntityLookup.js setup done');
    return {
      menuItems,
      onNewInput,
      onSelection,
      onLoadMore,
      selection,
      menuConfig,
      isInitialEntitySearching,
    };
  },
};
