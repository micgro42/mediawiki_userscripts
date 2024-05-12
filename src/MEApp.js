// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { ref, computed, inject } = require('vue');
const { CdxDialog, CdxMessage, CdxButton } = require('@wikimedia/codex');
const { useMobileEditingStore } = require('User:Zvpunry/MobileEditingStore.js');
const EntityLookup = require('User:Zvpunry/components/EntityLookup.js');
const RankSelector = require('User:Zvpunry/components/RankSelector.js');
const SnakTypeSelector = require('User:Zvpunry/components/SnakTypeSelector.js');
const SnakValueInput = require('User:Zvpunry/components/SnakValueInput.js');

module.exports = {
  name: 'MEApp',
  template: `
      <cdx-dialog
          v-model:open="open"
          class="zvpundy-mobile-editing"
          :title="isEdit ? 'Edit a Statement' : 'Add a new Statement'"
          close-button-label="Cancel"
          @update:open="toggleDialog"
      >
          <component is="style" v-html="styles"></component>
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
              v-if="store.snaktype === 'value'"
            >
              <p>{{ $i18n('valueview-preview-label') }}</p>
              <div
                v-html="store.formattedDatavalueHTML"
                style="min-height:1lh;"
              ></div>
            </div>
            <h3
              style="clear:both;"
            >Qualifiers</h3>
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
      store.setSnakType(newSnakType);
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
    const styles = `
    @media (prefers-color-scheme: dark) {
      .zvpundy-mobile-editing {
        --color-base: #f8f9fa;
        --color-base--hover: #fff;
        --color-emphasized: #fff;
        --color-subtle: #eaecf0;
        --color-placeholder: #c8ccd1;
        --color-inverted: #101418;
        --color-progressive: #6d8af2;
        --color-progressive--hover: #afb6e9;
        --color-progressive--active: #c2d1f0;
        --color-destructive: #ff4242;
        --color-destructive--hover: #ef8174;
        --color-destructive--active: #f8a397;
        --color-visited: #977dbd;
        --color-error: #ff4242;
        --color-warning: #fc3;
        --color-success: #00af89;
        --color-notice: #f8f9fa;
        --color-content-added: #6d8af2;
        --color-content-removed: #ad822b;
        --box-shadow-color-base: #fff;
        --box-shadow-color-inverted: #000;
        --background-color-interactive: #27292d;
        --background-color-interactive-subtle: #202122;
        --background-color-disabled: #54595d;
        --background-color-disabled-subtle: #404244;
        --background-color-progressive-subtle: #1d2a42;
        --background-color-destructive-subtle: #421211;
        --background-color-error: #ff4242;
        --background-color-error--hover: #ef8174;
        --background-color-error--active: #f8a397;
        --background-color-error-subtle: #421211;
        --background-color-warning-subtle: #301d00;
        --background-color-success-subtle: #00261e;
        --background-color-notice-subtle: #202122;
        --background-color-content-added: #36c;
        --background-color-content-removed: #a66200;
        --background-color-backdrop-light: rgba(0,0,0,0.65);
        --background-color-backdrop-dark: rgba(255,255,255,0.65);
        --background-color-base: #101418;
        --background-color-neutral: #27292d;
        --background-color-neutral-subtle: #202122;
        --border-color-base: #72777d;
        --border-color-interactive: #a2a9b1;
        --border-color-disabled: #54595d;
        --border-color-subtle: #54595d;
        --border-color-muted: #404244;
        --border-color-inverted: #101418;
        --border-color-error: #ff4242;
        --border-color-error--hover: #ef8174;
        --border-color-warning: #fc3;
        --border-color-success: #00af89;
        --border-color-notice: #c8ccd1;
        --border-color-content-added: #36c;
        --border-color-content-removed: #a66200;

        /* copied from the mediawiki body so that the variables actually apply to text*/
        background-color: var(--background-color-base);
        color: var(--color-base);
    } }
    `;
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
      styles,
    };
  },
};
