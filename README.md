# n8n-nodes-hudu
This community node enables seamless integration with the Hudu documentation platform in your n8n workflows, allowing you to automate and manage your IT documentation tasks.

![n8n-nodes-hudu](https://img.shields.io/badge/n8n--nodes--hudu-latest-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> **API Compatibility:** This node is aligned with Hudu API version 2.40.1. Some features require specific API versions. Compatibility with future Hudu versions is not guaranteed without further updates.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow.svg)](https://buymeacoffee.com/msoukhomlinov)


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

- Comprehensive pagination support for applicable resources
- Robust error handling and debugging capabilities
- Advanced filtering options with both API-side and client-side filtering
- Support for both single and bulk operations
- Dynamic loading of related resources (companies, users, assets, layouts, networks, groups, VLANs, VLAN Zones)
- Date range filtering with preset options
- Automatic type conversion and validation
- Debug logging for troubleshooting (category-based; see DEBUG.md; requires N8N_LOG_LEVEL=debug when running n8n)
- Central request sanitisation (omits empty optionals to prevent API 500s)
- Resource-specific update collections across all resources
- Optional article markdown conversion (HTML to Markdown) for Articles get/get many (uses internal regex-based converter)
- Flexible identifier support: Get operations support both numeric IDs and slugs via Identifier Type toggle (Articles, Asset Layouts, Asset Passwords, Assets, Companies, Groups, Networks, Password Folders, Procedures, Users, VLAN Zones, VLANs, Websites)
- **AI Agent support**: `Hudu AI Tools` node exposes Hudu operations as structured LangChain tools for use with n8n AI Agent workflows (compatible with Anthropic Claude, OpenAI, and other providers)

## Supported Resources & Operations

### Activity Logs
- Get all activity logs with comprehensive filtering support
- Filter by user (ID or email), action, resource (ID and type), and date range
- Delete activity logs by datetime with optional unassigned logs filter

### API Info
- Get API information and version details

### Articles
- Create, update, archive, unarchive, delete, and retrieve articles
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- List all articles with comprehensive filtering (company, draft, sharing, folder, name, fuzzy search, updated date range)
- Get article version history
- Include Markdown Content toggle to return `markdown_content` alongside original HTML

### Asset
- **Manage core asset lifecycle & properties**: Create, retrieve, update core details, archive, unarchive, move layout, and delete assets
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- Link assets to companies
- Get single asset details, including all its field values
- List all assets with enhanced filtering (e.g., by company, update date, archived status)

### Asset Layouts
- Create and manage asset layout templates
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- Get layout fields and configurations
- List all layouts with filtering support
- **Advanced custom field support:** Add hints, min/max, linkable asset layout IDs, expiration, options, and more to your custom fields. Use the "Other Data" input to specify any additional API-supported properties

### Asset Passwords
- Create and manage asset-related passwords
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- Link passwords to assets and companies
- Filter by company and resource types

### Cards
- Lookup cards by integration (supports integration ID or identifier)
- Jump to card by integration ID or identifier
- Filter by integration type and slug

### Companies
- Create, update, delete, and retrieve companies
- Get operation supports numeric ID or slug selection via Identifier Type toggle
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
- Create list items when creating a list, or add/update/remove items when updating a list
- Filter lists by name or query

### List Options
- Create, update, retrieve, and delete list items within a specific list
- Use this resource to manage the items/options of a list

### Magic Dash
- Create, update, get, and delete Magic Dash items
- List all items with filtering by company and title
- Delete by ID or by title + company name

### Matchers
- Configure and manage integration matchers
- Filter by match status and company
- Support for sync identifiers

### Networks
- Create and manage network information
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- Link to companies
- Filter by company and attributes
- Pick related VLANs with an option loader

### Password Folders
- Create, update, delete, and retrieve password folders
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- Security modes: all users or specific groups (`allowed_groups` when `security = specific`)
- Filter by name, company, search
- Pick allowed groups with an option loader

### Exports
- Initiate company exports with format options: PDF, CSV, or S3
- Optional inclusions: websites, passwords, and specific asset layouts

### S3 Exports
- Initiate S3 exports (uses credentials configured in Hudu account settings)

### Procedures
- Create and manage procedures
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- Create from templates
- Duplicate existing procedures
- Manage procedure tasks
- Track task completion

### Relations
- Create and manage resource relationships
- Support for various resource types
- Filter by relationship types and directions

### Groups
- Retrieve groups and retrieve a group by ID
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- Filters: name, default, search; supports pagination

### Users
- Get user information
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- List all users
- Filter by role and status

### VLANs
- Full CRUD support for VLANs, including filtering by company, name, and VLAN ID
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- Pick VLAN Zone and Status List via option loaders

### VLAN Zones
- Full CRUD support for VLAN Zones, including filtering by company, name, archive status, and date ranges
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- Option loader available for selecting zones where referenced

### Uploads
- Manage file uploads
- Operations: Create (multipart upload), Get, Get Many, Delete

### Websites
- Manage website records
- Get operation supports numeric ID or slug selection via Identifier Type toggle
- Link to companies
- Filter by company and status
- **All fields supported, including new email security fields:** `enable_dmarc_tracking`, `enable_dkim_tracking`, `enable_spf_tracking`, and more

## Hudu AI Tools Node

The `Hudu AI Tools` node connects to n8n's **AI Agent** and exposes Hudu operations as individual structured tools that an LLM can invoke directly.

### How it works

1. Add a **Hudu AI Tools** node to your workflow
2. Connect it to an **AI Agent** node via the Tools connector
3. Select a **Resource** and the **Operations** to expose
4. Optionally enable **Allow Write Operations** to permit create / update / delete / archive

The AI Agent receives one named tool per operation (e.g. `hudu_companies_getAll`, `hudu_assets_create`) and can call them autonomously based on the user's request. The `get` operation is exposed as `getById` (e.g. `hudu_companies_getById`) so the LLM clearly understands a numeric ID is required.

### Supported resources

| Resource | Operations |
|---|---|
| Activity Logs | getAll |
| Articles | get, getAll, create, update, delete, archive, unarchive |
| Asset Layouts | get, getAll |
| Asset Passwords | get, getAll, create, update, delete, archive, unarchive |
| Assets | get, getAll, create, update, delete, archive, unarchive |
| Companies | get, getAll, create, update, delete, archive, unarchive |
| Expirations | get, getAll, create, update, delete |
| Folders | get, getAll, create, update, delete |
| Groups | get, getAll |
| IP Addresses | get, getAll, create, update, delete |
| Matchers | getAll |
| Networks | get, getAll, create, update, delete, archive, unarchive |
| Procedures | get, getAll, create, update, delete, archive, unarchive |
| Relations | getAll, create, delete |
| Users | get, getAll |
| VLANs | get, getAll, create, update, delete |
| VLAN Zones | get, getAll, create, update, delete |
| Websites | get, getAll, create, update, delete, archive, unarchive |

### Notes

- **Read-only by default**: write operations (create, update, delete, archive, unarchive) are hidden until `Allow Write Operations` is enabled
- **Error handling**: all errors are returned as structured JSON with an `error`, `errorType`, and `nextAction` field so the LLM can self-correct without crashing the workflow
- **Assets**: require `company_id` for create/update/delete/archive because Hudu's API routes asset mutations through the company endpoint
- **Matchers**: `getAll` requires an `integration_id` parameter
- **Websites**: the `name` field is the monitored URL and must include the protocol — e.g. `https://example.com`, not a display name
- **n8n version compatibility**: works with n8n 2.9+ (ToolsAgent V3) and all earlier n8n versions

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
