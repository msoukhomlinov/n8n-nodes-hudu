import { IDataObject } from 'n8n-workflow';

export interface IApiInfo extends IDataObject {
  version: string;
  date: string;
}

export type ApiInfoOperation = 'get';
