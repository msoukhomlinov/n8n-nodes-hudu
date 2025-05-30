import type { ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import { handleListing } from '../../utils';

interface CompanyOption {
  name: string;
  value: number;
}

interface HuduCompany extends IDataObject {
  id: number;
  name: string;
}

/**
 * Get all companies from Hudu API
 */
export async function getCompanies(this: ILoadOptionsFunctions) {
  try {
    const includeBlank = this.getNodeParameter('includeBlank', true) as boolean;

    const companies = (await handleListing.call(
      this,
      'GET',
      '/companies',
      'companies',
      {},
      {},
      true,
      0,
    )) as HuduCompany[];

    if (!Array.isArray(companies)) {
      return [];
    }

    const mappedCompanies = companies
      .map((company) => ({
        name: `${company.name} (${company.id})`,
        value: company.id,
      }))
      .sort((a: CompanyOption, b: CompanyOption) => a.name.localeCompare(b.name));

    if (includeBlank) {
      return [
        {
          name: '- No Company -',
          value: '',
        },
        ...mappedCompanies,
      ];
    }

    return mappedCompanies;
  } catch (error) {
    return [];
  }
}
