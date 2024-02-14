// This file is maintained at https://gitlab.wikimedia.org/migr/mediawiki_userscripts
/*
 * A Work-In-Progress user script (wannabe gadget) to add proper mobile editing for statements to Wikidata
 *
 * TODO Next:
 *   [ ]: add support for qualifiers
 *   [ ]: add support for quantity
 *   [ ]: add full support for globe coordinate
 *      [ ]: figure out how to make the map fully live
 *      [ ]: add Item-Lookup for globe
 *
 * TODO MS1 "Publish":
 *   [ ]: make dialog title "Add new statement" correct when actually editing a statement
 *   [ ]: add support for deleting statements
 *   [ ]: fix "bouncing" of overall Dialog as values are edited -> formatting!
 *   [ ]: remove datavalue <pre>
 *   [ ]: EntityLookup: load-more behavior
 *   [ ]: EntityLookup: call wbsearchentities with UI language, not always english
 *   [ ]: EntityLookup: show some animation or something when loading results for initial selection
 *   [ ]: show current entity label somewhere
 *   [ ]: reduce console.log noise
 *   [ ]: Bug: Changing _only_ the rank does not seem to work? Changing rank and datavalue works, though.
 *   [ ]: don't to anything on pages for non-existing entities
 *   [ ]: replace as much copy as possible with i18n message
 *   [ ]: write proper documentation into this file
 *
 * TODO: After:
 *   [ ]: add support for references
 *   [ ]: Figure out why throwing in preloadDependency(...) does not halt script execution
 *   [ ]: add support for quick-buttons that skip property-selection (use localstorage!)
 *   [ ]: use property suggestions API?
 *   [ ]: add usage instructions from selected property (see "Wikidata usage instructions" (P2559))
 *   [ ]: add placeholder from examples of selected property (see "Wikidata property example" (P1855))
 *   [ ]: figure out how to use the cdxIconEdit in the edit buttons
 *   [ ]: prevent/improve edit conflicts by somehow making use of baserevid
 *
 *
 * DONE:
 *   [x]: add support for monolingual text
 *   [x]: have value input components emit a update:datavalue event for consistency
 *   [x]: make sure entities are properly unselected
 *   [x]: EntityValueInput: reset datavalue when unselecting option by typing
 *   [x]: figure out why the displayed value in time input jumps back to the original
 *   [x]: figure out how to get to error.info for malformed time value
 *   [x]: fix syntax errors in console from require.js
 *   [x]: add support for datatype time
 *   [x]: create/find phab task about missing labels for search Lexeme Forms by ID: T343737
 *   [x]: create/find phab task about having to search senses by ID: T271500
 *   [x]: add support for actual editing
 *   [x]: add preview of main datavalue
 *   [x]: add support for entities: Items first, then Properties, then others
 *   [x]: show saving errors
 *   [x]: load components only once and all upfront
 *   [x]: change api-endpoint to wbsetclaim -> better autosummary
 *   [x]: consider better summary message
 *
 *
 * Upstream issues affecting this:
 * https://phabricator.wikimedia.org/T343737: Searching for a Form-Id with `wbsearchentities` does not return "label" and "description" data for the results
 * https://phabricator.wikimedia.org/T271500: Not possible to search for a sense when adding a statement
 * https://phabricator.wikimedia.org/T344543: Setting initial menu items in Lookups doesn't work (PropertySuggester)
 * TBC: setting initial value for Codex Lookup is convoluted
 *
 * Upsteam issues done:
 * https://phabricator.wikimedia.org/T344542: Codex Lookup dropdown being "stuck"
 * https://phabricator.wikimedia.org/T344541: Codex Dialog does not add class to body about background not scrolling
 */
