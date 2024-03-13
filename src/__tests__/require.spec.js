import { describe, it, expect, vi, beforeEach } from 'vitest';
const fs = require('node:fs');

/**
 * @vitest-environment jsdom
 */

global.fetch = vi.fn();

function createFetchResponse(data) {
  return { text: () => new Promise((resolve) => resolve(data)) };
}
let rlRequire;

describe('require.js', () => {
  beforeEach(async () => {
    window.preloadedDependencies = null;
    window.mwLoaderRequire = null;
    window.console.error = vi.fn();

    rlRequire = vi.fn();
    const using = vi
      .fn()
      .mockImplementation((moduleName, callback) => callback(rlRequire));
    const getState = vi.fn();
    const mw = {
      loader: {
        using,
        getState,
      },
    };

    window.mw = mw;
    await vi.stubGlobal('mw', mw);

    const data = fs.readFileSync('src/require.js', 'utf8');
    eval(data);

    // FIXME: explicitly set location.host?
  });

  describe('happy paths', () => {
    it('uses the RL require for RL modules', () => {
      window.mw.loader.getState.mockReturnValue('ready');
      const moduleName = 'codex';
      window.require(moduleName);
      expect(rlRequire).toHaveBeenCalledWith(moduleName);
      expect(window.console.error).not.toHaveBeenCalled();
    });

    it('loads and evaluates a custom user script', async () => {
      window.mw.loader.getState.mockReturnValue(null);
      fetch.mockResolvedValue(createFetchResponse('module.exports=5;'));
      const moduleName = `User:Abc/xyz${Math.random()}.js`;
      await window.preloadDependency(moduleName);
      expect(fetch).toHaveBeenCalledWith(
        `//localhost:3000/w/index.php?title=${moduleName}&action=raw&ctype=text/javascript`,
      );
      expect(window.require(moduleName)).toBe(5);
      expect(rlRequire).not.toHaveBeenCalled();
      expect(window.console.error).not.toHaveBeenCalled();
    });

    it('creates a new object for each require call', async () => {
      window.mw.loader.getState.mockReturnValue(null);
      fetch.mockResolvedValue(createFetchResponse('module.exports={value:5};'));
      const moduleName = `User:Abc/xyz${Math.random()}.js`;
      await window.preloadDependency(moduleName);
      expect(fetch).toHaveBeenCalledWith(
        `//localhost:3000/w/index.php?title=${moduleName}&action=raw&ctype=text/javascript`,
      );
      const firstCallResult = window.require(moduleName);
      expect(firstCallResult.value).toBe(5);
      const secondCallResult = window.require(moduleName);
      expect(secondCallResult.value).toBe(5);
      expect(firstCallResult).not.toBe(secondCallResult);
      expect(window.console.error).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('throws if module name does not end with .js', () => {
      window.mw.loader.getState.mockReturnValue(null);
      expect(() => window.preloadDependency('foo bar')).rejects.toThrow(
        '"foo bar", missing ".js" suffix!',
      );
    });

    it('throws if module has not been preloaded', () => {
      window.mw.loader.getState.mockReturnValue(null);
      const moduleName = `User:Abc/xyz${Math.random()}.js`;
      expect(() => window.require(moduleName)).toThrow(
        `Failed loading module ${moduleName}`,
      );
    });

    it('throws when preloading empty modules', () => {
      fetch.mockResolvedValue(createFetchResponse(''));
      const moduleName = `User:Abc/xyz${Math.random()}.js`;
      expect(() => window.preloadDependency(moduleName)).rejects.toThrow(
        `Failed preloading module ${moduleName}! Module is empty!`,
      );
    });
  });
});
