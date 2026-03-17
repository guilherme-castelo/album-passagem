import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2021,
        Quill: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^e(rr)?$'
        }
      ],
      'no-console': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto'
        }
      ]
    }
  },
  {
    ignores: ['node_modules/', 'dist/', '.env', 'public/admin/assets/', '**/*.min.js']
  }
];
