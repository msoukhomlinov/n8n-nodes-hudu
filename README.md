# n8n-nodes-hudu

This is an n8n community node (v1.0.0). It lets you use Hudu in your n8n workflows.

[Hudu](https://www.hudu.com/) is a modern documentation platform for IT.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

This node was built against Hudu v2.34.4. Future versions of Hudu may not be 100% compatible without node updates.

> **Note:** This is version 1.0.0, so some bugs are expected. Please report any issues on the [GitHub repository](https://github.com/msoukhomlinov/n8n-nodes-hudu).

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Supported Resources & Operations

### Activity Logs
- Get all activity logs

### API Info
- Get API information

### Articles
- Create, read, update, and delete articles
- List all articles with pagination support

### Asset Layouts
- Manage asset layout templates

### Asset Passwords
- Manage asset-related passwords

### Assets
- Create and manage assets
- Link assets to companies

### Cards
- Manage cards in the system

### Companies
- Create a company
- Delete a company
- Get a company
- Get all companies
- Update a company

### Expirations
- Get all expirations with filtering support for:
  - Company ID
  - Expiration type
  - Resource ID
  - Resource type

### Folders
- Manage document folders

### IP Addresses
- Track and manage IP addresses

### Magic Dash
- Access Magic Dash functionality

### Matchers
- Configure and manage matchers

### Networks
- Manage network information

### Password Folders
- Organise and manage password folders

### Procedures
- Create and manage procedures
- Handle procedure tasks

### Public Photos
- Manage public photos

### Rack Storage
- Manage rack storage
- Handle rack storage items

### Relations
- Manage relationships between resources

### Uploads
- Handle file uploads
- Get upload information
- Delete uploads

### Users
- Get user information
- List all users

### Websites
- Manage website records

## Credentials

To use this node, you need to:
1. Have a Hudu instance
2. Generate an API key in your Hudu settings
3. Configure the node with:
   - Base URL (e.g., https://your-hudu-instance.com)
   - API Key

## Features

- Pagination support for applicable resources
- Comprehensive error handling
- Filtering capabilities for relevant operations
- Supports both single and bulk operations
- Automatic rate limiting and request optimisation

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Hudu API Documentation](https://your-hudu-instance.com/api-docs)
* [GitHub Repository](https://github.com/msoukhomlinov/n8n-nodes-hudu)

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