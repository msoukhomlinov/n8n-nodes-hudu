# Debugging n8n-nodes-hudu

This document outlines how to use the debugging capabilities in the n8n-nodes-hudu integration.

## Configuration

Debugging is controlled via the `debugConfig.ts` file located in `src/nodes/Hudu/utils/`. The configuration allows you to enable/disable specific debugging areas through the `DEBUG_CONFIG` object.

## Debug Categories

The following debug categories are available:

### API Communication
- `API_REQUEST`: Debug API request details
- `API_RESPONSE`: Debug API response details

### Core Operations
- `OPERATION_CREATE`: Debug create operations
- `OPERATION_UPDATE`: Debug update operations
- `OPERATION_DELETE`: Debug delete operations
- `OPERATION_GET`: Debug get operations
- `OPERATION_GET_ALL`: Debug getAll operations
- `OPERATION_ARCHIVE`: Debug archive operations

### Resource Handlers
- `RESOURCE_PROCESSING`: Debug resource handler processing
- `RESOURCE_PARAMS`: Debug parameter extraction in handlers
- `RESOURCE_TRANSFORM`: Debug data transformations in handlers

### Node Execution
- `NODE_INPUT`: Debug input items to node
- `NODE_OUTPUT`: Debug output from node

### Utility Functions
- `UTIL_DATE_PROCESSING`: Debug date range processing
- `UTIL_FILTERS`: Debug filter processing
- `UTIL_TYPE_CONVERSION`: Debug type conversions

## Enabling Debug Output

To enable debugging for specific categories:

1. Locate `src/nodes/Hudu/utils/debugConfig.ts`
2. Set the desired categories to `true` in the `DEBUG_CONFIG` object:
   ```typescript
   export const DEBUG_CONFIG = {
     API_REQUEST: true,     // Enable API request debugging
     API_RESPONSE: true,    // Enable API response debugging
     // ... other options
   };
   ```

## What Gets Logged

When debugging is enabled, the output includes:

1. API Communication
   - Request URLs, headers (with sensitive data redacted), bodies, and query parameters
   - Response status codes, bodies, and headers

2. Operation Details
   - Parameters and data for create, update, delete, get, and archive operations
   - Resource processing steps and transformations

3. Node Execution Details
   - Input data received by the node
   - Output data produced by the node

4. Utility Processing
   - Date range processing details
   - Filter processing information
   - Type conversion operations

## Best Practices

1. **Production Use**
   - Disable all debugging in production
   - Only enable required categories when troubleshooting

2. **Sensitive Information**
   - API keys and sensitive data are automatically redacted via the `redactSensitiveData` function
   - Always verify logs are clean before sharing

3. **Performance Impact**
   - Enable only necessary debug categories
   - Be aware that extensive debugging may impact performance

## Examples

### Debug API Communication
```typescript
export const DEBUG_CONFIG = {
  API_REQUEST: true,
  API_RESPONSE: true,
  // ... other options set to false
};
```

### Debug Resource Processing
```typescript
export const DEBUG_CONFIG = {
  RESOURCE_PROCESSING: true,
  RESOURCE_PARAMS: true,
  RESOURCE_TRANSFORM: true,
  // ... other options set to false
};
```

### Full Debug Mode
```typescript
export const DEBUG_CONFIG = {
  API_REQUEST: true,
  API_RESPONSE: true,
  OPERATION_CREATE: true,
  OPERATION_UPDATE: true,
  OPERATION_DELETE: true,
  OPERATION_GET: true,
  OPERATION_GET_ALL: true,
  OPERATION_ARCHIVE: true,
  RESOURCE_PROCESSING: true,
  RESOURCE_PARAMS: true,
  RESOURCE_TRANSFORM: true,
  NODE_INPUT: true,
  NODE_OUTPUT: true,
  UTIL_DATE_PROCESSING: true,
  UTIL_FILTERS: true,
  UTIL_TYPE_CONVERSION: true
};
```

## Support

If you encounter issues:
1. Enable relevant debug categories
2. Reproduce the issue
3. Collect logs
4. Create an issue on GitHub with the logs (ensure sensitive data is removed) 