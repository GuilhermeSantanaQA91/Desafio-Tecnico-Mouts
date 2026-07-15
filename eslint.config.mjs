import js from '@eslint/js';
import pluginCypress from 'eslint-plugin-cypress';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
	js.configs.recommended,
	pluginCypress.configs.recommended,
	prettierConfig,

	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'coverage/**',
			'cypress/videos/**',
			'cypress/screenshots/**',
			'cypress/downloads/**',
			'cypress/snapshots/**',
			'cypress/reports/**',
			'*.min.js',
		],
	},

	{
		files: ['cypress/**/*.js', '**/*.cy.js', '**/*.spec.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			'prettier/prettier': 'error',
			'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'no-console': 'off',
			'no-debugger': 'warn',
			'prefer-const': 'error',
			'no-var': 'error',
			'cypress/assertion-before-screenshot': 'warn',
			'cypress/no-force': 'warn',
			'cypress/no-pause': 'error',
		},
	},

	{
		files: ['*.config.js', '*.config.mjs', 'cypress/**/*.config.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				require: 'readonly',
				module: 'readonly',
				exports: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				global: 'readonly',
				console: 'readonly',
			},
		},
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			'prettier/prettier': 'error',
			'no-console': 'off',
		},
	},
];