jQuery(async () => {
  if (mw.config.get('skin') !== 'minerva') {
    console.log(
      'Not minvera skin, not adding mobile editing. Actual skin: ' +
        mw.config.get('skin'),
    );
    return;
  }
  if (!/([QPL])\d+/.test(mw.config.get('wgTitle'))) {
    console.log(
      'Not an Entity page, not adding mobile editing. Actual title: ' +
        mw.config.get('wgTitle'),
    );
    return;
  }

  performance.mark('mobile editing init start');

  const host = location.host;
  if (typeof preloadDependency === 'undefined') {
    await mw.loader.getScript(
      `https://${host}/w/index.php?title=User:Zvpunry/require.js&action=raw&ctype=text/javascript`,
    );
  }

  await Promise.all([
    mw.loader.using([
      'codex-styles',
      'vue',
      'pinia',
      '@wikimedia/codex',
      'wikibase.utilities.ClaimGuidGenerator',
      'wikibase.WikibaseContentLanguages',
    ]),
    // loading all messages that we need anywhere
    new mw.Api().loadMessagesIfMissing([
      'wikibase-statementgrouplistview-add',
      'valueview-preview-label',
      'wikibase-publish',
      'wikibase-snakview-snaktypeselector-value',
      'wikibase-snakview-variations-somevalue-label',
      'wikibase-snakview-variations-novalue-label',
      'wikibase-statementview-rank-deprecated',
      'wikibase-statementview-rank-normal',
      'wikibase-statementview-rank-preferred',
      'valueview-expert-timeinput-calendar',
      'valueview-expert-timevalue-calendar-julian',
      'valueview-expert-timevalue-calendar-gregorian',
      'valueview-expert-timeinput-precision',
      'valueview-expert-timeinput-precision-day',
      'valueview-expert-timeinput-precision-month',
      'valueview-expert-timeinput-precision-year',
      'valueview-expert-timeinput-precision-year10',
      'valueview-expert-timeinput-precision-year100',
      'valueview-expert-timeinput-precision-year1k',
      'valueview-expert-timeinput-precision-year10k',
      'valueview-expert-timeinput-precision-year100k',
      'valueview-expert-timeinput-precision-year1m',
      'valueview-expert-timeinput-precision-year10m',
      'valueview-expert-timeinput-precision-year100m',
      'valueview-expert-timeinput-precision-year1g',
      'valueview-expertextender-languageselector-label',
      'valueview-expert-globecoordinateinput-precisionlabel-tenthousandth-of-arcsecond',
      'valueview-expert-globecoordinateinput-precisionlabel-thousandth-of-arcsecond',
      'valueview-expert-globecoordinateinput-precisionlabel-hundredth-of-arcsecond',
      'valueview-expert-globecoordinateinput-precisionlabel-tenth-of-arcsecond',
      'valueview-expert-globecoordinateinput-precisionlabel-arcsecond',
      'valueview-expert-globecoordinateinput-precisionlabel-arcminute',
      'valueview-expert-globecoordinateinput-precision',
    ]),
    // loading all needed user scripts so that they can be accessed with require()
    preloadDependency('User:Zvpunry/components/RankSelector.js'),
    preloadDependency('User:Zvpunry/components/EntityLookup.js'),
    preloadDependency('User:Zvpunry/components/SnakTypeSelector.js'),
    preloadDependency('User:Zvpunry/components/SnakValueInput.js'),
    preloadDependency('User:Zvpunry/components/StringValueInput.js'),
    preloadDependency('User:Zvpunry/components/EntityValueInput.js'),
    preloadDependency('User:Zvpunry/components/TimeValueInput.js'),
    preloadDependency('User:Zvpunry/components/MonoLingualTextValueInput.js'),
    preloadDependency('User:Zvpunry/components/GlobeCoordinateValueInput.js'),
    preloadDependency(
      'User:Zvpunry/repositories/CachingReadingEntityRepository.js',
    ),
    preloadDependency(
      'User:Zvpunry/repositories/StatementWritingRepository.js',
    ),
    preloadDependency(
      'User:Zvpunry/repositories/DatavalueFormattingRepository.js',
    ),
    preloadDependency('User:Zvpunry/repositories/SearchEntitiesRepository.js'),
    preloadDependency('User:Zvpunry/repositories/ValueParsingRepository.js'),
    preloadDependency('User:Zvpunry/MobileEditingStore.js'),
    preloadDependency('User:Zvpunry/MEApp.js'),
    preloadDependency('User:Zvpunry/util.js'),
  ]);

  const Main = require('User:Zvpunry/MEApp.js');
  const $mountPoint = $('<div id="ZvpunryMobileEditing"></div>');
  $('#bodyContent').append($mountPoint);

  function mountMobileEditingApp(statementData = null) {
    const app = Vue.createMwApp(Main);
    const { markRaw } = require('vue');
    const { createPinia } = require('pinia');
    const {
      formatDatavalue,
      formatDatavaluePlain,
    } = require('User:Zvpunry/repositories/DatavalueFormattingRepository.js');
    const { debounce } = require('User:Zvpunry/util.js');
    const SearchEntitiesRepository = require('User:Zvpunry/repositories/SearchEntitiesRepository.js');
    const {
      loadEntity,
    } = require('User:Zvpunry/repositories/CachingReadingEntityRepository.js');
    const {
      writeNewStatement,
      changeExistingStatement,
    } = require('User:Zvpunry/repositories/StatementWritingRepository.js');
    const ValueParsingRepository = require('User:Zvpunry/repositories/ValueParsingRepository.js');

    const api = new mw.Api();
    const searchEntitiesRepository = new SearchEntitiesRepository(
      api,
      mw.config.get('wgUserLanguage'),
    );
    const valueParsingRepository = new ValueParsingRepository(api);

    const pinia = createPinia();
    pinia.use(({ store }) => {
      store.debouncedFormatDatavalue = markRaw(debounce(formatDatavalue, 500));
    });
    pinia.use(({ store }) => {
      store.readingEntityRepository = markRaw({ loadEntity });
    });
    pinia.use(({ store }) => {
      store.statementWritingRepository = markRaw({
        writeNewStatement,
        changeExistingStatement,
      });
    });
    pinia.use(() => ({
      mwConfig: { wgUserLanguage: mw.config.get('wgUserLanguage') },
    }));
    app.use(pinia);
    app.provide('searchEntitiesRepository', searchEntitiesRepository);
    app.provide('valueParsingRepository', valueParsingRepository);
    app.provide('formatDatavaluePlain', formatDatavaluePlain);
    app.provide('isProduction', host === 'm.wikidata.org');
    app.provide('statementData', statementData);
    app.provide('i18n', mw.msg);
    app.provide(
      'monoLingualTextLanguages',
      wikibase.WikibaseContentLanguages.getMonolingualTextLanguages().getLanguageNameMap(),
    );
    app.mount('#ZvpunryMobileEditing');
  }

  const $addStatementButton = jQuery('<button class="cdx-button">').text(
    mw.msg('wikibase-statementgrouplistview-add'),
  );
  jQuery('#claims').after($addStatementButton);
  $addStatementButton.on('click', () => mountMobileEditingApp());

  const {
    loadEntity,
  } = require('User:Zvpunry/repositories/CachingReadingEntityRepository.js');
  const currentEntity = await loadEntity(mw.config.get('wgTitle'));
  const statements = [];
  for (const propertyId in currentEntity.claims) {
    statementValues = currentEntity.claims[propertyId];
    statementValues.forEach(
      (statement) => (statements[statement.id] = statement),
    );
  }
  Object.keys(statements).forEach((statementId) => {
    $editStatementButton = jQuery(
      '<button class="cdx-button cdx-button--icon-only" aria-label="edit">',
    )
      .text('🖊️')
      .css('float', 'right');
    $editStatementButton.on('click', () =>
      mountMobileEditingApp(statements[statementId]),
    );
    jQuery(document.getElementById(statementId)).prepend($editStatementButton);
  });

  performance.mark('mobile editing init done');
  console.log(
    performance.measure(
      'modile editing init timing',
      'mobile editing init start',
      'mobile editing init done',
    ),
  );
});
