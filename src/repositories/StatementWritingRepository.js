// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
class StatementWritingRepository {
  #api;
  #langCode;
  #legacyWikibaseGUIDGenerator;

  constructor(api, langCode, legacyWikibaseGUIDGenerator) {
    this.#api = api;
    this.#langCode = langCode;
    this.#legacyWikibaseGUIDGenerator = legacyWikibaseGUIDGenerator;
  }

  writeNewStatement(entityId, propertyId, rank, snaktype, datavalue) {
    const claim = {
      id: this.#getNewClaimGUID(entityId),
      mainsnak: {
        snaktype,
        property: propertyId,
      },
      rank,
      type: 'statement',
    };
    if (snaktype === 'value') {
      if (!datavalue) {
        throw new Error(
          'StatementWritingRepository: snaktype is "value", but no value provided!',
        );
      }
      claim.mainsnak.datavalue = datavalue;
    }

    return this.#writeApi(claim, { ignoreduplicatemainsnak: true });
  }

  changeExistingStatement(
    entityId,
    propertyId,
    statementId,
    rank,
    snaktype,
    datavalue,
    qualifiers,
    qualifierOrder,
    references,
  ) {
    const claim = {
      id: statementId,
      mainsnak: {
        snaktype,
        property: propertyId,
      },
      rank,
      type: 'statement',
      qualifiers,
      qualifierOrder,
      references,
    };
    if (snaktype === 'value') {
      if (!datavalue) {
        throw new Error(
          'StatementWritingRepository: snaktype is "value", but no value provided!',
        );
      }
      claim.mainsnak.datavalue = datavalue;
    }

    return this.#writeApi(claim);
  }

  deleteStatement(statementId) {
    const params = {
      action: 'wbremoveclaims',
      claim: statementId,
      // TODO: assert baserevid?
      //       => wgRevisionId
      //       What to do if edit conflict?
    };
    const paramsWithAssertUser = this.#api.assertCurrentUser(params);
    return this.#api.postWithEditToken(paramsWithAssertUser);
  }

  #writeApi(claim, extraParams = {}) {
    // Allow custom summary by user?
    const summary = 'Made with [[User:Zvpunry/MobileEditing.js]]';

    const params = this.#api.assertCurrentUser({
      action: 'wbsetclaim',
      claim: JSON.stringify(claim),
      summary,
      ...extraParams,
      // tags?
    });
    return this.#api.postWithEditToken(params);
  }

  #getNewClaimGUID(entityId) {
    if (!crypto.randomUUID) {
      // TODO: some tracking here would be nice to know how much this fallback is still used.
      //       see https://caniuse.com/mdn-api_crypto_randomuuid
      return this.#legacyWikibaseGUIDGenerator.newGuid();
    }

    return `${entityId}$${crypto.randomUUID()}`;
  }
}

module.exports = StatementWritingRepository;
