import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
  handleCreateOperation,
  handleDeleteOperation,
  handleGetOperation,
  handleGetAllOperation,
} from '../../utils/operations';
import { coercePositiveInt } from '../../utils/validation';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import type { PasswordSharesOperation } from './password_shares.types';

function sharesEndpoint(passwordId: string | number, node: ReturnType<IExecuteFunctions['getNode']>): string {
  return `/asset_passwords/${coercePositiveInt(passwordId, node, 'Asset Password ID')}/shares`;
}

export async function handlePasswordSharesOperation(
  this: IExecuteFunctions,
  operation: PasswordSharesOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const assetPasswordId = this.getNodeParameter('asset_password_id', i) as string | number;
  const endpoint = sharesEndpoint(assetPasswordId, this.getNode());

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      return await handleGetAllOperation.call(
        this,
        endpoint,
        'shares',
        {},
        returnAll,
        limit,
      );
    }

    case 'get': {
      const shareId = this.getNodeParameter('shareId', i) as string | number;
      return await handleGetOperation.call(this, endpoint, shareId, 'share');
    }

    case 'create': {
      // Hudu's expire_in is an unbounded int64; the 1-year cap is set by the
      // node so the "never-expire links are not permitted" guarantee holds.
      const MAX_EXPIRE_IN = 31536000; // 1 year in seconds
      const expireIn = this.getNodeParameter('expire_in', i) as number;
      if (!Number.isFinite(expireIn) || expireIn <= 0 || !Number.isInteger(expireIn)) {
        throw new NodeOperationError(
          this.getNode(),
          'expire_in must be a positive integer (seconds until the link expires). Never-expire links are not permitted.',
          { itemIndex: i },
        );
      }
      if (expireIn > MAX_EXPIRE_IN) {
        throw new NodeOperationError(
          this.getNode(),
          `expire_in must be between 1 and ${MAX_EXPIRE_IN} seconds (1 year). Never-expire links are not permitted.`,
          { itemIndex: i },
        );
      }

      const body: IDataObject = {
        expire_in: expireIn,
      };

      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
      for (const [key, value] of Object.entries(additionalFields)) {
        // The validated expire_in above is the only value allowed to reach the
        // wire; an expire_in smuggled through additionalFields would bypass it.
        if (key === 'expire_in') continue;
        if (value !== undefined && value !== null && value !== '') {
          body[key] = value;
        }
      }

      return await handleCreateOperation.call(this, endpoint, { share: body });
    }

    case 'delete': {
      const shareId = this.getNodeParameter('shareId', i) as string | number;
      return await handleDeleteOperation.call(this, endpoint, shareId);
    }
  }

  throw new Error(`Unsupported operation ${operation}`);
}
