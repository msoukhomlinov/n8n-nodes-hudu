import { configWithoutCloudSupport } from '@n8n/node-cli/eslint';

// Global ignores, then the community-nodes ruleset from @n8n/node-cli.
export default [
	// `.remember/` holds local tool scratch files (e.g. tmp/*.ts). They are
	// gitignored, are not shipped, and must not be linted as package source.
	{ ignores: ['.remember/**'] },
	...configWithoutCloudSupport,
];
