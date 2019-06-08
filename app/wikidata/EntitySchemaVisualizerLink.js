$(function () {
	const $schemaText = $('#entityschema-schema-text');
	if (!$schemaText.length || !$schemaText.text().length) {
		return;
	}

	const scriptName = 'EntitySchemaVisualizerLink';

	const urlBase = 'http://rdfshape.weso.es/schemaInfo?schemaFormat=ShExC&schemaEngine=ShEx&schemaURL=';

	const schemaTextUrl = location.href.replace('EntitySchema:', 'Special:EntitySchemaText/');

	const $link = jQuery('<a>').attr({
		href: urlBase + schemaTextUrl,
		class: 'external',
	}).text('Visualize Schema');
	const fakeParserWrapper = jQuery('<span>').addClass('mw-parser-output').prepend($link);

	$('.entityschema-schema-text-links').prepend(fakeParserWrapper);
});
