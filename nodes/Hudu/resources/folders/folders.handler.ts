import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
  handleGetAllOperation,
  handleGetOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import type { FilterMapping } from '../../utils/types';
import type { FolderOperation, IFolderPostProcessFilters, IFolderPathResponse, IFolder } from './folders.types';
import { folderFilterMapping } from './folders.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { buildFolderPath } from '../../utils/folderUtils';
import type { ICompany } from '../companies/companies.types';

export async function handleFolderOperation(
  this: IExecuteFunctions,
  operation: FolderOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/folders';
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      // Extract post-processing filters and API filters separately
      const postProcessFilters: IFolderPostProcessFilters = {};
      const apiFilters: IDataObject = {};

      // Copy only API filters
      for (const [key, value] of Object.entries(filters)) {
        if (key === 'parent_folder_id') {
          postProcessFilters.parent_folder_id = value as number;
        } else if (key === 'childFolder') {
          postProcessFilters.childFolder = value as 'yes' | 'no' | '';
        } else {
          apiFilters[key] = value;
        }
      }

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'folders',
        apiFilters,
        returnAll,
        limit,
        postProcessFilters as IDataObject,
        folderFilterMapping as FilterMapping,
      );
      break;
    }

    case 'get': {
      const folderId = this.getNodeParameter('folderId', i) as string;
      responseData = await handleGetOperation.call(this, resourceEndpoint, folderId, 'folder');
      break;
    }

    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        name,
        ...additionalFields,
      };

      // Ensure proper field names
      if (additionalFields.parent_folder_id === '') {
        body.parent_folder_id = null;
      }

      if (additionalFields.company_id === '') {
        body.company_id = null;
      }

      responseData = await handleCreateOperation.call(this, resourceEndpoint, { folder: body });
      break;
    }

    case 'update': {
      const folderId = this.getNodeParameter('folderId', i) as string;
      const updateFields = this.getNodeParameter('folderUpdateFields', i) as IDataObject;

      // Ensure proper field handling
      if (updateFields.parent_folder_id === '') {
        updateFields.parent_folder_id = null;
      }

      if (updateFields.company_id === '') {
        updateFields.company_id = null;
      }

      const body: IDataObject = {
        folder: updateFields,
      };

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, folderId, body);
      break;
    }

    case 'getPath': {
      const folderId = this.getNodeParameter('folderId', i) as string;

      // Separator options
      const separatorOption = this.getNodeParameter('separator', i, '/') as string;
      const customSeparator = this.getNodeParameter('customSeparator', i, '') as string;
      const prependCompanyToFolderPath = this.getNodeParameter(
        'prependCompanyToFolderPath',
        i,
        false,
      ) as boolean;

      const { path } = await buildFolderPath(
        this,
        folderId,
        separatorOption,
        customSeparator,
      );

      let finalPath = path;

      if (prependCompanyToFolderPath) {
        let companyLabel = 'Central KB';

        try {
          const folder = (await handleGetOperation.call(
            this,
            resourceEndpoint,
            folderId,
            'folder',
          )) as IFolder;

          if (folder && folder.company_id) {
            try {
              const company = (await handleGetOperation.call(
                this,
                '/companies',
                folder.company_id,
                'company',
              )) as ICompany;

              if (company && company.name) {
                companyLabel = company.name;
              }
            } catch {
              // If company lookup fails, fall back to default label
            }
          }
        } catch {
          // If folder lookup fails, keep default label and base path
        }

        const companySeparator =
          separatorOption === 'custom' ? (customSeparator || '/') : separatorOption || '/';

        finalPath = `${companyLabel}${companySeparator}${path}`;
      }

      responseData = {
        path: finalPath,
      } as IFolderPathResponse;
      break;
    }

    case 'delete': {
      const folderId = this.getNodeParameter('folderId', i) as string;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, folderId);
      break;
    }
  }

  return responseData;
}
