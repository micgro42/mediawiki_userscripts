$(function () {
    const entityRegEx = /\b[PQ]\d+(?=\b|_)/g;
    const scriptName = 'SchemaItemPropertyHighlighter';

    function markupEntities(html, entitiesData) {
        return html.replace(entityRegEx, function (match) {
            if (!entitiesData[match] || typeof entitiesData[match].missing !== 'undefined') {
                return match;
            }
            return $('<a>').attr({
                href: 'https://www.wikidata.org/wiki/' + entitiesData[match].title,
                title: entitiesData[match].labels.en.value
            }).text(match)[0].outerHTML;
        });
    }

    async function requestEntitiesData(listOfEntities) {
        const entityBatches = splitIntoBatches(listOfEntities);

        const data = {};
        for (const batch of entityBatches) {
            let dataBatch = await requestBatchEntitiesData(batch);
            Object.assign(data, dataBatch);
        }

        return data;
    }

    async function requestBatchEntitiesData(listOfEntities) {
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
        ).then(function (response) {
                return response.json();
            }
        ).then(function (responseData) {
            if (responseData.error) {
                console.warn('Error in userscript: ' + scriptName);
                console.warn({
                    code: responseData.error.code,
                    info: responseData.error.info,
                    servedby: responseData.servedby,
                });
                return;
            }
            return responseData.entities;
        });
    }

    function splitIntoBatches(listOfEntities) {
        const maxBatchSize = 50.0;
        return listOfEntities.reduce((acc, cur, i) => {
            const index = Math.floor(i / maxBatchSize);
            if (!acc[index]) {
                acc[index] = [];
            }
            acc[index].push(cur);
            return acc;
        }, []);
    }

    function getListOfEntitiesFromSchemaText(schemaText) {
        return [...new Set(schemaText.match(entityRegEx))];
    }

    const $schemaText = $('#entityschema-schema-text');
    if (!$schemaText.length || !$schemaText.text().length) {
        return;
    }

    const listOfEntities = getListOfEntitiesFromSchemaText($schemaText.html());
    if (!listOfEntities.length) {
        return;
    }

    requestEntitiesData(listOfEntities)
        .then(function (responseData) {
            $schemaText.html(markupEntities($schemaText.html(), responseData));
        })
        .catch(function (error) {
            console.warn('Error in userscript: ' + scriptName);
            console.warn(error);
        })
    ;
});
