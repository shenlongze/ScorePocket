import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        uni: true,
        App: true,
        Page: true,
        Component: true
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        uni: true,
        App: true,
        Page: true,
        Component: true
      },
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tsParser
      }
    },
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': typescriptEslint,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/no-unused-vars': 'warn',
      'vue/valid-template-root': 'error',
      'vue/valid-v-for': 'error',
      'vue/valid-v-if': 'error',
      'vue/valid-v-show': 'error',
      'vue/valid-v-bind': 'error',
      'vue/valid-v-model': 'error',
      'vue/valid-v-on': 'error',
      'vue/no-duplicate-attributes': 'error',
      'vue/no-multiple-template-root': 'error'
    }
  },
  prettierConfig
]
