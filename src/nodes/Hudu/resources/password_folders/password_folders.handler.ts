import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleGetOperation, handleGetAllOperation, handleCreateOperation, handleUpdateOperation, handleDeleteOperation } from '../../utils/operations';
import type { PasswordFoldersOperations } from './password_folders.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import type { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function handlePasswordFoldersOperation(
  this: IExecuteFunctions,
  operation: PasswordFoldersOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/password_folders';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'get': {
      const folderId = this.getNodeParameter('folderId', i) as string;
      const identifierType = this.getNodeParameter('identifierType', i, 'id') as string;

      if (identifierType === 'slug') {
        // Use getAll with slug filter for slug-based retrieval
        const passwordFolders = await handleGetAllOperation.call(
          this,
          resourceEndpoint,
          'password_folders',
          { slug: folderId },
          false, // returnAll
          1,     // limit to 1 for efficiency
        ) as IDataObject[];

        if (passwordFolders.length === 0) {
          throw new NodeOperationError(
            this.getNode(),
            `Password folder with slug "${folderId}" not found`,
            { itemIndex: i },
          );
        }

        if (passwordFolders.length > 1) {
          // Should not happen if slugs are unique, but handle gracefully
          throw new NodeOperationError(
            this.getNode(),
            `Multiple password folders found with slug "${folderId}" (expected unique)`,
            { itemIndex: i },
          );
        }

        responseData = passwordFolders[0];
      } else {
        // Use existing handleGetOperation for ID-based retrieval
        responseData = await handleGetOperation.call(this, resourceEndpoint, folderId, 'password_folder');
      }
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      const qs: IDataObject = {
        ...filters,
      };

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'password_folders',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const security = this.getNodeParameter('security', i) as string;
      const companyId = this.getNodeParameter('company_id', i) as string;
      const description = this.getNodeParameter('description', i) as string;
      const allowedGroupsParam = this.getNodeParameter('allowed_groups', i, []) as unknown;

      const body: IDataObject = {};
      body.name = name;
      body.security = security;
      if (companyId !== undefined && companyId !== null && companyId !== '') {
        body.company_id = Number.parseInt(companyId as string, 10);
      }
      if (description) {
        body.description = description;
      }

      // normalise allowed groups to number[] and drop blanks
      const allowedGroups = Array.isArray(allowedGroupsParam)
        ? (allowedGroupsParam
            .map((v) => (typeof v === 'string' ? v.trim() : v))
            .filter((v) => v !== '' && v !== null && v !== undefined)
            .map((v) => (typeof v === 'string' ? Number.parseInt(v, 10) : (v as number)))
            .filter((v) => Number.isFinite(v)) as number[])
        : [];

      if (security === 'specific') {
        if (!Array.isArray(allowedGroups) || allowedGroups.length === 0) {
          throw new NodeOperationError(this.getNode() as unknown as INode, 'allowed_groups is required when security is "specific"', { itemIndex: i });
        }
        body.allowed_groups = allowedGroups;
      }

      responseData = await handleCreateOperation.call(this, resourceEndpoint, { password_folder: body });
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as string;
      const updateFields = this.getNodeParameter('passwordFolderUpdateFields', i) as IDataObject;

      // Coerce and clean optional fields
      if (updateFields.company_id === '') {
        delete updateFields.company_id;
      } else if (updateFields.company_id !== undefined && updateFields.company_id !== null) {
        updateFields.company_id = Number.parseInt(updateFields.company_id as string, 10);
      }

      if (updateFields.description === '') {
        delete updateFields.description;
      }

      // normalise allowed_groups to number[] and drop blanks if provided
      if (Array.isArray(updateFields.allowed_groups)) {
        updateFields.allowed_groups = (updateFields.allowed_groups as unknown[])
          .map((v) => (typeof v === 'string' ? v.trim() : v))
          .filter((v) => v !== '' && v !== null && v !== undefined)
          .map((v) => (typeof v === 'string' ? Number.parseInt(v, 10) : (v as number)))
          .filter((v) => Number.isFinite(v));
      }

      if (updateFields.security === 'specific') {
        const groups = updateFields.allowed_groups as number[] | undefined;
        if (!Array.isArray(groups) || groups.length === 0) {
          throw new NodeOperationError(this.getNode() as unknown as INode, 'passwordFolderUpdateFields.allowed_groups is required when security is "specific"', { itemIndex: i });
        }
      } else if (updateFields.security === 'all_users') {
        // ensure we don't send empty groups when security is all_users
        delete updateFields.allowed_groups;
      } else if (!updateFields.security) {
        // If security not being changed, but empty groups provided, drop them
        if (Array.isArray(updateFields.allowed_groups) && updateFields.allowed_groups.length === 0) {
          delete updateFields.allowed_groups;
        }
      }

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, id, { password_folder: updateFields });
      break;
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as string;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, id);
      break;
    }
  }

  return responseData;
}
