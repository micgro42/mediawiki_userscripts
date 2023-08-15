const messages = {
    'wikibase-statementview-rank-deprecated': 'Deprecated rank',
    'wikibase-statementview-rank-normal': 'Normal rank',
    'wikibase-statementview-rank-preferred': 'Preferred rank',
};

function escape( s ) {
    return s.replace(
        /[^0-9A-Za-z,.: ]/g,
        ( c ) => '&#' + c.charCodeAt( 0 ) + ';',
    );
}

function replace( message, ...args ) {
    return message.replace(
        /\$(\d+)/g,
        ( _, i ) => args[ i - 1 ],
    );
}

function resolveKey(key, ...params) {
    return messages[ key ] !== undefined ? replace( messages[ key ], ...params.map( escape ) ) : `⧼${key}⧽`;
}

export default {
    install: (app) => {
      app.config.globalProperties.$i18n = resolveKey

      app.provide('i18n', resolveKey)
    }
  }