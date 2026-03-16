import type { IDataObject } from 'n8n-workflow';

export type FilterFunction<T = IDataObject> = (item: IDataObject, value: T[keyof T]) => boolean;

export interface FilterMapping<T = IDataObject> {
  [key: string]: FilterFunction<T>;
} 