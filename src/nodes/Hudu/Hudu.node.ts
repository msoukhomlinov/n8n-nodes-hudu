/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { DEBUG_CONFIG, debugLog } from './utils/debugConfig';

// Import all descriptions
import * as descriptions from './descriptions';
import { resourceProperty } from './descriptions/resources';

// Import all resource types and handlers
import * as resources from './resources';

// Import all option loaders centrally
import * as optionLoaders from './optionLoaders';
import { getAssets } from './optionLoaders/assets/getAssets';
import { getAssetsForCompany } from './optionLoaders/assets/getAssetsForCompany';
import { mapAssetLayoutFieldsForResource } from './optionLoaders/asset_layouts/getAssetLayoutFields';

export class Hudu implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hudu',
		name: 'hudu',
		icon: 'file:hudu.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Hudu REST API',
		defaults: {
			name: 'Hudu',
		},
		usableAsTool: true,
		inputs: ['main'] as any,
		outputs: ['main'] as any,
		
		credentials: [
			{
				name: 'huduApi',
				required: true,
			},
		],
		codex: {
			categories: ['Communication'],
			subcategories: {
				Communication: ['Documentation']
			},
		},
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}/api/v1',
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
		properties: [
			resourceProperty,
			// Operations
			...descriptions.activityLogsOperations,
			...descriptions.apiInfoOperations,
			...descriptions.articlesOperations,
			...descriptions.assetLayoutOperations,
			...descriptions.assetLayoutFieldOperations,
			...descriptions.assetPasswordOperations,
			...descriptions.assetsOperations,
			...descriptions.cardsOperations,
			...descriptions.companiesOperations,
			...descriptions.expirationsOperations,
			...descriptions.folderOperations,
			...descriptions.groupsOperations,
			...descriptions.ipAddressOperations,
			...descriptions.listOptionsOperations,
			...descriptions.listsOperations,
			...descriptions.magicDashOperations,
			...descriptions.matchersOperations,
			...descriptions.networksOperations,
			...descriptions.passwordFoldersOperations,
			...descriptions.proceduresOperations,
			...descriptions.procedureTasksOperations,
			...descriptions.publicPhotosOperations,
			...descriptions.rackStorageOperations,
			...descriptions.rackStorageItemOperations,
			...descriptions.relationsOperations,
			...descriptions.uploadsOperations,
			...descriptions.userOperations,
			...descriptions.websitesOperations,
			...descriptions.vlansOperations,
			...descriptions.vlanZonesOperations,
			// Fields
			...descriptions.activityLogsFields,
			...descriptions.apiInfoFields,
			...descriptions.articlesFields,
			...descriptions.assetLayoutFields,
			...descriptions.assetLayoutUpdateFields,
			...descriptions.assetLayoutManageFields,
			...descriptions.assetLayoutFieldFields,
			...descriptions.assetPasswordFields,      
			...descriptions.assetsFields,
			...descriptions.cardsFields,
			...descriptions.companiesFields,
			...descriptions.expirationsFields,
			...descriptions.folderFields,
			...descriptions.groupsFields,
			...descriptions.ipAddressFields,
			...descriptions.listOptionsFields,
			...descriptions.listsFields,
			...descriptions.magicDashFields,
			...descriptions.matchersFields,
			...descriptions.networksFields,
			...descriptions.passwordFoldersFields,
			...descriptions.proceduresFields,
			...descriptions.procedureTasksFields,
			...descriptions.publicPhotosFields,
			...descriptions.rackStorageFields,
			...descriptions.rackStorageItemFields,
			...descriptions.relationsFields,
			...descriptions.uploadsFields,
			...descriptions.userFields,
			...descriptions.websitesFields,
			...descriptions.vlansFields,
			...descriptions.vlanZonesFields,
		],
	};

	methods = {
		loadOptions: {
			getUsers: optionLoaders.getUsers,
			getCompanies: optionLoaders.getCompanies,
			getAssetLayouts: optionLoaders.getAssetLayouts,
			getAssetLayoutFields: optionLoaders.getAssetLayoutFields,
			getAssetLayoutFieldValues: optionLoaders.getAssetLayoutFieldValues,
			getAssets,
			getAssetsForCompany,
			getCustomFieldsLayoutFields: optionLoaders.getCustomFieldsLayoutFields,
			getLists: optionLoaders.getLists,
			getGroups: (optionLoaders as any).getGroups,
			getNetworks: (optionLoaders as any).getNetworks,
			getVlans: (optionLoaders as any).getVlans,
			getVlanZones: (optionLoaders as any).getVlanZones,
			async getStandardAssetFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return [
					{ name: 'Name', value: 'name' },
					{ name: 'Archived', value: 'archived' },
					{ name: 'Primary Serial', value: 'primary_serial' },
					{ name: 'Primary Model', value: 'primary_model' },
					{ name: 'Primary Manufacturer', value: 'primary_manufacturer' },
					{ name: 'Primary Mail', value: 'primary_mail' },
				];
			},
			async getBinaryProperties(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const items = (this as any).getInputData?.() || [];
				const item = items[0];
				if (!item || !item.binary) {
					return [];
				}
				return Object.keys(item.binary).map((key) => ({
					name: key,
					value: key,
				}));
			},
		},
		resourceMapping: {
			mapAssetLayoutFieldsForResource,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		if (DEBUG_CONFIG.NODE_INPUT) {
			debugLog('Node Execution - Input Items', {
				itemCount: items.length,
				items,
			});
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (DEBUG_CONFIG.NODE_INPUT) {
					debugLog(`Node Execution - Item ${i}`, {
						resource,
						operation,
						itemData: items[i],
					});
				}

				let responseData: IDataObject | IDataObject[] = {};

				switch (resource) {
					case 'activity_logs':
						responseData = await resources.handleActivityLogsOperation.call(
							this,
							operation as resources.ActivityLogsOperation,
							i,
						);
						break;
					case 'api_info':
						responseData = await resources.handleApiInfoOperation.call(
							this,
							operation as resources.ApiInfoOperation,
						);
						break;
					case 'articles':
						responseData = await resources.handleArticlesOperation.call(
							this,
							operation as resources.ArticlesOperation,
							i,
						);
						break;
					case 'asset_layouts':
						responseData = await resources.handleAssetLayoutOperation.call(
							this,
							operation as resources.AssetLayoutOperation,
							i,
						);
						break;
					case 'asset_layout_fields':
						responseData = await resources.handleAssetLayoutFieldOperation.call(
							this,
							operation as resources.AssetLayoutFieldOperation,
							i,
						);
						break;
					case 'asset_passwords':
						responseData = await resources.handleAssetPasswordOperation.call(
							this,
							operation as resources.AssetPasswordOperation,
							i,
						);
						break;
					case 'assets':
						responseData = await resources.handleAssetsOperation.call(
							this,
							operation as resources.AssetsOperations,
							i,
						);
						break;
					case 'cards':
						responseData = await resources.handleCardOperation.call(
							this,
							operation as resources.CardsOperation,
							i,
						);
						break;
					case 'companies':
						responseData = await resources.handleCompaniesOperation.call(
							this,
							operation as resources.CompaniesOperations,
							i,
						);
						break;
					case 'expirations':
						responseData = await resources.handleExpirationOperation.call(
							this,
							operation as resources.ExpirationsOperations,
							i,
						);
						break;
					case 'folders':
						responseData = await resources.handleFolderOperation.call(
							this,
							operation as resources.FolderOperation,
							i,
						);
						break;
					case 'groups':
						responseData = await resources.handleGroupsOperation.call(
							this,
							operation as resources.GroupsOperation,
							i,
						);
						break;
					case 'ipAddresses':
						responseData = await resources.handleIpAddressesOperation.call(
							this,
							operation as resources.IpAddressOperations,
							i,
						);
						break;
					case 'list_options':
						responseData = await resources.handleListOptionsOperation.call(
							this,
							operation as resources.ListOptionsOperation,
							i,
						);
						break;
					case 'lists':
						responseData = await resources.handleListsOperation.call(
							this,
							operation as resources.ListsOperation,
							i,
						);
						break;
					case 'magic_dash':
						responseData = await resources.handleMagicDashOperation.call(
							this,
							operation as resources.MagicDashOperation,
							i,
						);
						break;
					case 'matchers':
						responseData = await resources.handleMatcherOperation.call(
							this,
							operation as resources.MatcherOperation,
							i,
						);
						break;
					case 'networks':
						responseData = await resources.handleNetworksOperation.call(
							this,
							operation as resources.NetworksOperations,
							i,
						);
						break;
					case 'password_folders':
						responseData = await resources.handlePasswordFoldersOperation.call(
							this,
							operation as resources.PasswordFoldersOperations,
							i,
						);
						break;
					case 'procedures':
						responseData = await resources.handleProceduresOperation.call(
							this,
							operation as resources.ProceduresOperations,
							i,
						);
						break;
					case 'procedure_tasks':
						responseData = await resources.handleProcedureTasksOperation.call(
							this,
							operation as resources.ProcedureTasksOperations,
							i,
						);
						break;
					case 'public_photos':
						responseData = await resources.handlePublicPhotoOperation.call(
							this,
							operation as resources.PublicPhotoOperation,
							i,
						);
						break;
					case 'rack_storages':
						responseData = await resources.handleRackStorageOperation.call(
							this,
							operation as resources.RackStorageOperation,
							i,
						);
						break;
					case 'rack_storage_items':
						responseData = await resources.handleRackStorageItemOperation.call(
							this,
							operation as resources.RackStorageItemOperation,
							i,
						);
						break;
					case 'relations':
						responseData = await resources.handleRelationsOperation.call(
							this,
							operation as resources.RelationOperation,
							i,
						);
						break;
					case 'uploads':
						responseData = await resources.handleUploadOperation.call(
							this,
							operation as resources.UploadOperation,
							i,
						);
						break;
					case 'users':
						responseData = await resources.handleUserOperation.call(
							this,
							operation as resources.UserOperation,
							i,
						);
						break;
					case 'websites':
						responseData = await resources.handleWebsitesOperation.call(
							this,
							operation as resources.WebsiteOperation,
							i,
						);
						break;
					case 'vlans':
						responseData = await resources.handleVlansOperation.call(
							this,
							operation as resources.VlanOperation,
							i,
						);
						break;
					case 'vlan_zones':
						responseData = await resources.handleVlanZonesOperation.call(
							this,
							operation as resources.VlanZoneOperation,
							i,
						);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not known!`);
				}

				const executionData = this.helpers.returnJsonArray(responseData).map((item) => ({
					...item,
					pairedItem: { item: i },
				}));

				if (DEBUG_CONFIG.NODE_OUTPUT) {
					debugLog(`Node Execution - Item ${i} Output`, {
						executionData,
					});
				}

				returnData.push(...executionData);
			} catch (error) {
				if (DEBUG_CONFIG.NODE_OUTPUT) {
					debugLog(`Node Execution - Item ${i} Error`, {
						error,
						message: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
						level: 'error',
					});
				}

				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.returnJsonArray({ error: error.message }).map((item: IDataObject) => ({
						json: item,
						pairedItem: { item: i },
					}));
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		if (DEBUG_CONFIG.NODE_OUTPUT) {
			debugLog('Node Execution - Final Output', {
				returnDataCount: returnData.length,
				returnData,
			});
		}

		return [returnData];
	}
}