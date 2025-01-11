import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';
import { handleGetOperation } from './get';

export async function handleUpdateOperation(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  resourceId: string | number,
  body: IDataObject,
  options: {
    skipFetchMerge?: boolean;
    resourceKey?: string;
  } = {},
): Promise<IDataObject | IDataObject[]> {
  // If skipFetchMerge is true, proceed with direct update
  if (options.skipFetchMerge) {
    return await huduApiRequest.call(
      this,
      'PUT',
      `${resourceEndpoint}/${resourceId}`,
      body,
    );
  }

  // Get the current state
  const currentState = await handleGetOperation.call(this, resourceEndpoint, resourceId) as IDataObject;

  // Extract the resource key from the response (e.g., 'asset_layout' from { asset_layout: {...} })
  const resourceKey = options.resourceKey || Object.keys(currentState).find(key => 
    typeof currentState[key] === 'object' && !Array.isArray(currentState[key])
  );

  if (!resourceKey) {
    throw new Error('Could not determine resource key from response');
  }

  // Merge the updates with current state
  const mergedBody = {
    [resourceKey]: {
      ...(currentState[resourceKey] as IDataObject),
      ...(body[resourceKey] as IDataObject),
    },
  };

  // Send the merged update
  return await huduApiRequest.call(
    this,
    'PUT',
    `${resourceEndpoint}/${resourceId}`,
    mergedBody,
  );
} 