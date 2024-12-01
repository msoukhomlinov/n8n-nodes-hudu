import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	companiesFields,
	companiesOperations,
	activityLogsFields,
	activityLogsOperations,
	apiInfoFields,
	apiInfoOperations,
	articlesFields,
	articlesOperations,
	assetLayoutFields,
	assetLayoutOperations,
	assetPasswordFields,
	assetPasswordOperations,
	assetsFields,
	assetsOperations,
	cardsFields,
	cardsOperations,
	expirationsFields,
	expirationsOperations,
	folderFields,
	folderOperations,
	ipAddressFields,
	ipAddressOperations,
	magicDashFields,
	magicDashOperations,
	matchersFields,
	matchersOperations,
	networksFields,
	networksOperations,
	passwordFoldersFields,
	passwordFoldersOperations,
	proceduresFields,
	proceduresOperations,
	procedureTasksFields,
	procedureTasksOperations,
	publicPhotoFields,
	publicPhotoOperations,
	rackStorageFields,
	rackStorageOperations,
	rackStorageItemFields,
	rackStorageItemOperations,
	relationsFields,
	relationsOperations,
	uploadsFields,
	uploadsOperations,
	userFields,
	userOperations,
	websitesFields,
	websitesOperations,
} from './src/descriptions';

import { ActivityLogsOperation } from './src/resources/activity_logs/activity_logs.types';
import { ApiInfoOperation } from './src/resources/api_info/api_info.types';
import { ArticlesOperation } from './src/resources/articles/articles.types';
import { AssetLayoutOperation } from './src/resources/asset_layouts/asset_layouts.types';
import { AssetPasswordOperation } from './src/resources/asset_passwords/asset_passwords.types';
import { AssetsOperations } from './src/resources/assets/assets.types';
import { CardsOperation } from './src/resources/cards/cards.types';
import { CompaniesOperations } from './src/resources/companies/companies.types';
import { ExpirationsOperations } from './src/resources/expirations/expirations.types';
import { FolderOperation } from './src/resources/folders/folders.types';
import { IpAddressOperations } from './src/resources/ip_addresses/ip_addresses.types';
import { MagicDashOperation } from './src/resources/magic_dash/magic_dash.types';
import { MatcherOperation } from './src/resources/matchers/matchers.types';
import { NetworksOperations } from './src/resources/networks/networks.types';
import { PasswordFoldersOperations } from './src/resources/password_folders/password_folders.types';
import { ProceduresOperations } from './src/resources/procedures/procedures.types';
import { ProcedureTasksOperations } from './src/resources/procedure_tasks/procedure_tasks.types';
import { PublicPhotoOperation } from './src/resources/public_photos/public_photos.types';
import { RackStorageOperation } from './src/resources/rack_storages/rack_storages.types';
import { RackStorageItemOperation } from './src/resources/rack_storage_items/rack_storage_items.types';
import { RelationOperation } from './src/resources/relations/relations.types';
import { UploadOperation } from './src/resources/uploads/uploads.types';
import { UserOperation } from './src/resources/users/users.types';
import { WebsiteOperation } from './src/resources/websites/websites.types';

import { handleActivityLogsOperation } from './src/resources/activity_logs/activity_logs.handler';
import { handleApiInfoOperation } from './src/resources/api_info/api_info.handler';
import { handleArticlesOperation } from './src/resources/articles/articles.handler';
import { handleAssetLayoutOperation } from './src/resources/asset_layouts/asset_layouts.handler';
import { handleAssetPasswordOperation } from './src/resources/asset_passwords/asset_passwords.handler';
import { handleAssetsOperation } from './src/resources/assets/assets.handler';
import { handleCardsOperation } from './src/resources/cards/cards.handler';
import { handleCompaniesOperation } from './src/resources/companies/companies.handler';
import { handleExpirationOperation } from './src/resources/expirations/expirations.handler';
import { handleFolderOperation } from './src/resources/folders/folders.handler';
import { handleIpAddressOperation } from './src/resources/ip_addresses/ip_addresses.handler';
import { handleMagicDashOperation } from './src/resources/magic_dash/magic_dash.handler';
import { handleMatcherOperation } from './src/resources/matchers/matchers.handler';
import { handleNetworksOperation } from './src/resources/networks/networks.handler';
import { handlePasswordFoldersOperation } from './src/resources/password_folders/password_folders.handler';
import { handleProceduresOperation } from './src/resources/procedures/procedures.handler';
import { handleProcedureTasksOperation } from './src/resources/procedure_tasks/procedure_tasks.handler';
import { handlePublicPhotoOperation } from './src/resources/public_photos/public_photos.handler';
import { handleRackStorageOperation } from './src/resources/rack_storages/rack_storages.handler';
import { handleRackStorageItemOperation } from './src/resources/rack_storage_items/rack_storage_items.handler';
import { handleRelationsOperation } from './src/resources/relations/relations.handler';
import { handleUploadOperation } from './src/resources/uploads/uploads.handler';
import { handleUserOperation } from './src/resources/users/users.handler';
import { handleWebsitesOperation } from './src/resources/websites/websites.handler';

