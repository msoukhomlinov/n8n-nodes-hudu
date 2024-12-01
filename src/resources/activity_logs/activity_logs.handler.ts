import { IDataObject, IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import type { ActivityLogsOperation } from './activity_logs.types';

export async function handleActivityLogsOperation(
	this: IExecuteFunctions,
	operation: ActivityLogsOperation,
	i: number,
) {
	let responseData;

	if (operation === 'getAll') {
		// Handle get all activity logs
		const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const limit = returnAll ? 1000 : (this.getNodeParameter('limit', i, 25) as number);
		const params: IDataObject = {
			...additionalFields,
			page_size: limit,
		};

		// Remove empty parameters
		Object.keys(params).forEach((key) => {
			if (params[key] === undefined || params[key] === '') {
				delete params[key];
			}
		});

		responseData = await huduApiRequest.call(
			this,
			'GET' as IHttpRequestMethods,
			'/activity_logs',
			{},
			params,
		);
	} else if (operation === 'delete') {
		// Handle delete activity logs
		const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
		const params: IDataObject = {
			datetime: this.getNodeParameter('datetime', i) as string,
			...additionalFields,
		};

		responseData = await huduApiRequest.call(
			this,
			'DELETE' as IHttpRequestMethods,
			'/activity_logs',
			{},
			params,
		);
	}

	return responseData;
}
