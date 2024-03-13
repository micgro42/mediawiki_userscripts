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

  it('uses the RL require for RL modules', () => {
    mw.loader.getState.mockReturnValue('ready');
    const moduleName = 'codex';
    window.require(moduleName);
    expect(rlRequire).toHaveBeenCalledWith(moduleName);
  });

  it('loads and evaluates a custom user script', async () => {
    mw.loader.getState.mockReturnValue(null);
    fetch.mockResolvedValue(createFetchResponse('module.exports=5;'));
    const moduleName = 'User:Abc/xyz.js';
    await window.preloadDependency(moduleName);
    expect(fetch).toHaveBeenCalledWith(
      '//localhost:3000/w/index.php?title=User:Abc/xyz.js&action=raw&ctype=text/javascript',
    );
    expect(window.require(moduleName)).toBe(5);
    expect(rlRequire).not.toHaveBeenCalled();
  });

  it('creates a new object for each require call', async () => {
    mw.loader.getState.mockReturnValue(null);
    fetch.mockResolvedValue(createFetchResponse('module.exports={value:5};'));
    const moduleName = 'User:Abc/xyz.js';
    await window.preloadDependency(moduleName);
    expect(fetch).toHaveBeenCalledWith(
      '//localhost:3000/w/index.php?title=User:Abc/xyz.js&action=raw&ctype=text/javascript',
    );
    const firstCallResult = window.require(moduleName);
    expect(firstCallResult.value).toBe(5);
    const secondCallResult = window.require(moduleName);
    expect(secondCallResult.value).toBe(5);
    expect(firstCallResult).not.toBe(secondCallResult);
  });
});
