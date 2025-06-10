# n8n-nodes-hudu
This community node enables seamless integration with the Hudu documentation platform in your n8n workflows, allowing you to automate and manage your IT documentation tasks.

![n8n-nodes-hudu](https://img.shields.io/badge/n8n--nodes--hudu-latest-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> **API Compatibility:** This node is aligned with Hudu API version 2.37.0. Some features require specific API versions. Compatibility with future Hudu versions is not guaranteed without further updates.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow.svg)](https://buymeacoffee.com/msoukhomlinov)

## Recent Changes

### [1.4.0] - 2025-06-11

- **Major**: Enhanced `Assets` and `Asset Layouts` resources to fully support all API operations, improving functionality and resolving previous inconsistencies.
- **Changed**: Reverted the separation of asset field management. Operations for standard, custom, and link fields are now handled directly within the `Asset` resource's `update` operation via the unified resource mapper.
- **Fix**: Corrected an issue with the Asset Layout update operation that was causing a 500 Internal Server Error.

### [1.3.5] - 2025-05-27

- The `Lists` and `List Options` resources are now managed as separate, distinct resources, each with their own full set of CRUD operations for improved clarity and flexibility. This change allows you to manage lists themselves and the items within those lists independently.
- **Public Photos resource improvements:**
  - Filter fields (`Record Type Filter` and `Record ID Filter`) are now grouped in a single optional "Filter" fixed collection for the Get Many operation, improving UI consistency and usability.
  - The Get by ID operation now fetches public photos page by page, checking each page for the requested ID and returning as soon as it is found. This is much more efficient for large datasets.
  - Documentation and type definitions for Public Photos have been updated for clarity and alignment with the API.

### [1.3.4] - 2025-05-17
- Enhanced website operations with full field support, including new email security fields
- Added full CRUD support for VLAN Zones and VLAN resources (new in Hudu API v2.37)
- Fixed Asset Link Field Selector not loading properly in update operations

> **Note:** Some features in this version require Hudu API v2.37.0 to function properly.

(For full change history, see [CHANGELOG.md](CHANGELOG.md))

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

To use this node, you need to:

1. Have a Hudu instance
2. Generate an API key in your Hudu settings
3. Configure the node with:
   - Base URL (e.g., https://your-hudu-instance.com)
   - API Key

## Features

- Comprehensive pagination support for all applicable resources
- Robust error handling and debugging capabilities
- Advanced filtering options with both API-side and client-side filtering
- Support for both single and bulk operations
- Dynamic loading of related resources (companies, layouts, etc.)
- Date range filtering with preset options
- Automatic type conversion and validation
- Debug logging for troubleshooting
- **Full CRUD support for VLANs and VLAN Zones**
- **Websites resource now supports all fields, including new email security options**

## Supported Resources & Operations

### Activity Logs
- Get all activity logs with filtering support
- Filter by user, action, and date range

### API Info
- Get API information and version details

### Articles
- Create, update, archive, unarchive, delete, and retrieve articles
- List all articles with comprehensive filtering (company, draft, sharing, folder, name, fuzzy search, updated date range)
- Get article version history

### Asset
- **Manage core asset lifecycle & properties**: Create, retrieve, update core details, archive, unarchive, move layout, and delete assets
- Link assets to companies
- Get single asset details, including all its field values
- List all assets with enhanced filtering (e.g., by company, update date, archived status)

### Asset Layouts
- Create and manage asset layout templates
- Get layout fields and configurations
- List all layouts with filtering support
- **Advanced custom field support:** Add hints, min/max, linkable asset layout IDs, expiration, options, and more to your custom fields. Use the "Other Data" input to specify any additional API-supported properties

### Asset Passwords
- Create and manage asset-related passwords
- Link passwords to assets and companies
- Filter by company and resource types

### Cards
- Lookup cards by integration
- Jump to card functionality
- Filter by integration type and slug

### Companies
- Create, update, delete, and retrieve companies
- List all companies with filtering support
- Jump to company by integration

### Expirations
- Get all expirations with comprehensive filtering (company, expiration type, resource ID/type, date ranges)

### Folders
- Create and manage document folders
- Support for nested folder structures
- Filter by parent folder
- Track child folder status

### IP Addresses
- Track and manage IP addresses
- Link to companies and networks
- Filter by company and network

### Lists
- Create, update, retrieve, and delete lists
- Use this resource to manage the lists themselves
- Filter lists by name or query

### List Options
- Create, update, retrieve, and delete list items within a specific list
- Use this resource to manage the items/options of a list

### Magic Dash
- Access Magic Dash functionality
- Filter by company and title
- Delete by title and company name

### Matchers
- Configure and manage integration matchers
- Filter by match status and company
- Support for sync identifiers

### Networks
- Create and manage network information
- Link to companies
- Filter by company and attributes

### Password Folders
- Create and organise password folders
- Support for folder hierarchy
- Filter by parent folder

### Procedures
- Create and manage procedures
- Create from templates
- Duplicate existing procedures
- Manage procedure tasks
- Track task completion

### Relations
- Create and manage resource relationships
- Support for various resource types
- Filter by relationship types and directions

### Users
- Get user information
- List all users
- Filter by role and status

### VLANs
- Full CRUD support for VLANs, including filtering by company, name, and VLAN ID

### VLAN Zones
- Full CRUD support for VLAN Zones, including filtering by company, name, archive status, and date ranges

### Uploads
- Manage file uploads

### Websites
- Manage website records
- Link to companies
- Filter by company and status
- **All fields supported, including new email security fields:** `enable_dmarc_tracking`, `enable_dkim_tracking`, `enable_spf_tracking`, and more

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Hudu API Documentation](https://your-hudu-instance.com/api-docs)
- [GitHub Repository](https://github.com/msoukhomlinov/n8n-nodes-hudu)

## Contributing

Contributions are welcome! If you'd like to contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your PR:
- Clearly describes the changes
- Includes any relevant documentation updates
- Follows the existing code style
- Includes tests if applicable

For bug reports or feature requests, please use the GitHub issues section.

## Support

If you find this node helpful and would like to support its development:

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/msoukhomlinov)

## License

[MIT](LICENSE)