export class Hudu implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hudu',
		name: 'hudu',
		icon: 'file:hudu.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Hudu API',
		defaults: {
			name: 'Hudu',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'huduApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}/api/v1',
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Activity Logs',
						value: 'activity_logs',
					},
					{
						name: 'API Info',
						value: 'api_info',
					},
					{
						name: 'Articles',
						value: 'articles',
					},
					{
						name: 'Asset Layout',
						value: 'asset_layouts',
					},
					{
						name: 'Asset Password',
						value: 'asset_passwords',
					},
					{
						name: 'Asset',
						value: 'assets',
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
				],
				default: 'companies',
			},
			// Operations
			...activityLogsOperations,
			...apiInfoOperations,
			...articlesOperations,
			...assetLayoutOperations,
			...assetPasswordOperations,
			...assetsOperations,
			...cardsOperations,
			...companiesOperations,
			...expirationsOperations,
			...folderOperations,
			...ipAddressOperations,
			...magicDashOperations,
			...matchersOperations,
			...networksOperations,
			...passwordFoldersOperations,
			...proceduresOperations,
			...procedureTasksOperations,
			...publicPhotoOperations,
			...rackStorageOperations,
			...rackStorageItemOperations,
			...relationsOperations,
			...uploadsOperations,
			...userOperations,
			...websitesOperations,
			// Fields
			...activityLogsFields,
			...apiInfoFields,
			...articlesFields,
			...assetLayoutFields,
			...assetPasswordFields,
			...assetsFields,
			...cardsFields,
			...companiesFields,
			...expirationsFields,
			...folderFields,
			...ipAddressFields,
			...magicDashFields,
			...matchersFields,
			...networksFields,
			...passwordFoldersFields,
			...proceduresFields,
			...procedureTasksFields,
			...publicPhotoFields,
			...rackStorageFields,
			...rackStorageItemFields,
			...relationsFields,
			...uploadsFields,
			...userFields,
			...websitesFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		let operation: ActivityLogsOperation | ApiInfoOperation | ArticlesOperation | AssetLayoutOperation |
			AssetPasswordOperation | AssetsOperations | CardsOperation | CompaniesOperations |
			ExpirationsOperations | FolderOperation | IpAddressOperations | MagicDashOperation |
			MatcherOperation | NetworksOperations | PasswordFoldersOperations | ProceduresOperations |
			ProcedureTasksOperations | PublicPhotoOperation | RackStorageOperation |
			RackStorageItemOperation | RelationOperation | UploadOperation | UserOperation | WebsiteOperation;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;
				const resource = this.getNodeParameter('resource', i) as string;
				operation = this.getNodeParameter('operation', i) as typeof operation;

				switch (resource) {
					case 'activity_logs':
						responseData = await handleActivityLogsOperation.call(
							this,
							operation as ActivityLogsOperation,
							i,
						);
						break;
					case 'api_info':
						responseData = await handleApiInfoOperation.call(this, operation as ApiInfoOperation, i);
						break;
					case 'articles':
						responseData = await handleArticlesOperation.call(this, operation as ArticlesOperation, i);
						break;
					case 'asset_layouts':
						responseData = await handleAssetLayoutOperation.call(this, operation as AssetLayoutOperation, i);
						break;
					case 'asset_passwords':
						responseData = await handleAssetPasswordOperation.call(this, operation as AssetPasswordOperation, i);
						break;
					case 'assets':
						responseData = await handleAssetsOperation.call(this, operation as AssetsOperations, i);
						break;
					case 'cards':
						responseData = await handleCardsOperation.call(this, operation as CardsOperation, i);
						break;
					case 'companies':
						responseData = await handleCompaniesOperation.call(this, operation as CompaniesOperations, i);
						break;
					case 'expirations':
						responseData = await handleExpirationOperation.call(this, operation as ExpirationsOperations, i);
						break;
					case 'folders':
						responseData = await handleFolderOperation.call(this, operation as FolderOperation, i);
						break;
					case 'ipAddresses':
						responseData = await handleIpAddressOperation.call(this, operation as IpAddressOperations, i);
						break;
					case 'magic_dash':
						responseData = await handleMagicDashOperation.call(this, operation as MagicDashOperation, i);
						break;
					case 'matchers':
						responseData = await handleMatcherOperation.call(this, operation as MatcherOperation, i);
						break;
					case 'networks':
						responseData = await handleNetworksOperation.call(this, operation as NetworksOperations, i);
						break;
					case 'password_folders':
						responseData = await handlePasswordFoldersOperation.call(this, operation as PasswordFoldersOperations, i);
						break;
					case 'procedures':
						responseData = await handleProceduresOperation.call(this, operation as ProceduresOperations, i);
						break;
					case 'procedure_tasks':
						responseData = await handleProcedureTasksOperation.call(this, operation as ProcedureTasksOperations, i);
						break;
					case 'public_photos':
						responseData = await handlePublicPhotoOperation.call(this, operation as PublicPhotoOperation, i);
						break;
					case 'rack_storages':
						responseData = await handleRackStorageOperation.call(this, operation as RackStorageOperation, i);
						break;
					case 'rack_storage_items':
						responseData = await handleRackStorageItemOperation.call(this, operation as RackStorageItemOperation, i);
						break;
					case 'relations':
						responseData = await handleRelationsOperation.call(
							this,
							operation as RelationOperation,
							i,
						);
						break;
					case 'uploads':
						responseData = await handleUploadOperation.call(
							this,
							operation as UploadOperation,
							i,
						);
						break;
					case 'users':
						responseData = await handleUserOperation.call(this, operation as UserOperation, i);
						break;
					case 'websites':
						responseData = await handleWebsitesOperation.call(
							this,
							operation as WebsiteOperation,
							i,
						);
						break;
					default:
						throw new Error(`The resource "${resource}" is not known!`);
				}

				// Handle array responses
				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map(item => ({
						json: item,
						pairedItem: { item: i },
					})));
				} else {
					// Handle single item responses
					returnData.push({
						json: responseData,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
} 