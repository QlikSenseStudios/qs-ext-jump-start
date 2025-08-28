import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: 'error',
      curly: 'error',
    },
  },
  // Allow CommonJS in test files (Playwright test modules use require/module.exports here)
  {
    files: ['test/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      // Allow console logs in tests for debugging and traceability
      'no-console': 'off',
    },
  },
  // But allow ESM for specific test files that use import/export
  {
    files: ['test/qs-ext.fixture.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'bundle-analysis.html', 'test/report/**', '*.config.js'],
  },
];
