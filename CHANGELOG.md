# Changelog
All notable changes to this project will be documented in this file.


## [1.4.6] - 2025-09-12

### Improved
- **Dependencies**: Removed 5 unused production dependencies (`cheerio`, `diff`, `html-entities`, `lodash`, `parse5`) and 7 corresponding dev dependencies
- **API Compliance**: Updated schema definitions to fully align with Hudu API v2.38.0:
  - **Groups**: Enhanced `Group` interface with new fields (`slug`, `url`, `created_at`, `updated_at`, `member_count`) and made `default` and `members` required
  - **Groups**: Updated `GroupMember` interface with proper v2.38.0 structure (`first_name`, `last_name`, `security_level`, `slug`), removed deprecated `name` field, and made `email` required
  - **Password Folders**: Updated `IPasswordFolder` interface to make `security` and `allowed_groups` fields required (matching API v2.39.0 response structure)

### Fixed
- **Assets**: Fixed "Asset layout with ID 'X' not found or has no fields" error during asset update operations caused by incorrect resource name parameter in layout validation requests
- **Groups**: Fixed "Get Many" operation response wrapping issue where results were double-wrapped instead of returning the groups array directly


## [1.4.5] - 2025-08-31

### Enhanced
- **Articles**: Added optional markdown content conversion for `Get` and `Get Many` operations with a user-controlled boolean toggle (default: off). When enabled, returns both original HTML content and a new `markdown_content` field, perfect for AI tooling workflows.

### Fixed
- **All Resources**: Fixed `Get` operation response unwrapping issue across all 20+ resources (Articles, Companies, Assets, Procedures, Websites, Users, Networks, Folders, Groups, Asset Passwords, Asset Layouts, Password Folders, Procedure Tasks, Rack Storages, Rack Storage Items, VLANs, VLAN Zones, Lists, List Options, Asset Layout Fields) where individual item responses were wrapped in resource-specific containers (e.g., `{ articles: [...] }`, `{ companies: [...] }`) instead of returning the data directly. Updated 32 files total including core operations and option loaders to ensure consistency with `Get Many` operations and provide uniform response handling across the entire node. Additionally fixed single-item GET operations to return the object directly instead of wrapping it in an array. 
- **Pagination**: Correctly detect and paginate nested endpoint `companies/{id}/assets` so `Return All` and `Limit` behave as expected for company-scoped assets.
- **UI Text**: Cleaned up minor UI strings for consistency: normalized Articles filter label to "Folder ID" and removed emoji from IP Addresses "Get Many" description.
- **Metadata**: Corrected Codex JSON node identifier to `n8n-nodes-hudu.hudu`.


## [1.4.4] - 2025-08-14

### Enhanced
- Added support for Password Folders and Groups from Hudu API v2.38.0
- Standardised concise operation descriptions across resources for a consistent UX
- Centralised request sanitisation to omit empty optional fields and reduce API 500s
- Adopted resource-specific update collections across all resources (e.g. `companyUpdateFields`)
- Added option loaders and integrated them in UIs:
  - Groups (for Password Folders allowed groups)
  - Networks, VLANs, VLAN Zones (used by IP Addresses, Networks, VLANs)
- Unified pagination UX (Return All/Limit) and removed manual page/page_size fields where present
- Aligned handlers to correct response wrappers and direct arrays per endpoint
- Enforced Magic Dash mutual exclusivity constraints (content vs content_link, icon vs image_url)
- Improved filter UIs (date ranges, booleans) for safer defaults

### Fixed
- Assets: Corrected AddressData custom field updates by sending snake_case field label keys and wrapping update payloads under `asset`.


## [1.4.3] - 2025-08-03

### Fixed
- Matchers > Get Many with Return All operation was returning only a single page (not paginating)


## [1.4.2] - 2025-06-23

### Fixed
- **Magic Dash**:
  - Corrected Creating or Updating operations by merging them into a single operation, aligning to the API
  - Fixed an issue where the `Get` operation failed to retrieve an item if it was not on the first page of results.

## [1.4.1] - 2025-06-12

### Enhanced
- **Assets**:
  - The `Get Many` operation now supports fetching assets across all companies by making the `Company ID` field optional. When the `Company ID` is omitted, a wider range of filters becomes available.
