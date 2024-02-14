// This file is maintained at https://github.com/micgro42/mediawiki_userscripts
function getNewClaimGUID(entityId) {
  if (!crypto.randomUUID) {
    // TODO: some tracking here would be nice.
    const claimGuidGenerator = new wikibase.utilities.ClaimGuidGenerator(
      entityId,
    );
    return claimGuidGenerator.newGuid();
  }

  return `${entityId}$${crypto.randomUUID()}`;
}

const summary = 'Made with [[User:Zvpunry/MobileEditing.js]]';
const api = new mw.Api(); // inject?

function writeApi(claim, extraParams = {}) {
  const params = api.assertCurrentUser({
    action: 'wbsetclaim',
    claim: JSON.stringify(claim),
    summary,
    formatversion: 2,
    format: 'json',
    ...extraParams,
    // tags?
  });
  return api.postWithEditToken(params);
}

function writeNewStatement(entityId, propertyId, rank, snaktype, datavalue) {
  const claim = {
    id: getNewClaimGUID(entityId),
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

  return writeApi(claim, { ignoreduplicatemainsnak: true });

  // const params = api.assertCurrentUser( {
  // 	action: 'wbsetclaim',
  // 	ignoreduplicatemainsnak: true,
  // 	claim: JSON.stringify(claim),
  // 	summary,
  // 	formatversion: 2,
  // 	format: 'json',
  // 	// tags?
  // } );
  // console.log('writeNewStatement', params);
  // return api.postWithEditToken( params );
}

function changeExistingStatement(
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

  return writeApi(claim);
}

module.exports = { writeNewStatement, changeExistingStatement };
