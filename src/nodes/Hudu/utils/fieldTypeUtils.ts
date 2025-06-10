import type { IDataObject } from 'n8n-workflow';
import { ASSET_LAYOUT_FIELD_TYPES } from './constants';

/**
 * Standard asset fields that are top-level properties of the asset object.
 * These fields don't require snake_case conversion and are directly accessible.
 */
const STANDARD_ASSET_FIELDS = [
  'name',
  'primary_serial',
  'primary_mail', 
  'primary_model',
  'primary_manufacturer',
  'hostname',
  'notes',
  'asset_layout_id',
  'company_id',
  'archived',
  'created_at',
  'updated_at',
  'slug',
  'url',
] as const;

/**
 * Determines if a field name corresponds to a standard asset field.
 * Standard fields are top-level properties of the asset object.
 * 
 * @param fieldName The field name to check
 * @returns True if the field is a standard asset field
 */
export function isStandardField(fieldName: string): boolean {
  return STANDARD_ASSET_FIELDS.includes(fieldName as any);
}

/**
 * Determines if a field object represents a custom field.
 * Custom fields are defined in asset layouts and appear in the asset.fields array.
 * They have field_type properties that are not 'AssetTag'.
 * 
 * @param field The field object to check
 * @returns True if the field is a custom field
 */
export function isCustomField(field: IDataObject): boolean {
  if (!field || typeof field !== 'object') {
    return false;
  }
  
  // Must have a field_type property
  if (!field.field_type || typeof field.field_type !== 'string') {
    return false;
  }
  
  // Must not be an AssetTag (which is a link field)
  if (field.field_type === ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG) {
    return false;
  }
  
  // Must be a recognised custom field type
  const customFieldTypes = [
    ASSET_LAYOUT_FIELD_TYPES.TEXT,
    ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT,
    ASSET_LAYOUT_FIELD_TYPES.HEADING,
    ASSET_LAYOUT_FIELD_TYPES.CHECKBOX,
    ASSET_LAYOUT_FIELD_TYPES.WEBSITE,
    ASSET_LAYOUT_FIELD_TYPES.PASSWORD,
    ASSET_LAYOUT_FIELD_TYPES.NUMBER,
    ASSET_LAYOUT_FIELD_TYPES.DATE,
    ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT,
    ASSET_LAYOUT_FIELD_TYPES.EMBED,
    ASSET_LAYOUT_FIELD_TYPES.EMAIL,
    ASSET_LAYOUT_FIELD_TYPES.PHONE,
    ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA,
    ASSET_LAYOUT_FIELD_TYPES.DROPDOWN,
    ASSET_LAYOUT_FIELD_TYPES.RELATION,
  ];
  
  return customFieldTypes.includes(field.field_type as any);
}

/**
 * Determines if a field object represents a link field (AssetTag).
 * Link fields connect assets to other assets and have special handling.
 * 
 * @param field The field object to check
 * @returns True if the field is a link field
 */
export function isLinkField(field: IDataObject): boolean {
  if (!field || typeof field !== 'object') {
    return false;
  }
  
  return field.field_type === ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG;
}

/**
 * Detects the type of a field based on its properties.
 * This is used for field classification in resource mappers and validation.
 * 
 * @param field The field object to analyse
 * @returns The detected field type: 'standard', 'custom', or 'link'
 */
export function detectFieldType(field: IDataObject): 'standard' | 'custom' | 'link' {
  // Check if it's a standard field by name
  if (field.label && typeof field.label === 'string' && isStandardField(field.label)) {
    return 'standard';
  }
  
  // Check if it's a link field
  if (isLinkField(field)) {
    return 'link';
  }
  
  // Check if it's a custom field
  if (isCustomField(field)) {
    return 'custom';
  }
  
  // Default to custom for unknown field types
  return 'custom';
}

/**
 * Normalises field type strings to handle case variations and aliases.
 * This ensures consistent field type handling across the application.
 * 
 * @param fieldType The field type string to normalise
 * @returns The normalised field type string
 */