- **Asset Layouts**:
  - Aligned the `update` operation with the Hudu API, which now correctly accepts an array of field names for reordering.
- **Asset Layout Fields**:
  - The `linkable_id` field now uses a dynamic asset layout picker, improving UX for `Asset Link` and `Asset Tag` fields.

### Fixed
- **Asset Layouts**:
  - Removed the `active` field from the `create` operation, as it is only supported for updates.
  - Corrected the `update` operation to no longer show a UI for creating new fields, which was misaligned with the API's reordering functionality.
- **Asset Layout Fields**:
  - Fixed a parameter dependency loop that caused the UI to crash.
  - Refactored handler logic to use dedicated API endpoints for `create`, `update`, and `delete` operations, improving efficiency and reliability.

## [1.4.0] - 2025-06-11

### Enhanced
- The `Assets` and `Asset Layouts` resources are now fully supported for all API operations, improving functionality and resolving previous inconsistencies.

### Changed
- Reverted the separation of asset field management. Operations for standard, custom, and link fields are now handled directly within the `Asset` resource's `update` or `create` operations via the unified resource mapper, removing the dedicated `Asset Standard Field`, `Asset Custom Field`, and `Asset Link Field` resources.

### Fixed
- Corrected an issue with the Asset Layout update operation that caused a 500 Internal Server Error due to an API expectation mismatch.

## [1.3.5] - 2025-05-27

### Enhanced
- The `Lists` and `List Options` resources are now managed as separate, distinct resources, each with their own full set of CRUD operations for improved clarity and flexibility. This change allows you to manage lists themselves and the items within those lists independently.
- Management of asset fields is now performed via three new dedicated resources: `Asset Standard Field`, `Asset Custom Field`, and `Asset Link Field`. Field-level operations (get/update) are no longer handled via the main Asset resource, but through these new resources for improved clarity and modularity.
- **Public Photos resource improvements:**
  - Filter fields (`Record Type Filter` and `Record ID Filter`) are now grouped in a single optional "Filter" fixed collection for the Get Many operation, improving UI consistency and usability.
  - The Get by ID operation now fetches public photos page by page, checking each page for the requested ID and returning as soon as it is found. This is much more efficient for large datasets.
  - Documentation and type definitions for Public Photos have been updated for clarity and alignment with the API.

## [1.3.4] - 2025-05-17

### Enhanced
- Website operations now support all available fields for create and update, including new email security fields: `enable_dmarc_tracking`, `enable_dkim_tracking`, `enable_spf_tracking`, and more. This ensures complete alignment with the latest Hudu API (v2.37).

### Added
- Full CRUD support for VLAN Zones, including all fields, filters, archive status, and robust debug logging. Company picklist loader added for easier selection.
- Full CRUD support for VLANs (new in Hudu API v2.37), including all required and optional fields for create and update operations.
- List picklist loader introduced for improved usability across resources that reference lists.

### Fixed
- Asset Link Field Selector now loads correctly in update operations by pre-loading asset layout information and displaying proper layout names.

> **Note:** Some features in this version require Hudu API v2.37.0 to function properly.

## [1.3.3] - 2025-04-24

### Enhanced
- Simplified the process for creating assets specifically for use as asset links, making it more intuitive and reliable.
- The 'Return As Asset Links' feature is now available for both single asset (Get) and multiple assets (Get Many) operations, providing consistent output formatting for asset link custom fields.
- Added support for advanced properties when creating asset layout custom fields:
  - You can now set `hint`, `min`, `max`, `linkable_id`, `expiration`, `options`, `multiple_options`, `list_id`, and other advanced field data.
  - An "Other Data" input is available for all field types, allowing you to specify additional properties as required by the Hudu API (e.g., `linkable_id` for AssetLink fields, `expiration` for date fields, etc).

## [1.3.2] - 2025-04-24

#### Added
- Full support for the new Lists resource

#### Fixed
- Resolved issue with Procedures kickoff operation

## [1.3.1] - 2025-04-21

### Changed
- Aligned package general content such as README and documentation

## [1.3.0] - 2025-03-20

