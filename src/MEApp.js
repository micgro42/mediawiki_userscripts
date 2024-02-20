// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { ref, computed, toRef, inject, watch, toRaw } = require('vue');
const {
  CdxDialog,
  CdxMessage,
  CdxButton,
  useModelWrapper,
} = require('@wikimedia/codex');
const { useMobileEditingStore } = require('User:Zvpunry/MobileEditingStore.js');
const {
  EntityLookup,
  RankSelector,
  SnakTypeSelector,
  SnakValueInput,
} = require('User:Zvpunry/components');

module.exports = {
  name: 'MEApp',
  template: `
      <cdx-dialog
          v-model:open="open"
          :title="isEdit ? 'Edit a Statement' : 'Add a new Statement'"
          close-button-label="Cancel"
          @update:open="toggleDialog"
      >
          <entity-lookup
            v-if="!store.statementPropertyId"
            type="property"
            placeholder="instance of (P31)"
            label="Select the Statement Property"
            @selected="onStatementPropertySelected"
          ></entity-lookup>
          <div v-else>
            <h2>{{ store.statementPropertyLabel }}</h2>
            <rank-selector
              :selected="store.rank"
              @update:selected="onRankUpdate"
            ></rank-selector>
            <snak-type-selector
              :selected="store.snaktype"
              @update:selected="onSnakTypeUpdate"
            ></snak-type-selector>
            <snak-value-input
              v-if="store.snaktype === 'value'"
              :datatype="store.statementPropertyDataype"
              :value="store.datavalue"
              @update:value="onSnakValueUpdate"
            ></snak-value-input>
            <div
              v-if="store.formattedDatavalueHTML"
            >
              <p>{{ $i18n('valueview-preview-label') }}</p>
              <div v-html="store.formattedDatavalueHTML"></div>
            </div>
            <h3>Qualifiers</h3>
            <em>Coming soon™</em>
            <h3>References</h3>
            <em>Coming soon™</em>
          </div>
          <template #footer>
            <cdx-message
              v-if="store.lastApiErrorText !== null"
              type="error"
              :fade-in="true"
            >{{ store.lastApiErrorText }}</cdx-message>
            <div style="display:flex;justify-content:space-between;">
              <cdx-button
                :style="isEdit ? null : 'visibility:hidden'"
                weight="primary"
                action="destructive"
                @click="deleteStatement"
              >{{ $i18n('wikibase-remove') }}
              </cdx-button>
              <cdx-button
                weight="primary"
                action="progressive"
                @click="saveStatement"
                :disabled="isSavingDisabled"
              >{{ $i18n('wikibase-publish') }}
              </cdx-button>
            </div>
          </template>
      </cdx-dialog>
  `,
  components: {
    CdxDialog,
    CdxMessage,
    CdxButton,
    EntityLookup,
    RankSelector,
    SnakTypeSelector,
    SnakValueInput,
  },
  props: {},
  setup() {
    const store = useMobileEditingStore();
    const statementData = inject('statementData');
    const isEdit = ref(false);
    console.log('statementData', statementData);
    if (statementData !== null) {
      store.initFromData(statementData);
      isEdit.value = true;
    }

    const isSavingDisabled = computed(() => {
      return (
        !store.statementPropertyId ||
        (store.snaktype === 'value' && !store.datavalue)
      );
    });

    async function saveStatement() {
      store.saveStatement().then(
        () => {
          // Success!
          window.location.reload();
        },
        // error already added to store
      );
    }

    async function deleteStatement() {
      store.deleteStatement().then(
        () => {
          // Success!
          window.location.reload();
        },
        // error already added to store
      );
    }

    function toggleDialog() {
      store.isOpen ? store.close() : store.open();
    }
    function onRankUpdate(newRank) {
      store.rank = newRank;
    }
    function onSnakTypeUpdate(newSnakType) {
      store.snaktype = newSnakType;
    }
    function onSnakValueUpdate(newSnakValue) {
      store.setDatavalue(newSnakValue);
    }

    const open = ref(false);
    window.setTimeout(() => {
      open.value = true;
    }, 0);

    function onStatementPropertySelected(propertyId) {
      store.setStatementPropertyId(propertyId);
    }
    return {
      onStatementPropertySelected,
      onRankUpdate,
      onSnakTypeUpdate,
      onSnakValueUpdate,
      store,
      open,
      isSavingDisabled,
      toggleDialog,
      saveStatement,
      deleteStatement,
      isEdit,
    };
  },
};
