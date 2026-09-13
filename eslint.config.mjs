import { configWithoutCloudSupport } from '@n8n/node-cli/eslint';

// Global ignores, then the community-nodes ruleset from @n8n/node-cli.
export default [
	// `.remember/` holds local tool scratch files (e.g. tmp/*.ts). They are
	// gitignored, are not shipped, and must not be linted as package source.
	{ ignores: ['.remember/**'] },
	...configWithoutCloudSupport,
	{
		// package.json shape rules this package cannot satisfy by design.
		// `@n8n/node-cli` >= 0.47 applies the community-nodes recommended set to
		// package.json as well, which turns `no-runtime-dependencies` and
		// `valid-peer-dependencies` into errors here: this edition ships a
		// LangChain runtime and declares `@langchain/core` + `@n8n/ai-utilities`
		// as peer dependencies. Those are exactly the reasons it cannot be
		// verified for n8n Cloud — that is what the zero-dependency
		// `n8n-nodes-hudu-core` edition exists for. Every other rule, including
		// the `require-node-api-error` family on the source files, still runs.
		files: ['package.json'],
		rules: {
			'@n8n/community-nodes/no-runtime-dependencies': 'off',
			'@n8n/community-nodes/valid-peer-dependencies': 'off',
		},
	},
];