### Fixed
- Added missing company_id field to asset delete, archive, and unarchive operations:
  - Fixed error when deleting assets that was showing "parameterName: company_id" error
  - Added required Company Name/ID dropdown field to the delete, archive, and unarchive operations
  - Ensures proper API path construction for these operations that require company_id in the URL path

## [1.2.9] - 2025-01-25

### Enhanced
- Improved Asset operations with comprehensive updates:
  - Added support for custom asset tags via new "Return As Asset Links" toggle in Get Many Assets operation
  - Optimised asset creation and update operations to handle both standard and custom fields
  - Enhanced UI with dynamic field validation and intuitive field descriptions
  - Streamlined workflow for using asset data between operations

### Notes
- Asset custom field limitations:
  - Legacy list fields require manual value entry (picklist conversion not implemented due to Hudu deprecating this feature)
  - New list field sources not yet available via Hudu API - requires manual ID configuration
- Restart of n8n is required after upgrading to this version for changes to take effect

## [1.2.8] - 2025-01-21

### Fixed
- Fixed asset passwords create operation:
  - Made 'name' and 'company_id' required fields
  - Enhanced the `passwordable_type` field to use a picklist for improved user experience
- Fixed asset passwords update operation to properly handle all fields
- Improved field validation and error handling for asset password operations

## [1.2.7] - 2025-01-20

### Changed
- Enhanced validation for company ID fields across all resources:
  - Added strict validation to ensure company IDs are positive integers
  - Improved error messages for invalid company ID inputs
  - Standardised company ID validation across all handlers
  - Updated handlers: articles, websites, networks, rack_storages, ip_addresses
  - Added clear error messages indicating when input is not a number

### Fixed
- Fixed company ID validation in dynamic picklists to prevent server errors
- Standardised error handling for company ID fields across all resources
- Ensured consistent validation behavior for company ID fields in filters and parameters

## [1.2.5] - 2025-01-17

### Added
- Expanded API resource coverage to near 100% alignment with Hudu API specification
- Added Activity Version History operation with comprehensive revision tracking:
  - Support for retrieving complete version history
  - Detailed change tracking including content modifications
  - User attribution for each revision
  - Timestamp tracking for all changes

### Changed
- Enhanced procedure operations with improved reliability and functionality
- Updated resource handlers to better align with API specifications
- Improved error handling and response formatting across all resources

### Fixed
- Fixed various procedure operation issues:
  - Corrected parameter handling in procedure creation
  - Fixed template-based procedure generation
  - Resolved procedure update operation inconsistencies
- Addressed pagination issues in multiple resource handlers
- Fixed response formatting for nested resource structures


## [1.2.1] - 2025-01-15

### Added
- Added comprehensive debugging capabilities controlled via debugConfig

### Fixed
- Fixed asset creation operation to properly format and populate custom fields from asset layout fields
- Fixed Asset delete, archive and unarchive operations to properly include company_id in the API path as per API specification
- Fixed null response handling in get operations to return empty array instead of empty object
- Fixed Article operations to use correct parameter name 'articleId' instead of 'id'
- Fixed Article update operation to make name and content fields optional as per API specification
- Fixed Article update operation by removing unsupported fields (draft, slug) and aligning descriptions with API specification
- Fixed Article create operation by enforcing name requirement and making other fields optional

## [1.2.0] - 2025-01-08

### Added
- Aligned the node better with n8n node best practices and naming conventions
- Added post-processing filters for enhanced filtering capabilities:
  - Articles: Filter by folder_id
  - Folders: Filter by parent_folder_id and child folder status
  - Relations: Filter by fromable_type, fromable_id, toable_type, toable_id, and is_inverse
- Enhanced dynamic picklists with contextual secondary options:
  - Asset Layout Field updates now show relevant field names based on selected Asset Layout
- Added Articles Version History operation to retrieve the complete revision history of an article

### Fixed
- Fixed incomplete Assets resource operations by adding missing fields

## [1.1.1] - 2025-01-07

### Added
- Added dynamic asset layout selection with searchable dropdown for asset_layout_id fields
- Added option loader for asset layouts
- Added enhanced folder filtering capabilities:
  - Filter by parent folder ID
  - Filter by child folder status (yes/no)
  - Improved pagination handling for filtered results
- Added post-processing filter for folder_id in Articles resource to enable filtering by folder

