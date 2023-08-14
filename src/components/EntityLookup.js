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
	        	@input="onNewInput"
	        	@update:selected="onSelection"
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
  emits: ['selected'],
  setup(props, { emit }) {
    const api = inject('api');
    const currentSearchTerm = ref('');
    const menuItems = ref([]);
    const selection = ref(null);
    async function searchOption(newInput) {
      return await api.get({
        action: 'wbsearchentities',
        search: newInput,
        language: 'en',
        uselang: 'en',
        type: props.type,
      });
    }
    const debouncedSearch = debounce(searchOption, 500);
    async function onNewInput(newInput) {
      currentSearchTerm.value = newInput;
      if (!newInput) {
        this.menuItems = [];
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
      });

      menuItems.value = requestResults;
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
    }

    console.log('User:Zvpunry/components/EntityLookup.js setup done');
    return {
      menuItems,
      onNewInput,
      onSelection,
      selection,
      isInitialEntitySearching,
    };
  },
};
