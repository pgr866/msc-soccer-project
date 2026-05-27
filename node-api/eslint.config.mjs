import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
      'class-methods-use-this': 'off',
      'no-param-reassign': 'off',
      'camelcase': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    ...jestPlugin.configs['flat/recommended'],
  }
);
