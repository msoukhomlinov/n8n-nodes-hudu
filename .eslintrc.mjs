export default {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier', 'n8n-nodes-base'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		project: './tsconfig.json',
		extraFileExtensions: ['.json']
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'prettier/prettier': [
			'error',
			{
				endOfLine: 'auto',
				useTabs: false,
			},
		],
		'n8n-nodes-base/node-param-description-missing-for-return-all': 'off',
		'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
	},
	ignorePatterns: ['dist/**/*', '*.json'],
};
