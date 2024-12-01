export const HUDU_API_CONSTANTS = {
	PAGE_SIZE: 25,
	DEFAULT_PAGE: 1,
	BASE_API_PATH: '/api/v1',
} as const;

/**
 * Resources that support the page_size parameter in their GET/List operations.
 * This parameter can be used in combination with pagination to control the number
 * of records returned per page (up to the default limit of 25).
 */
export const RESOURCES_WITH_PAGE_SIZE = [
	'activity_logs',
	'articles',
	'asset_passwords',
	'assets',
	'cards',
	'companies',
	'companies/assets', // Sub-resource under companies
	'expirations',
	'folders',
	'magic_dash',
	'matchers',
	'password_folders',
	'procedures',
	'public_photos',
	'relations',
	'users',
	'websites',
] as const; 