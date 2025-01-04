# Changelog

All notable changes to this project will be documented in this file.

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
