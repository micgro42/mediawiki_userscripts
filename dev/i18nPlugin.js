const messages = {
  'wikibase-quantitydetails-amount': 'Amount',
  'wikibase-statementview-rank-deprecated': 'Deprecated rank',
  'wikibase-statementview-rank-normal': 'Normal rank',
  'wikibase-statementview-rank-preferred': 'Preferred rank',
  'wikibase-snakview-variations-somevalue-label': 'unknown value',
  'wikibase-snakview-variations-novalue-label': 'no value',
  'wikibase-snakview-snaktypeselector-value': 'custom value',
  'wikibase-publish': 'publish',
  'wikibase-remove': 'remove',
  'valueview-expertextender-languageselector-label': 'Language (mandatory):',
  'valueview-expertextender-unitsuggester-label': 'Unit (optional):',
  'valueview-expert-globecoordinateinput-precision': 'Precision:',
  'valueview-expert-globecoordinateinput-nullprecision': 'unspecified',
  'valueview-expert-globecoordinateinput-customprecision': 'special ($1)',
  'valueview-expert-globecoordinateinput-precisionlabel-arcminute':
    'to an arcminute',
  'valueview-expert-globecoordinateinput-precisionlabel-arcsecond':
    'to an arcsecond',
  'valueview-expert-globecoordinateinput-precisionlabel-tenth-of-arcsecond':
    'to 1/10 of an arcsecond',
  'valueview-expert-globecoordinateinput-precisionlabel-hundredth-of-arcsecond':
    'to 1/100 of an arcsecond',
  'valueview-expert-globecoordinateinput-precisionlabel-thousandth-of-arcsecond':
    'to 1/1000 of an arcsecond',
  'valueview-expert-globecoordinateinput-precisionlabel-tenthousandth-of-arcsecond':
    "1/10000'",
  'valueview-expert-timeinput-precision': 'Precision:',
  'valueview-expert-timeinput-precision-day': 'day',
  'valueview-expert-timeinput-precision-month': 'month',
  'valueview-expert-timeinput-precision-year': 'year',
  'valueview-expert-timeinput-calendar': 'Calendar:',
  'valueview-expert-timevalue-calendar-julian': 'Julian',
  'valueview-expert-timevalue-calendar-gregorian': 'Gregorian',
  'valueview-preview-label': 'will be displayed as:',
};

function escape(s) {
  return s.replace(/[^0-9A-Za-z,.: ]/g, (c) => '&#' + c.charCodeAt(0) + ';');
}

function replace(message, ...args) {
  return message.replace(/\$(\d+)/g, (_, i) => args[i - 1]);
}

function resolveKey(key, ...params) {
  return messages[key] !== undefined
    ? replace(messages[key], ...params.map(escape))
    : `⧼${key}⧽`;
}

export default {
  install: (app) => {
    app.config.globalProperties.$i18n = resolveKey;

    app.provide('i18n', resolveKey);
  },
};
