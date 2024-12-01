import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import { RackStorageOperation } from './rack_storages.types';

export async function handleRackStorageOperation(
	this: IExecuteFunctions,
	operation: RackStorageOperation,
	i: number,
): Promise<any> {
	let responseData;

	switch (operation) {
		case 'getAll': {
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			responseData = await huduApiRequest.call(
				this,
				'GET' as IHttpRequestMethods,
				'/rack_storages',
				{},
				filters,
			);
			break;
		}

		case 'get': {
			const id = this.getNodeParameter('id', i) as number;
			responseData = await huduApiRequest.call(
				this,
				'GET' as IHttpRequestMethods,
				`/rack_storages/${id}`,
			);
			break;
		}

		case 'create': {
			const body = {
				rack_storage: {
					name: this.getNodeParameter('name', i) as string,
					location_id: this.getNodeParameter('locationId', i) as number,
					...this.getNodeParameter('additionalFields', i) as IDataObject,
				},
			};
			responseData = await huduApiRequest.call(
				this,
				'POST' as IHttpRequestMethods,
				'/rack_storages',
				body,
			);
			break;
		}

		case 'update': {
			const id = this.getNodeParameter('id', i) as number;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
			const body = {
				rack_storage: {
					...updateFields,
				},
			};
			responseData = await huduApiRequest.call(
				this,
				'PUT' as IHttpRequestMethods,
				`/rack_storages/${id}`,
				body,
			);
			break;
		}

		case 'delete': {
			const id = this.getNodeParameter('id', i) as number;
			responseData = await huduApiRequest.call(
				this,
				'DELETE' as IHttpRequestMethods,
				`/rack_storages/${id}`,
			);
			break;
		}
	}

	return responseData;
} 