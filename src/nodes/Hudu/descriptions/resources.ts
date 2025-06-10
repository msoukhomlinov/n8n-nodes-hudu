import type { INodeProperties } from 'n8n-workflow';

export const resourceOptions = [
  {
    name: 'Activity Log',
    value: 'activity_logs',
  },
  {
    name: 'API Info',
    value: 'api_info',
  },
  {
    name: 'Article',
    value: 'articles',
  },
  {
    name: 'Asset',
    value: 'assets',
  },
  {
    name: 'Asset Layout',
    value: 'asset_layouts',
  },
  {
    name: 'Asset Layout Field',
    value: 'asset_layout_fields',
  },
  {
    name: 'Asset Password',
    value: 'asset_passwords',
  },
  {
    name: 'Card',
    value: 'cards',
  },
  {
    name: 'Company',
    value: 'companies',
  },
  {
    name: 'Expiration',
    value: 'expirations',
  },
  {
    name: 'Folder',
    value: 'folders',
  },
  {
    name: 'IP Address',
    value: 'ipAddresses',
  },
  {
    name: 'List',
    value: 'lists',
  },
  {
    name: 'List Options',
    value: 'list_options',
  },
  {
    name: 'Magic Dash',
    value: 'magic_dash',
  },
  {
    name: 'Matcher',
    value: 'matchers',
  },
  {
    name: 'Network',
    value: 'networks',
  },
  {
    name: 'Password Folder',
    value: 'password_folders',
  },
  {
    name: 'Procedure',
    value: 'procedures',
  },
  {
    name: 'Procedure Task',
    value: 'procedure_tasks',
  },
  {
    name: 'Public Photo',
    value: 'public_photos',
  },
  {
    name: 'Rack Storage',
    value: 'rack_storages',
  },
  {
    name: 'Rack Storage Item',
    value: 'rack_storage_items',
  },
  {
    name: 'Relation',
    value: 'relations',
  },
  {
    name: 'Upload',
    value: 'uploads',
  },
  {
    name: 'User',
    value: 'users',
  },
  {
    name: 'Website',
    value: 'websites',
  },
  {
    name: 'VLAN',
    value: 'vlans',
  },
  {
    name: 'VLAN Zone',
    value: 'vlan_zones',
  },
];

export const resourceProperty: INodeProperties = {
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: resourceOptions,
  default: 'companies',
}; 