// This file is maintained at https://gitlab.wikimedia.org/migr/mediawiki_userscripts
(function () {
  mw.loader.using('mediawiki.api', (require) => {
    window.mwLoaderRequire = require;
  });

  function fixModuleName(moduleName) {
    if (
      moduleName.endsWith('.js') ||
      moduleName === 'User:Zvpunry/components'
    ) {
      return moduleName;
    }
    throw new Error(`"${moduleName}", missing ".js" suffix!`);
  }

  window.require = function require(initialModuleName) {
    const moduleState = mw.loader.getState(initialModuleName);
    if (moduleState === 'ready') {
      return window.mwLoaderRequire(initialModuleName);
    }
    if (moduleState !== null) {
      throw new Error(
        'state for ' +
          initialModuleName +
          ' is ' +
          mw.loader.getState(initialModuleName),
      );
    }

    const moduleName = fixModuleName(initialModuleName);
    // loading user script dependency preloaded with preloadDependency
    const nameParts = moduleName.split('/');
    let module = window.preloadedDependencies;
    let scriptText = null;
    try {
      // console.log(moduleName);
      for (const part of nameParts) {
        module = module[part];
      }
    } catch (e) {
      console.error(
        `Failed loading ${moduleName}! Has it been preloaded with preloadDependency()?`,
        e,
      );
      throw e;
    }

    if (!module) {
      console.error(
        `Failed loading ${moduleName}! Has it been preloaded with preloadDependency()?`,
      );
      throw new Error(`Failed loading module ${moduleName}`);
    }

    return module;
  };

  const moduleEvaluatingHandler = {
    get(target, prop, receiver) {
      let propValue = Reflect.get(...arguments);
      if (!propValue) {
        propValue = Reflect.get(target, `${prop}.js`, receiver);
      }
      if (typeof propValue === 'string') {
        // .log(`Accessing ${prop} via proxy`)
        const module = {};
        Function('module', propValue)(module);
        return module.exports;
      }

      return propValue;
    },
  };

  window.preloadDependency = async function preloadDependency(
    initialModuleName,
  ) {
    // also consider mw.loader.using here?

    const moduleName = fixModuleName(initialModuleName);
    const host = location.host;
    const options = {
      dataType: 'text',
      cache: true,
      url: `//${host}/w/index.php?title=${moduleName}&action=raw&ctype=text/javascript`,
    };
    return jQuery
      .ajax(options)
      .done(function (scriptText) {
        const nameParts = moduleName.split('/');
        const scriptName = nameParts.pop();
        if (!window.preloadedDependencies) {
          window.preloadedDependencies = {};
        }
        let ref = window.preloadedDependencies;
        for (const part of nameParts) {
          if (typeof ref[part] === 'undefined') {
            ref[part] = new Proxy({}, moduleEvaluatingHandler);
          }
          ref = ref[part];
        }
        if (!scriptText) {
          throw new Error(`Failed preloading module ${moduleName}!`);
        }
        ref[scriptName] = scriptText;
      })
      .fail((...errorParams) => {
        console.error(...errorParams);
      });
  };
})();