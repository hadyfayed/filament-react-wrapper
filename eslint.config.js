
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [{
  ignores: ['dist/**', 'vendor/**', 'node_modules/**', '**/*.js'],
}, js.configs.recommended, {
  files: ['resources/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      // Browser essentials
      window: 'readonly',
      document: 'readonly',
      HTMLElement: 'readonly',
      Event: 'readonly',
      console: 'readonly',
      localStorage: 'readonly',
      sessionStorage: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',
      fetch: 'readonly',
      FormData: 'readonly',
      File: 'readonly',
      global: 'readonly',
      // DOM APIs
      MutationObserver: 'readonly',
      NodeListOf: 'readonly',
      Element: 'readonly',
      CustomEvent: 'readonly',
      Node: 'readonly',
      performance: 'readonly',
      ResizeObserver: 'readonly',
      IntersectionObserver: 'readonly',
      PerformanceObserver: 'readonly',
      IdleDeadline: 'readonly',
      requestIdleCallback: 'readonly',
      cancelIdleCallback: 'readonly',
      // Node.js
      process: 'readonly',
      __dirname: 'readonly',
      require: 'readonly',
      module: 'readonly',
      exports: 'readonly',
      // Testing
      vi: 'readonly',
      expect: 'readonly',
    },
  },
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    '@typescript-eslint': tsPlugin,
  },
  rules: {
    ...tsPlugin.configs.recommended.rules,
    ...reactPlugin.configs.recommended.rules,
    ...reactHooksPlugin.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-require-imports': 'warn',
    '@typescript-eslint/no-unsafe-function-type': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-useless-escape': 'warn',
    'no-redeclare': 'off',
    'no-import-assign': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}, prettierConfig];