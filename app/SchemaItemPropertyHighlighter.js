$(function () {
    const entityRegEx = /\b[PQ]\d+(?=\b|_)/g;
    const scriptName = 'SchemaItemPropertyHighlighter';

    function markupEntities(html, entitiesData) {
        return html.replace(entityRegEx, function (match) {
            return $('<a>').attr({
                href: 'https://www.wikidata.org/wiki/' + entitiesData[match].title,
                title: entitiesData[match].labels.en.value
            }).text(match)[0].outerHTML;
        });
    }

    function requestEntitiesData(listOfEntities) {
        const urlBase = 'https://www.wikidata.org/w/api.php';
        const urlParams = {
            action: 'wbgetentities',
            ids: listOfEntities.join('|'),
            props: 'labels|info',
            languages: 'en',
            format: 'json',
            origin: '*',
        };

        return fetch(
            urlBase + '?' + jQuery.param(urlParams)
        );
    }

    function getListOfEntitiesFromSchemaText(schemaText) {
        return [...new Set(schemaText.match(entityRegEx))];
    }

    const $schemaText = $('#wbschema-schema-text');
    if (!$schemaText.length || !$schemaText.text().length) {
        console.log('Not a Schema or Schema without text');
        return;
    }

    const listOfEntities = getListOfEntitiesFromSchemaText($schemaText.html());
    if (!listOfEntities.length) {
        console.log('No Entities found in text');
        return;
    }

    requestEntitiesData(listOfEntities)
        .then(function (response) {
            return response.json();
        })
        .then(function(responseData){
            if (responseData.error) {
                console.warn('Error in userscript: ' + scriptName);
                console.warn({
                    code: responseData.error.code,
                    info: responseData.error.info,
                    servedby: responseData.servedby,
                });
                return;
            }
            $schemaText.html(markupEntities($schemaText.html(), responseData.entities ));
        })
        .catch(function(error){
            console.warn('Error in userscript: ' + scriptName);
            console.warn(error);
        })
    ;
});
