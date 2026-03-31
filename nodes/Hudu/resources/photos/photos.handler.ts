import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { huduApiRequest, handleListing } from '../../utils';
import {
	handleGetOperation,
	handleDeleteOperation,
} from '../../utils/operations';
import type { PhotoOperation } from './photos.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { processDateRange } from '../../utils/index';
import type { DateRangePreset } from '../../utils/dateUtils';

export async function handlePhotoOperation(
	this: IExecuteFunctions,
	operation: PhotoOperation,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const resourceEndpoint = '/photos';
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'create': {
			const binaryPropertyName = this.getNodeParameter('file', i) as string;
			const caption = this.getNodeParameter('caption', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
			const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

			const formData: IDataObject = {
				file: {
					value: fileBuffer,
					options: {
						filename: binaryData.fileName || 'photo',
						contentType: binaryData.mimeType || 'application/octet-stream',
					},
				},
				caption,
			} as unknown as IDataObject;

			// Add optional fields to form data (skip zero for ID fields)
			for (const [key, value] of Object.entries(additionalFields)) {
				if (value !== undefined && value !== null && value !== '') {
					if ((key === 'folder_id' || key === 'photoable_id') && value === 0) continue;
					formData[key] = value;
				}
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(formData as any)._isMultipart = true;

			responseData = await huduApiRequest.call(
				this,
				'POST' as IHttpRequestMethods,
				resourceEndpoint,
				formData,
			);
			break;
		}

		case 'get': {
			const photoId = this.getNodeParameter('photoId', i) as number;
			const download = this.getNodeParameter('download', i, false) as boolean;

			if (download) {
				// The /photos/{id} endpoint returns JSON metadata (not binary data),
				// with a `url` field pointing to the actual file location (e.g. cloud storage).
				// We must fetch the metadata first, then download from the real file URL.
				const metadata = await handleGetOperation.call(
					this,
					resourceEndpoint,
					String(photoId),
					'photo',
				);

				const photoData = (Array.isArray(metadata) ? metadata[0] : metadata) as IDataObject;
				const fileUrl = photoData?.url as string | undefined;

				if (!fileUrl) {
					throw new NodeOperationError(
						this.getNode(),
						`Photo ${photoId} does not have a downloadable URL. The API response did not include a 'url' field.`,
						{ itemIndex: i },
					);
				}

				// Download the actual file from the URL (may be cloud storage / CDN).
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const fileResponse = await this.helpers.httpRequest({
					method: 'GET',
					url: fileUrl,
					encoding: 'arraybuffer',
					returnFullResponse: true,
					json: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				}) as any;

				const contentType =
					(fileResponse.headers?.['content-type'] as string) || 'application/octet-stream';
				const contentDisposition =
					(fileResponse.headers?.['content-disposition'] as string) || '';

				// Extract filename from Content-Disposition header, fall back to URL path, then caption
				let fileName = 'photo';
				const filenameMatch = contentDisposition.match(
					/filename[^;=\n]*=\s*(?:"([^"]+)"|([^;\n]+))/i,
				);
				if (filenameMatch) {
					fileName = filenameMatch[1] || filenameMatch[2] || fileName;
				} else {
					// Try to extract filename from the URL path
					try {
						const urlPath = new URL(fileUrl).pathname;
						const urlFilename = urlPath.split('/').pop();
						if (urlFilename && urlFilename.includes('.')) {
							fileName = urlFilename;
						}
					} catch {
						// URL parsing failed, keep default
					}
					// Fall back to caption if available
					if (fileName === 'photo' && photoData.caption) {
						fileName = photoData.caption as string;
					}
				}

				const binaryData = await this.helpers.prepareBinaryData(
					Buffer.from(fileResponse.body as Buffer),
					fileName,
					contentType,
				);

				responseData = {
					json: photoData,
					binary: { data: binaryData },
					pairedItem: { item: i },
					__isBinaryDownload: true,
				} as unknown as IDataObject;
			} else {
				responseData = await handleGetOperation.call(
					this,
					resourceEndpoint,
					String(photoId),
					'photo',
				);
			}
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
			const filters = this.getNodeParameter('filters', i) as IDataObject;

			const qs: IDataObject = { ...filters };

			// Strip zero-value ID filters that would match no records
			if (qs.folder_id === 0) delete qs.folder_id;
			if (qs.photoable_id === 0) delete qs.photoable_id;

			// Coerce archived boolean → string for the API
			if (filters.archived !== undefined) {
				qs.archived = filters.archived ? 'true' : 'false';
			}

			// Process created_at date range filter (remove raw fixedCollection from qs first)
			delete qs.created_at;
			if (filters.created_at) {
				const createdAtFilter = filters.created_at as IDataObject;
				if (createdAtFilter.range) {
					const rangeObj = createdAtFilter.range as IDataObject;
					qs.created_at = processDateRange({
						range: {
							mode: rangeObj.mode as 'exact' | 'range' | 'preset',
							exact: rangeObj.exact as string,
							start: rangeObj.start as string,
							end: rangeObj.end as string,
							preset: rangeObj.preset as DateRangePreset,
						},
					});
				}
			}

			// Process updated_at date range filter (remove raw fixedCollection from qs first)
			delete qs.updated_at;
			if (filters.updated_at) {
				const updatedAtFilter = filters.updated_at as IDataObject;
				if (updatedAtFilter.range) {
					const rangeObj = updatedAtFilter.range as IDataObject;
					qs.updated_at = processDateRange({
						range: {
							mode: rangeObj.mode as 'exact' | 'range' | 'preset',
							exact: rangeObj.exact as string,
							start: rangeObj.start as string,
							end: rangeObj.end as string,
							preset: rangeObj.preset as DateRangePreset,
						},
					});
				}
			}

			responseData = await handleListing.call(
				this,
				'GET' as IHttpRequestMethods,
				resourceEndpoint,
				'photos',
				{},
				qs,
				returnAll,
				limit,
			);
			break;
		}

		case 'update': {
			const photoId = this.getNodeParameter('photoId', i) as number;
			const updateFields = this.getNodeParameter('photoUpdateFields', i) as IDataObject;

			const body: IDataObject = {};
			for (const [key, value] of Object.entries(updateFields)) {
				if (value !== undefined && value !== null && value !== '') {
					body[key] = value;
				}
			}

			responseData = await huduApiRequest.call(
				this,
				'PUT' as IHttpRequestMethods,
				`${resourceEndpoint}/${photoId}`,
				{ photo: body },
			);
			break;
		}

		case 'delete': {
			const photoId = this.getNodeParameter('photoId', i) as number;
			responseData = await handleDeleteOperation.call(
				this,
				resourceEndpoint,
				String(photoId),
			);
			break;
		}
	}

	return responseData;
}
