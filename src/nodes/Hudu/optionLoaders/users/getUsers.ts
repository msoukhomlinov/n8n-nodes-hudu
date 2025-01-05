import type { ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import { LoggerProxy } from 'n8n-workflow';
import { handleListing } from '../../utils/GenericFunctions';

interface UserOption {
  name: string;
  value: number;
  archived: boolean;
}

interface HuduUser extends IDataObject {
  id: number;
  first_name: string;
  last_name: string;
  archived: boolean;
}

/**
 * Get all users from Hudu API
 */
export async function getUsers(this: ILoadOptionsFunctions) {
  try {
    const includeBlank = this.getNodeParameter('includeBlank', true) as boolean;
    const users = (await handleListing.call(
      this,
      'GET',
      '/users',
      'users',
      {},
      {},
      true, // returnAll
      0, // no limit
    )) as HuduUser[];

    const mappedUsers = users
      .map((user) => ({
        name: `${user.first_name} ${user.last_name} (${user.id})${
          user.archived ? ' - Archived' : ''
        }`,
        value: user.id,
        archived: user.archived,
      }))
      .sort((a: UserOption, b: UserOption) => {
        if (a.archived !== b.archived) {
          return a.archived ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });

    if (includeBlank) {
      return [
        {
          name: '- No User -',
          value: '',
        },
        ...mappedUsers.map(({ name, value }) => ({ name, value })),
      ];
    }

    return mappedUsers.map(({ name, value }) => ({ name, value }));
  } catch (error) {
    LoggerProxy.error('Error loading users from Hudu API', { error });
    return [];
  }
}