### Changed
- Fixed inconsistent naming of asset_layout_id field in companies resource to match API specs
- Moved asset creation from companies resource to assets resource for better organisation and consistency
- Removed redundant get assets operation from companies resource as it's available in assets resource
- Updated remaining company_id fields to use dynamic company selection in ip_addresses, asset_passwords (including filter field), magic_dash, procedures resources (including createFromTemplate and duplicate operations), parent_company_id in companies update fields, and matchers fields (company_id filter and potential_company_id)

### Fixed
- Fixed missing asset operations implementation (get single, update, delete, archive/unarchive)
- Fixed magic dash company_id filter by properly converting the dynamic selection value to a number
- Fixed all dynamic company_id fields to properly convert from string to number when sending to API
- Added proper company_id string-to-number conversion in rack_storages resource for filters, create and update operations
- Fixed relation filtering to properly handle case-insensitive type comparisons
- Improved pagination handling with post-processing filters
- Fixed pagination to continue fetching when using post-processing filters until the requested limit is reached

## [1.1.0] - 2025-01-06

### Added
- Implemented comprehensive date range filtering across all supported resources:
  - Articles
  - Asset Layouts
  - Asset Passwords
  - Assets
  - Companies
  - IP Addresses
  - Networks
  - Rack Storages
  - Rack Storage Items
  - Websites

  Each implementation includes:
  - Exact date matching with ISO 8601 format
  - Flexible date range filtering with start and end dates
  - Quick select presets (Today, Yesterday, Last 7 Days, etc.)
  - Support for both created_at and updated_at fields where applicable
- Added full list of integration slugs as `INTEGRATION_SLUGS` constant
- Converted integration_slug fields to use picklist with predefined values from `INTEGRATION_SLUGS`
- Added dynamic user selection with searchable dropdown for user_id fields
- Added dynamic company selection with searchable dropdown for company_id fields
- Added option loaders infrastructure with initial support for user and company loading
- Converted assigned_users field from comma-separated string to proper multi-select user dropdown
- Added comprehensive list of activity log actions as `ACTIVITY_LOG_ACTIONS` constant
- Added comprehensive list of resource types as `RESOURCE_TYPES` constant

### Changed
- Enhanced code quality by removing console logging statements from:
  - GenericFunctions.ts
  - articles.handler.ts
  - asset_layouts.handler.ts
- Standardised date range filter structure across all resources for consistent behaviour
- Unified date filtering implementation to match the Articles resource pattern
- Updated cards description and types to use the new integration_slug picklist
- Updated companies description to use the new integration_slug picklist for jump operation
- Updated activity logs description to use dynamic user selection for user_id field
- Updated procedure tasks description to use dynamic company selection for company_id field
- Improved field descriptions and documentation for integration-related parameters
- Improved user and company selection UI with proper default values and configurable blank option
- Fixed value type warnings in user selection fields
- Enhanced company selection across all resources to use dynamic company picker
- Updated activity logs and related resources to use standardised constants
- Fixed pagination behavior for resources that support pagination
- Removed pagination options from resources that don't support it
- Fixed various resource-specific operations and response handling

### Fixed
- Fixed activity logs resource type filter
- Fixed magic dash pagination and returnAll functionality
- Fixed procedures "get" operation
- Fixed pagination and filter handling in multiple handlers
- Fixed response handling for rack storages and rack storage items
- Fixed users and websites "get all" operations

## [1.0.4] - 2025-01-06

### Added
- Implemented comprehensive date range filtering across all supported resources:
  - Articles
  - Asset Layouts
  - Asset Passwords
  - Assets
  - Companies
  - IP Addresses
  - Networks
  - Rack Storages
  - Rack Storage Items
  - Websites

  Each implementation includes:
  - Exact date matching with ISO 8601 format
  - Flexible date range filtering with start and end dates
  - Quick select presets (Today, Yesterday, Last 7 Days, etc.)
  - Support for both created_at and updated_at fields where applicable

### Changed
- Enhanced code quality by removing console logging statements from:
  - GenericFunctions.ts
  - articles.handler.ts
  - asset_layouts.handler.ts
- Standardised date range filter structure across all resources for consistent behaviour
- Unified date filtering implementation to match the Articles resource pattern

