import type { IDataObject } from 'n8n-workflow';

export interface IVlanZone extends IDataObject {
  id?: number; // The unique identifier for the VLAN Zone
  name: string; // Human-readable zone name
  slug?: string; // URL-friendly identifier
  description?: string; // Optional description
  vlan_id_ranges: string; // Comma-separated list of numeric ranges (e.g. "100-500,1000-1500")
  company_id: number; // The identifier of the company that owns this VLAN Zone
  archived?: boolean; // Whether the VLAN Zone is archived (for create/update)
  archived_at?: string; // The date and time when the VLAN Zone was archived. Null if not archived.
  created_at?: string; // The date and time when the VLAN Zone was created.
  updated_at?: string; // The date and time when the VLAN Zone was last updated.
  vlans_count?: number; // Number of VLANs currently assigned to this zone
  url?: string; // Link to zone in the web UI
}

export interface IVlanZoneResponse extends IDataObject {
  vlan_zone: IVlanZone;
}

export type VlanZoneOperation = 'getAll' | 'get' | 'create' | 'update' | 'delete'; 