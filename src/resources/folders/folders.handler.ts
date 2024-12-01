import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing } from '../../utils/GenericFunctions';
import { FolderOperation } from './folders.types';

export async function handleFolderOperation(
	this: IExecuteFunctions,
	operation: FolderOperation,
	i: number,
): Promise<any> {
	let responseData;

	switch (operation) {
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const limit = this.getNodeParameter('limit', i, 25) as number;

			responseData = await handleListing.call(
				this,
				'GET' as IHttpRequestMethods,
				'/folders',
				'folders',
				{},
				filters,
				returnAll,
				limit,
			);
			break;
		}

		case 'get': {
			const folderId = this.getNodeParameter('folderId', i) as number;
			responseData = await huduApiRequest.call(
				this,
				'GET',
				`/folders/${folderId}`,
			);
			break;
		}

		case 'create': {
			const body = {
				name: this.getNodeParameter('name', i) as string,
				icon: this.getNodeParameter('icon', i, '') as string,
				description: this.getNodeParameter('description', i, '') as string,
				parent_folder_id: this.getNodeParameter('parentFolderId', i, null) as number | null,
				company_id: this.getNodeParameter('companyId', i, null) as number | null,
			};

			responseData = await huduApiRequest.call(
				this,
				'POST',
				'/folders',
				{ folder: body },
			);
			break;
		}

		case 'update': {
			const folderId = this.getNodeParameter('folderId', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			responseData = await huduApiRequest.call(
				this,
				'PUT',
				`/folders/${folderId}`,
				{ folder: updateFields },
			);
			break;
		}

		case 'delete': {
			const folderId = this.getNodeParameter('folderId', i) as number;
			responseData = await huduApiRequest.call(
				this,
				'DELETE',
				`/folders/${folderId}`,
			);
			break;
		}
	}

	return responseData;
} 