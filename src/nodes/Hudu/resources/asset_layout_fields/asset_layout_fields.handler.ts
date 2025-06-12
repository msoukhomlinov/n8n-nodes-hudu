import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	handleGetOperation,
	handleUpdateOperation,
} from '../../utils/operations';
import type { AssetLayoutFieldOperation, IAssetLayoutFieldEntity } from './asset_layout_fields.types';
import { debugLog } from '../../utils/debugConfig';
import { NodeOperationError } from 'n8n-workflow';

export async function handleAssetLayoutFieldOperation(
	this: IExecuteFunctions,
	operation: AssetLayoutFieldOperation,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	debugLog(`[OPERATION_${operation.toUpperCase()}] Starting asset layout field operation`, { operation, index: i });
	const assetLayoutId = this.getNodeParameter('asset_layout_id', i) as string;
	let responseData: IDataObject | IDataObject[] | INodeExecutionData[] = {};

	debugLog('[API_REQUEST] Getting asset layout to operate on its fields', { assetLayoutId });
	const assetLayout = (await handleGetOperation.call(this, '/asset_layouts', assetLayoutId)) as { asset_layout: { fields: IAssetLayoutFieldEntity[] }};
	const fields = (assetLayout.asset_layout.fields || []) as IAssetLayoutFieldEntity[];
	debugLog('[RESOURCE_PARAMS] Retrieved asset layout fields', fields);

	switch (operation) {
		case 'getAll': {
			debugLog('[OPERATION_GET_ALL] Processing get all fields operation');
			responseData = this.helpers.returnJsonArray(fields as IDataObject[]);
			debugLog('[API_RESPONSE] Get all fields response', responseData);
			break;
		}

		case 'get': {
			debugLog('[OPERATION_GET] Processing get field operation');
			const fieldId = this.getNodeParameter('field_id', i) as string;
			debugLog('[RESOURCE_PARAMS] Get field parameters', { fieldId });

			const field = fields.find((f) => f.id === Number.parseInt(fieldId, 10));
			if (!field) {
				throw new NodeOperationError(this.getNode(), `Field with ID ${fieldId} not found in Asset Layout ${assetLayoutId}`);
			}
			responseData = field as IDataObject;
			debugLog('[API_RESPONSE] Get field response', responseData);
			break;
		}

		case 'create': {
			debugLog('[OPERATION_CREATE] Processing create field operation');
			const fieldType = this.getNodeParameter('field_type', i) as string;
			const label = this.getNodeParameter('label', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
			debugLog('[RESOURCE_PARAMS] Create field parameters', { fieldType, label, additionalFields });

			const newField: Partial<IAssetLayoutFieldEntity> = {
				label,
				field_type: fieldType,
				...additionalFields,
			};

			if (newField.field_type !== 'ListSelect') {
				delete newField.list_id;
			}

			const allFields = [...fields, newField];
			debugLog('[API_REQUEST] Updating asset layout with new field', { assetLayoutId, fields: allFields });

			const updatedLayout = await handleUpdateOperation.call(this, '/asset_layouts', assetLayoutId, { asset_layout: { fields: allFields } });
			const updatedFields = ((updatedLayout as { asset_layout: { fields: IAssetLayoutFieldEntity[] } }).asset_layout.fields || []);
			responseData = updatedFields.find(f => f.label === label && f.field_type === fieldType) || updatedFields[updatedFields.length - 1];
			debugLog('[API_RESPONSE] Create field response', responseData);
			break;
		}

		case 'update': {
			debugLog('[OPERATION_UPDATE] Processing update field operation');
			const fieldId = this.getNodeParameter('field_id', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
			debugLog('[RESOURCE_PARAMS] Update field parameters', { fieldId, updateFields });

			const fieldIndex = fields.findIndex((f) => f.id === Number.parseInt(fieldId, 10));
			if (fieldIndex === -1) {
				throw new NodeOperationError(this.getNode(), `Field with ID ${fieldId} not found in Asset Layout ${assetLayoutId}`);
			}

			const updatedField = { ...fields[fieldIndex], ...updateFields };
			if (updatedField.field_type !== 'ListSelect') {
				delete updatedField.list_id;
			}

			const allFields = [...fields];
			allFields[fieldIndex] = updatedField;

			debugLog('[API_REQUEST] Updating asset layout with modified field', { assetLayoutId, fields: allFields });
			await handleUpdateOperation.call(this, '/asset_layouts', assetLayoutId, { asset_layout: { fields: allFields } });

			responseData = updatedField as IDataObject;
			debugLog('[API_RESPONSE] Update field response', responseData);
			break;
		}

		case 'delete': {
			debugLog('[OPERATION_DELETE] Processing delete field operation');
			const fieldId = this.getNodeParameter('field_id', i) as string;
			debugLog('[RESOURCE_PARAMS] Delete field parameters', { fieldId });

			const fieldIndex = fields.findIndex((f) => f.id === Number.parseInt(fieldId, 10));
			if (fieldIndex === -1) {
				throw new NodeOperationError(this.getNode(), `Field with ID ${fieldId} not found in Asset Layout ${assetLayoutId}`);
			}

			const updatedField = { ...fields[fieldIndex], _destroy: true };
			const allFields = [...fields];
			allFields[fieldIndex] = updatedField;

			debugLog('[API_REQUEST] Updating asset layout with destroyed field', { assetLayoutId, fields: allFields });
			await handleUpdateOperation.call(this, '/asset_layouts', assetLayoutId, { asset_layout: { fields: allFields } });

			responseData = { success: true };
			debugLog('[API_RESPONSE] Delete field response', responseData);
			break;
		}

		default: {
			throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for this resource.`);
		}
	}

	debugLog(`[OPERATION_${operation.toUpperCase()}] Operation completed`, responseData);
	return responseData as IDataObject | IDataObject[];
}