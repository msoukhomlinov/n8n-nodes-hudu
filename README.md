# n8n-nodes-hudu

This n8n community node enables the integration of Hudu within your n8n workflows.

[Hudu](https://www.hudu.com/) is a modern documentation platform for IT.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

This node was built against Hudu v2.34.4. Future versions of Hudu may not be 100% compatible without node updates.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

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

### Asset Passwords

- Create and manage asset-related passwords
- Link passwords to assets and companies
- Filter by company and resource types

### Assets

- Create assets with custom fields
- Link assets to companies
- Update asset details
- Archive/unarchive assets
- Delete assets
- Get single asset details
- List all assets with filtering support:
  - Company association
  - Updated date range
  - Custom field values

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
