# Debugging n8n-nodes-hudu

This document outlines how to use the debugging capabilities in the n8n-nodes-hudu integration.

## Quick Start - Enable Debug Logging (Development Only)

Debug logging requires manual code changes due to n8n Cloud verification requirements (console.log is not permitted in verified nodes).

### Step 1: Enable Debug Categories

1. Edit `src/nodes/Hudu/utils/debugConfig.ts`
2. Set specific categories to `true` in `DEBUG_DEFAULTS`

### Step 2: Enable Console Output

1. Edit `src/nodes/Hudu/utils/debugConfig.ts`
2. Find the `debugLog` function (around line 180)
3. Uncomment the `console.log` line:

```typescript
// BEFORE (production - no output):
// console.log(formattedMessage, logData !== undefined ? debugStringify(logData) : '');

// AFTER (development - debug output enabled):
console.log(formattedMessage, logData !== undefined ? debugStringify(logData) : '');
```

### Step 3: Rebuild and Restart

```bash
npm run build
# Restart n8n
```

### Step 4: Before Publishing

**IMPORTANT:** Before publishing or submitting for verification:

1. Comment out the `console.log` line in `debugConfig.ts`
2. Set all `DEBUG_DEFAULTS` values to `false`
3. Rebuild: `npm run build`
4. Verify no console statements: `grep -r "console\." dist/`

## Debug Categories

The following debug categories are available:

### API Communication
- `API_REQUEST`: Debug API request details
- `API_RESPONSE`: Debug API response details
- `API_ERROR`: Debug API error handling and parsing

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
   - Never publish with console.log uncommented
   - Always verify with `grep -r "console\." dist/` before publishing

2. **Sensitive Information**
   - API keys and sensitive data are automatically redacted via the `redactSensitiveData` function
   - Always verify logs are clean before sharing

3. **Performance Impact**
   - Enable only necessary debug categories
   - Be aware that extensive debugging may impact performance

4. **Debug Message Format**
   - All debug messages should use standardized category format: `[CATEGORY_NAME]`
   - Always use UPPERCASE_WITH_UNDERSCORES format in square brackets
   - Examples:
     - `[RESOURCE_MAPPING]` (not `[ResourceMapping]`)
     - `[API_REQUEST]` (not `[ApiRequest]`)
     - `[OPTION_LOADING]` (not `[OptionLoading]`)

## n8n Verification Compliance

This node is designed to pass n8n Cloud verification. The debug system:

- **Does NOT use `console.log`** in production builds
- **Does NOT use `setTimeout`** or other restricted globals
- **Does NOT write to files** or use environment variables for config
- Uses n8n's standard error handling (`NodeApiError`, `NodeOperationError`)

The commented `console.log` approach allows developers to debug locally while maintaining verification compliance.

## Support

If you encounter issues:
1. Enable relevant debug categories
2. Uncomment the console.log line
3. Rebuild and reproduce the issue
4. Collect logs from your terminal/container
5. Create an issue on GitHub with the logs (ensure sensitive data is removed)
6. **Remember to comment out console.log before committing!**
