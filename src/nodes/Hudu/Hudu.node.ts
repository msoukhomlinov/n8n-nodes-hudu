import type { IExecuteFunctions } from 'n8n-core';
import type {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';

// Import all descriptions
import * as descriptions from './descriptions';

// Import all resource types and handlers
import * as resources from './resources';

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
      ...descriptions.activityLogsOperations,
      ...descriptions.apiInfoOperations,
      ...descriptions.articlesOperations,
      ...descriptions.assetLayoutOperations,
      ...descriptions.assetPasswordOperations,
      ...descriptions.assetsOperations,
      ...descriptions.cardsOperations,
      ...descriptions.companiesOperations,
      ...descriptions.expirationsOperations,
      ...descriptions.folderOperations,
      ...descriptions.ipAddressOperations,
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
      // Fields
      ...descriptions.activityLogsFields,
      ...descriptions.apiInfoFields,
      ...descriptions.articlesFields,
      ...descriptions.assetLayoutFields,
      ...descriptions.assetPasswordFields,
      ...descriptions.assetsFields,
      ...descriptions.cardsFields,
      ...descriptions.companiesFields,
      ...descriptions.expirationsFields,
      ...descriptions.folderFields,
      ...descriptions.ipAddressFields,
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
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    let operation:
      | resources.ActivityLogsOperation
      | resources.ApiInfoOperation
      | resources.ArticlesOperation
      | resources.AssetLayoutOperation
      | resources.AssetPasswordOperation
      | resources.AssetsOperations
      | resources.CardsOperation
      | resources.CompaniesOperations
      | resources.ExpirationsOperations
      | resources.FolderOperation
      | resources.IpAddressOperations
      | resources.MagicDashOperation
      | resources.MatcherOperation
      | resources.NetworksOperations
      | resources.PasswordFoldersOperations
      | resources.ProceduresOperations
      | resources.ProcedureTasksOperations
      | resources.PublicPhotoOperation
      | resources.RackStorageOperation
      | resources.RackStorageItemOperation
      | resources.RelationOperation
      | resources.UploadOperation
      | resources.UserOperation
      | resources.WebsiteOperation;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: IDataObject | IDataObject[];
        const resource = this.getNodeParameter('resource', i) as string;
        operation = this.getNodeParameter('operation', i) as typeof operation;

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
              i,
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
          case 'ipAddresses':
            responseData = await resources.handleIpAddressesOperation.call(
              this,
              operation as resources.IpAddressOperations,
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
          default:
            throw new Error(`The resource "${resource}" is not known!`);
        }

        // Handle array responses
        if (Array.isArray(responseData)) {
          returnData.push(
            ...responseData.map((item) => ({
              json: item,
              pairedItem: { item: i },
            })),
          );
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
