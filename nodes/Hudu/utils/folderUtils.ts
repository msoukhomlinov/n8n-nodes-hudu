import type { IExecuteFunctions } from 'n8n-workflow';
import type { IFolder, IFolderPathResponse } from '../resources/folders/folders.types';
import { handleGetOperation } from './operations';

export async function buildFolderPath(
  context: IExecuteFunctions,
  folderId: string,
  separatorOption: string,
  customSeparator: string,
): Promise<IFolderPathResponse> {
  const separator =
    separatorOption === 'custom' ? (customSeparator || '/') : separatorOption || '/';

  const folders: IFolder[] = [];
  const visitedIds = new Set<number>();
  let currentFolderId: string | null = folderId;
  let depth = 0;
  const MAX_DEPTH = 100;
  const resourceEndpoint = '/folders';

  // Recursively get all folders in the path
  while (currentFolderId && depth < MAX_DEPTH) {
    const folder = (await handleGetOperation.call(
      context,
      resourceEndpoint,
      currentFolderId,
      'folder',
    )) as IFolder;

    if (!folder || typeof folder.id !== 'number') {
      break;
    }

    if (visitedIds.has(folder.id)) {
      // Prevent potential circular references
      break;
    }

    visitedIds.add(folder.id);
    folders.unshift(folder); // Add to start of array to maintain correct order

    currentFolderId =
      folder.parent_folder_id !== undefined && folder.parent_folder_id !== null
        ? folder.parent_folder_id.toString()
        : null;

    depth += 1;
  }

  const path = folders.map((folder) => folder.name).join(separator);

  return {
    path,
  };
}


