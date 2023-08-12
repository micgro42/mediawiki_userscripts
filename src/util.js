// This file is maintained at https://github.com/micgro42/mediawiki_userscripts

function debounce(cb, timeout) {
  let timeoutId = null;
  return function (...params) {
    return new Promise(function (resolve) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      timeoutId = setTimeout(function () {
        timeoutId = null;
        resolve(cb(...params));
      }, timeout);
    });
  };
}

module.exports = { debounce };
