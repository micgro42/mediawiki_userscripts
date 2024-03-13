// This file is maintained at https://gitlab.wikimedia.org/migr/mediawiki_userscripts
/**
 * This adds two methods to the global window object: preloadDependency() and require()
 *
 * A common.js script/file/module stored on the current wiki (location.host) can be asynchronously loaded with
 * `preloadDependency(<title of the page containing the module>)` and then anywhere else synchronously accessed with
 * `require(<title of the page containing the module>)`
 *
 * `require(<resource loader module>)` still works as expected as well, that is, resource-loader must have loaded the
 * module already (`mw.loader.getState(<resource loader module>) === 'ready')
 */
(function () {
  /* global mw */
  mw.loader.using('mediawiki.api', (require) => {
    window.mwLoaderRequire = require;
  });

  function validateModuleName(moduleName) {
    if (!moduleName.endsWith('.js')) {
      throw new Error(`"${moduleName}", missing ".js" suffix!`);
    }
  }

  function getPreloadedModuleText(moduleName) {
    const nameParts = moduleName.split('/');
    let module = window.preloadedDependencies;
    try {
      for (const part of nameParts) {
        module = module[part];
      }
    } catch (e) {
      console.error(
        `Failed loading ${moduleName}! Has it been preloaded with preloadDependency()?`,
        e,
      );
      throw new Error(`Failed loading module ${moduleName}`);
    }

    if (!module) {
      console.error(
        `Failed loading ${moduleName}! Has it been preloaded with preloadDependency()?`,
      );
      throw new Error(`Failed loading module ${moduleName}`);
    }

    return module;
  }

  function storeModuleText(moduleName, moduleText) {
    const nameParts = moduleName.split('/');
    const scriptName = nameParts.pop();
    if (!window.preloadedDependencies) {
      window.preloadedDependencies = {};
    }
    let ref = window.preloadedDependencies;
    for (const part of nameParts) {
      if (typeof ref[part] === 'undefined') {
        ref[part] = {};
      }
      ref = ref[part];
    }
    ref[scriptName] = moduleText;
  }

  function executeModuleText(moduleText) {
    const module = {};
    Function('module', moduleText)(module);
    return module.exports;
  }

  window.require = function require(moduleName) {
    const moduleState = mw.loader.getState(moduleName);
    if (moduleState === 'ready') {
      return window.mwLoaderRequire(moduleName);
    }
    if (moduleState !== null) {
      throw new Error(`state for ${moduleName} is ${moduleState}`);
    }

    validateModuleName(moduleName);

    const moduleText = getPreloadedModuleText(moduleName);

    return executeModuleText(moduleText);
  };

  window.preloadDependency = async function preloadDependency(moduleName) {
    validateModuleName(moduleName);
    const host = location.host;
    const url = `//${host}/w/index.php?title=${moduleName}&action=raw&ctype=text/javascript`;
    // TODO: make sure caching works (must revalidate)!
    return fetch(url).then(
      async function (response) {
        const scriptText = await response.text();
        if (!scriptText) {
          throw new Error(
            `Failed preloading module ${moduleName}! Module is empty!`,
          );
        }
        storeModuleText(moduleName, scriptText);
      },
      (...errorParams) => {
        console.error(...errorParams);
      },
    );
  };
})();
