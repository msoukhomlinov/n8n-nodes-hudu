# n8n-nodes-hudu
This community node enables seamless integration with Hudu documentation platform in your n8n workflows, allowing you to automate and manage your IT documentation tasks.

![n8n-nodes-hudu](https://img.shields.io/badge/n8n--nodes--hudu-latest-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> **API Compatibility:** This node is aligned with Hudu API version 2.36.3. Compatibility with future Hudu versions is not guaranteed without further updates.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow.svg)](https://buymeacoffee.com/msoukhomlinov)

## Recent Changes

### [1.3.3] - 2025-04-24
- Asset link and asset tag fields are now serialised as JSON when creating or updating assets, ensuring correct data is sent to the Hudu API.
- The 'Return As Asset Links' feature is now available for both single asset (Get) and multiple assets (Get Many) operations, providing consistent output formatting for asset link custom fields.
- Asset layout custom fields now support advanced properties: `hint`, `min`, `max`, `linkable_id`, `expiration`, `options`, `multiple_options`, `list_id`, and more. An "Other Data" input is available for all field types, allowing you to specify additional properties as required by the Hudu API.

### [1.3.2] - 2025-04-24
- Full support for the new Lists resource, enabling you to create, update, retrieve, and manage lists directly from your n8n workflows.
- Resolved an issue with the Procedures kickoff operation

### [1.3.1] - 2025-04-21
- Aligned package general content such as README and documentation

### [1.3.0] - 2025-03-20
- Fixed missing company_id field in asset delete, archive, and unarchive operations

### [1.2.9] - 2025-01-25
- Improved Asset operations with enhanced UI, custom asset tags support, and optimised asset creation/update
- Added streamlined workflow for using asset data between operations

### [1.2.8] - 2025-01-21
- Fixed asset passwords create/update operations with required fields and enhanced validation
- Improved field validation and error handling for asset password operations

> **IMPORTANT**: When updating between versions, make sure to restart your n8n instance after the update. UI changes and new features are only picked up after a restart. The recommended update process is:

This n8n community node enables the integration of Hudu within your n8n workflows.

[Hudu](https://www.hudu.com/) is a modern documentation platform for IT.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

This node was built against Hudu v2.34.4. Future versions of Hudu may not be 100% compatible without node updates.

[Installation](#installation)  
[Credentials](#credentials)  
[Features](#features)  
[Supported Resources & Operations](#supported-resources--operations)  
[Resources](#resources)  
[Contributing](#contributing)  
[Support](#support)  
[License](#license)

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

## Supported Resources & Operations

### Activity Logs

- Get all activity logs with filtering support
- Filter by user, action, and date range

### API Info

- Get API information and version details

### Articles

- Create articles (name required, with optional content, company, folder, and sharing settings)
- Update articles with flexible field updates
- Archive and unarchive articles
- Delete articles
- Get single article details
- List all articles with comprehensive filtering:
  - Company ID
  - Draft status
  - Sharing status
  - Folder ID
  - Name exact match
  - Fuzzy search
  - Updated date range
- Get article version history

### Asset Layouts

- Create and manage asset layout templates
- Get layout fields and configurations
- List all layouts with filtering support
- **Advanced custom field support:** Add hints, min/max, linkable asset layout IDs, expiration, options, and more to your custom fields. Use the "Other Data" input to specify any additional API-supported properties.

### Asset Passwords

- Create and manage asset-related passwords
- Link passwords to assets and companies
- Filter by company and resource types

### Assets

- Create assets with custom fields and tags
- Link assets to companies
- Update asset details
- Archive/unarchive assets
- Delete assets
- Get single asset details
- List all assets with enhanced filtering support:
  - Company association
  - Updated date range
  - Custom field values
  - **Return as Asset Links** option for custom tag support (now available for both Get and Get Many)
- Optimised asset creation and update operations for both standard and custom fields
- Enhanced UI with dynamic field validation and intuitive field descriptions
- Streamlined workflow for using asset data between operations
- **Asset link/tag fields are serialised as JSON for API compatibility**

Note: Custom field support has some limitations:
- Legacy list fields require manual value entry (picklist conversion not implemented due to Hudu deprecating this feature)
- New list field sources not yet available via Hudu API - requires manual ID configuration

### Cards

- Lookup cards by integration
- Jump to card functionality
- Filter by integration type and slug

### Companies

- Create companies with detailed information
- Update company details
- Delete companies
- Get single company information
- List all companies with filtering support
- Jump to company by integration

### Expirations

- Get all expirations with comprehensive filtering:
  - Company ID
  - Expiration type
  - Resource ID
  - Resource type
  - Date ranges

### Folders

- Create and manage document folders
- Support for nested folder structures
- Filter by parent folder
- Track child folder status

### IP Addresses

- Track and manage IP addresses
- Link to companies and networks
- Filter by company and network

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

- Create and organize password folders
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

### Websites

- Manage website records
- Link to companies
- Filter by company and status

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
