module.exports = {
  env: {
    browser: true,
    es6: true,
    jquery: true,
    commonjs: true,
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2022,
  },
  rules: {
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['vite.config.js', 'dev/*.js', '**/__tests__/*' ],
      parserOptions: { sourceType: 'module' },
    },
  ],
};