## [1.0.3] - 2025-01-05

### Added
- Added full list of integration slugs as `INTEGRATION_SLUGS` constant
- Converted integration_slug fields to use picklist with predefined values from `INTEGRATION_SLUGS`
- Added dynamic user selection with searchable dropdown for user_id fields
- Added dynamic company selection with searchable dropdown for company_id fields
- Added option loaders infrastructure with initial support for user and company loading
- Converted assigned_users field from comma-separated string to proper multi-select user dropdown

### Changed
- Updated cards description and types to use the new integration_slug picklist
- Updated companies description to use the new integration_slug picklist for jump operation
- Updated activity logs description to use dynamic user selection for user_id field
- Updated procedure tasks description to use dynamic company selection for company_id field
- Improved field descriptions and documentation for integration-related parameters
- Improved user and company selection UI with proper default values and configurable blank option
- Fixed value type warnings in user selection fields
- Enhanced company selection across all resources to use dynamic company picker while preserving existing display options and filters:
  - Updated company_id fields in articles, ip_addresses, magic_dash, networks, procedures, rack_storages, users, and websites descriptions
  - Maintained existing filter options and display conditions while adding dynamic company selection
  - Standardized company selection behavior across create, update, and filter operations

## [1.0.2] - 2025-01-04

### Added
- Added comprehensive list of activity log actions as `ACTIVITY_LOG_ACTIONS` constant
- Added comprehensive list of resource types as `RESOURCE_TYPES` constant

### Changed
- Updated `activity_logs.description.ts` to use `ACTIVITY_LOG_ACTIONS` constant for action_message field
- Updated `activity_logs.description.ts` to use `RESOURCE_TYPES` constant for resource_type field
- Updated `expirations.description.ts` to use `RESOURCE_TYPES` constant for resource_type field
- Updated `relations.description.ts` to use `RESOURCE_TYPES` constant for toable_type and fromable_type fields
- Updated `asset_passwords.description.ts` to use `RESOURCE_TYPES` constant for passwordable_type field

### Fixed
- Fixed activity logs resource type filter by grouping resource_id and resource_type parameters together to ensure they are used as a pair
- Fixed pagination behavior for resources that support pagination:
  - When "Return All" is enabled, properly paginates in lots of 25 records until all records are retrieved
  - When "Return All" is disabled but limit > 25, paginates in lots of 25 until reaching the limit
  - For the final batch when limit > 25, only fetches the remaining records needed
  - For limit <= 25, makes a single request with the exact limit
- Removed pagination options from resources that don't support it (cards, ip_addresses, api_info)
- Fixed magic dash pagination and returnAll functionality
- Fixed procedures "get" operation by properly handling numeric IDs and response data
- Fixed pagination and filter handling in multiple handlers (procedure_tasks, rack_storage_items, rack_storages, networks)
- Fixed response handling for rack storages and rack storage items to properly process direct array responses
- Added missing pagination parameters to rack storage items "get all" operation
- Fixed rack storage items "get all" operation by removing pagination parameters since they are not supported by the API
- Fixed users "get all" operation to correctly handle the nested "users" array in the API response
- Fixed websites "get all" operation to correctly handle the nested "websites" array in the API response

## [1.0.1] - 2025-01-04

### Changed

- Restructured project to follow n8n node development best practices:
  - Moved node files into `src/nodes/Hudu` directory
  - Organized supporting modules (descriptions, resources, utils) into subdirectories
  - Updated build process to maintain correct file structure
  - Changed icon from `hudu.png` to `hudu.svg`

## [1.0.0] - 2024-12-01

### Added

- Initial release of the n8n Hudu integration node
- Full support for Hudu API V2.34.4
- Comprehensive implementation of Hudu API endpoints including:
  - Companies
  - Activity Logs
  - Articles
  - Asset Layouts
  - Assets
  - Cards
  - Folders
  - Procedures
  - Relations
  - And more core Hudu functionalities
- Authentication handling via API key
- Resources with binary file functionality are currently not supported (uploads of photos, etc)

## [0.1.0] - 2024-01-17

### Added
- Initial release
- Basic CRUD operations for all Hudu API resources
- Pagination support for resources that allow it
- Proper error handling and response formatting
