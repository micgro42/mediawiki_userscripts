$(function () {
    const $schemaText = $('#entityschema-schema-text');
    if (!$schemaText.length || !$schemaText.text().length) {
        return;
    }

    const scriptName = 'EntitySchemaNewEntityCheckerLink';

    const urlBase = 'https://micgro42.github.io/wikidataShExValidator?schemaURL=';

    const schemaTextUrl = location.href.replace('EntitySchema:', 'Special:EntitySchemaText/');

    const $link = jQuery('<a>').attr({
        href: urlBase + schemaTextUrl,
        class: 'external',
    }).text('Beta Entity Checker');
    const fakeParserWrapper = jQuery('<span>').addClass('mw-parser-output').prepend($link);

    $('.entityschema-schema-text-links').prepend(fakeParserWrapper);
});
