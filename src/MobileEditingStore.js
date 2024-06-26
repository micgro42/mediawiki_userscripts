// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
const { defineStore } = require('pinia');

const useMobileEditingStore = defineStore('MobileEditing', {
  state: () => ({
    isOpen: true,
    statementPropertyId: null,
    statementPropertyData: null,
    rank: undefined, // normal, preferred, deprecated
    snaktype: undefined, // value/somevalue/novalue
    datavalue: null,
    formattedDatavalueHTML: null,
    id: null,
    qualifiers: {},
    qualifiersOrder: [],
    references: [],
    lastApiErrorText: null,
  }),
  getters: {
    statementPropertyLabel: (state) => {
      console.log(
        'statementPropertyLabel accessed',
        state.statementPropertyId,
        state.statementPropertyData,
      );
      if (state.statementPropertyId === null) {
        return '';
      }
      if (state.statementPropertyData === null) {
        return `(${state.statementPropertyId})`;
      }
      const userLang = state.mwConfig.wgUserLanguage;
      if (state.statementPropertyData.labels[userLang]?.value) {
        return (
          state.statementPropertyData.labels[userLang].value +
          ` (${state.statementPropertyId})`
        );
      }
      if (state.statementPropertyData.labels.en?.value) {
        return (
          state.statementPropertyData.labels.en.value +
          ` (${state.statementPropertyId})`
        );
      }
      // TODO: check for mul?
      // TODO: include better fallback chain?
      // TODO: include language?
      // TODO: integrate into reading repository?
      return `(${state.statementPropertyI})`;
    },
    statementPropertyDataype: (state) => {
      if (state.statementPropertyId === null) {
        return '';
      }
      if (state.statementPropertyData === null) {
        return null;
      }
      return state.statementPropertyData.datatype;
    },
  },
  actions: {
    initFromData(statementData) {
      this.id = statementData.id;
      this.rank = statementData.rank;
      this.snaktype = statementData.mainsnak.snaktype;
      this.statementPropertyId = statementData.mainsnak.property;
      this.readingEntityRepository
        .loadEntity(this.statementPropertyId)
        .then((entityData) => {
          this.statementPropertyData = entityData;
        });
      if (this.snaktype === 'value') {
        this.setDatavalue(statementData.mainsnak.datavalue);
      }
      if (statementData.qualifiers) {
        this.qualifiers = statementData.qualifiers;
        this.qualifiersOrder = statementData['qualifiers-order'];
      }
      if (statementData.references) {
        this.references = statementData.references;
      }
    },
    setDatavalue(newDatavalue) {
      this.datavalue = newDatavalue;
      if (!newDatavalue) {
        this.formattedDatavalueHTML = '';
        return;
      }
      this.debouncedFormatDatavalue(
        this.statementPropertyId,
        newDatavalue,
      ).then(
        (data) => {
          if (data.result) {
            this.formattedDatavalueHTML = data.result;
          } else {
            this.formattedDatavalueHTML = '';
            console.error(
              'unexpected formatMainSnakDatavalue response',
              newDatavalue,
              data,
            );
          }
        },
        (...params) => {
          console.warn('formatMainSnakDatavalue rejected!');
          this.formattedDatavalueHTML = '';
          console.error(...params);
        },
      );
    },
    setSnakType(newSnakType) {
      this.snaktype = newSnakType;
      if (['somevalue', 'novalue'].includes(newSnakType)) {
        this.datavalue = null;
        this.formattedDatavalueHTML = '';
      }
    },
    setStatementPropertyId(propertyId) {
      this.statementPropertyId = propertyId;
      this.readingEntityRepository.loadEntity(propertyId).then((entityData) => {
        this.statementPropertyData = entityData;
      });
      this.rank = 'normal';
      this.snaktype = 'value';
    },
    saveStatement() {
      // FIXME: this should probably be in the store!
      const currentEntityId = this.mwConfig.entityId;
      if (this.id === null) {
        return this.statementWritingRepository
          .writeNewStatement(
            currentEntityId,
            this.statementPropertyId,
            this.rank,
            this.snaktype,
            this.datavalue,
          )
          .then(
            () => {},
            (code, data) => {
              this.lastApiErrorText = data.errors[0].text;
              throw new Error(code);
            },
          );
      }
      return this.statementWritingRepository
        .changeExistingStatement(
          currentEntityId,
          this.statementPropertyId,
          this.id,
          this.rank,
          this.snaktype,
          this.datavalue,
          this.qualifiers,
          this.qualifiersOrder,
          this.references,
        )
        .then(
          () => {},
          (code, data) => {
            this.lastApiErrorText = data.errors[0].text;
            throw new Error(code);
          },
        );
    },
    deleteStatement() {
      return this.statementWritingRepository.deleteStatement(this.id).then(
        () => {},
        (code, data) => {
          this.lastApiErrorText = data.errors[0].text;
          throw new Error(code);
        },
      );
    },
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
  },
});

module.exports = { useMobileEditingStore };