export function normaliseFieldType(fieldType: string): string {
  if (!fieldType || typeof fieldType !== 'string') {
    return ASSET_LAYOUT_FIELD_TYPES.TEXT; // Default fallback
  }
  
  // Handle case variations
  const normalised = fieldType.trim();
  
  // Map common variations to standard types
  const typeMap: Record<string, string> = {
    'checkbox': ASSET_LAYOUT_FIELD_TYPES.CHECKBOX,
    'CheckBox': ASSET_LAYOUT_FIELD_TYPES.CHECKBOX,
    'check_box': ASSET_LAYOUT_FIELD_TYPES.CHECKBOX,
    'text': ASSET_LAYOUT_FIELD_TYPES.TEXT,
    'Text': ASSET_LAYOUT_FIELD_TYPES.TEXT,
    'richtext': ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT,
    'RichText': ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT,
    'rich_text': ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT,
    'number': ASSET_LAYOUT_FIELD_TYPES.NUMBER,
    'Number': ASSET_LAYOUT_FIELD_TYPES.NUMBER,
    'date': ASSET_LAYOUT_FIELD_TYPES.DATE,
    'Date': ASSET_LAYOUT_FIELD_TYPES.DATE,
    'website': ASSET_LAYOUT_FIELD_TYPES.WEBSITE,
    'Website': ASSET_LAYOUT_FIELD_TYPES.WEBSITE,
    'password': ASSET_LAYOUT_FIELD_TYPES.PASSWORD,
    'Password': ASSET_LAYOUT_FIELD_TYPES.PASSWORD,
    'email': ASSET_LAYOUT_FIELD_TYPES.EMAIL,
    'Email': ASSET_LAYOUT_FIELD_TYPES.EMAIL,
    'phone': ASSET_LAYOUT_FIELD_TYPES.PHONE,
    'Phone': ASSET_LAYOUT_FIELD_TYPES.PHONE,
    'assettag': ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG,
    'AssetTag': ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG,
    'asset_tag': ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG,
    'listselect': ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT,
    'ListSelect': ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT,
    'list_select': ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT,
    'dropdown': ASSET_LAYOUT_FIELD_TYPES.DROPDOWN,
    'Dropdown': ASSET_LAYOUT_FIELD_TYPES.DROPDOWN,
    'relation': ASSET_LAYOUT_FIELD_TYPES.RELATION,
    'Relation': ASSET_LAYOUT_FIELD_TYPES.RELATION,
    'embed': ASSET_LAYOUT_FIELD_TYPES.EMBED,
    'Embed': ASSET_LAYOUT_FIELD_TYPES.EMBED,
    'heading': ASSET_LAYOUT_FIELD_TYPES.HEADING,
    'Heading': ASSET_LAYOUT_FIELD_TYPES.HEADING,
    'addressdata': ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA,
    'AddressData': ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA,
    'address_data': ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA,
  };
  
  // Return mapped type or original if no mapping found
  return typeMap[normalised] || normalised;
}

/**
 * Validates that a field type is supported for updates.
 * Some legacy field types (like Dropdown) cannot be updated via the API.
 * 
 * @param fieldType The field type to validate
 * @returns True if the field type supports updates
 */
export function isFieldTypeUpdatable(fieldType: string): boolean {
  const unsupportedTypes: string[] = [
    ASSET_LAYOUT_FIELD_TYPES.DROPDOWN, // Legacy field type
    ASSET_LAYOUT_FIELD_TYPES.HEADING,  // Display-only field
  ];
  
  const normalisedType = normaliseFieldType(fieldType);
  return !unsupportedTypes.includes(normalisedType);
}

/**
 * Gets the expected JavaScript type for a given Hudu field type.
 * This is used for validation and transformation in resource mappers.
 * 
 * @param fieldType The Hudu field type
 * @returns The expected JavaScript type
 */
export function getExpectedJavaScriptType(fieldType: string): string {
  const normalisedType = normaliseFieldType(fieldType);
  
  switch (normalisedType) {
    case ASSET_LAYOUT_FIELD_TYPES.CHECKBOX:
      return 'boolean';
    case ASSET_LAYOUT_FIELD_TYPES.NUMBER:
      return 'number';
    case ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA:
      return 'object'; // Address object
    default:
      return 'string'; // Most fields, including AssetTag, Relation, Date, and ListSelect, default to string
  }
} 