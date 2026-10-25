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
			// `@n8n/node-cli` 0.53+ bans the `overrides` field in community
			// packages. This package keeps one deliberate override: `handlebars`
			// pinned to ^4.7.10, the release that fixes the critical Handlebars
			// JS-injection advisories (GHSA-8r5x-fm3f-whwj, GHSA-p8wg-vrv2-v86f).
			// `@n8n/node-cli` itself pins handlebars 4.7.9 exactly in its nested
			// tree, so the dev tree cannot dedupe to the fixed version any other
			// way. Non-root `overrides` have no effect when the package is
			// installed by consumers — this only hardens the dev/CI tree.
			'@n8n/community-nodes/no-overrides-field': 'off',
		},
	},
];
