import { IDataObject } from 'n8n-workflow';

export interface IWebsite extends IDataObject {
  id?: number; // The unique identifier of the website
  name: string; // The URL of the website
  code?: number; // The HTTP response code of the website
  message?: string; // A message related to the website's status
  slug?: string; // The URL slug for the website
  keyword?: string; // A keyword associated with the website (optional)
  monitor_type?: number; // The type of monitoring performed on the website
  status?: string; // The status of the website (e.g., 'ready', 'processing')
  monitoring_status?: string; // The monitoring status of the website (e.g., 'up', 'down')
  refreshed_at?: string; // The timestamp when the website was last refreshed
  monitored_at?: string; // The timestamp when the website was last monitored
  headers?: object; // HTTP headers associated with the website (optional)
  paused?: boolean; // Indicates whether the monitoring of the website is paused
  sent_notifications?: boolean; // Indicates whether notifications related to the website have been sent
  account_id?: number; // The ID of the associated account
  asset_field_id?: number; // The ID of the related asset field (optional)
  company_id?: number; // The ID of the associated company
  discarded_at?: string; // The timestamp when the website was discarded (optional)
  disable_ssl?: boolean; // Indicates whether SSL checks are disabled for the website
  disable_whois?: boolean; // Indicates whether WHOIS checks are disabled for the website
  disable_dns?: boolean; // Indicates whether DNS checks are disabled for the website
  notes?: string; // Additional notes related to the website
  object_type?: string; // The type of the object, in this case, 'Website'
  icon?: string; // The FontAwesome icon related to the website
  asset_type?: string; // The type of the asset, in this case, 'Website'
  company_name?: string; // The name of the associated company
  url?: string; // The URL path of the website within the application
}

export interface IWebsiteResponse extends IDataObject {
  website: IWebsite;
}

export type WebsiteOperation = 'getAll' | 'get' | 'create' | 'update' | 'delete';
