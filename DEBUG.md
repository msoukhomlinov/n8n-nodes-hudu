# Debugging n8n-nodes-hudu

This document describes how to use the built-in debugging in the Hudu node. Debug output uses n8n's Logger API and only appears when n8n is run with debug-level logging enabled.

## Quick Start

1. **Enable categories**  
   Edit `src/nodes/Hudu/utils/debugConfig.ts` and set the desired categories to `true` in `DEBUG_DEFAULTS`.

2. **Rebuild**  
   Run `npm run build`.

3. **Run n8n with debug logging**  
   Start n8n with `N8N_LOG_LEVEL=debug` (environment variable or CLI). Debug messages from the Hudu node will appear in n8n's log output.

## How It Works

- At the start of each execution, the node calls `initDebugLogger(this.logger)` so that all `debugLog()` calls use n8n's built-in Logger.
- n8n only emits debug-level messages when `N8N_LOG_LEVEL=debug` is set (by the operator); the node code does not read environment variables.
- Which messages are emitted is controlled by the category flags in `DEBUG_DEFAULTS`. Only categories set to `true` produce output.
- Sensitive fields (e.g. API keys, passwords) are redacted before anything is passed to the logger via `redactSensitiveData`.

## Debug Categories

### API Communication
- `API_REQUEST`: API request details
- `API_RESPONSE`: API response details
- `API_ERROR`: API error handling and parsing

### Core Operations
- `OPERATION_CREATE`, `OPERATION_UPDATE`, `OPERATION_DELETE`, `OPERATION_GET`, `OPERATION_GET_ALL`, `OPERATION_ARCHIVE`

### Resource Handlers
- `RESOURCE_PROCESSING`: Resource handler processing
- `RESOURCE_PARAMS`: Parameter extraction in handlers
- `RESOURCE_TRANSFORM`: Data transformations in handlers
- `RESOURCE_MAPPING`: Resource mapping

### Node Execution
- `NODE_INPUT`: Input items to the node
- `NODE_OUTPUT`: Output from the node

### Utility Functions
- `UTIL_DATE_PROCESSING`: Date range processing
- `UTIL_FILTERS`: Filter processing
- `UTIL_TYPE_CONVERSION`: Type conversions

### Asset Related
- `ASSET_OPTIONS`: Asset options loading and processing
- `FIELD_TYPE_MAPPING`: Field type mapping
- `OPTION_LOADING`: Option loading

### Diagnostic
- `DIAGNOSTIC_LOGGING`: General diagnostic logging

## What Gets Logged

When a category is enabled and n8n is at debug level, you get:

1. **API** – Request URLs, headers (redacted), bodies, query params; response status, bodies, headers.
2. **Operations** – Parameters and data for create/update/delete/get/archive; resource processing and transformations.
3. **Node execution** – Input items and output data for the node.
4. **Utilities** – Date range handling, filter processing, type conversions.

## Before Publishing

1. Set all `DEBUG_DEFAULTS` values to `false` in `debugConfig.ts`.
2. Run `npm run build`.

No other steps are required. The code does not use `console.log` or environment variables; it uses only n8n's Logger API.

## Sensitive Data

The `redactSensitiveData` function redacts known sensitive keys (e.g. `apiKey`, `password`, `token`, `secret`, `authorization`) before any data is passed to the logger. Always review logs before sharing.

## n8n Verification Compliance

The debug system is designed for verified community nodes:

- Uses n8n's Logger API (`IExecuteFunctions.logger.debug`) only; no `console.log`.
- Does not access environment variables or the file system.
- Does not use restricted globals (e.g. `setTimeout`).
- Uses n8n's standard error types (`NodeApiError`, `NodeOperationError`).

## Support

If you need to capture debug output for a bug report:

1. Enable the relevant categories in `DEBUG_DEFAULTS`.
2. Rebuild and run n8n with `N8N_LOG_LEVEL=debug`.
3. Reproduce the issue and collect logs from n8n's log output.
4. Open an issue with the logs after ensuring no sensitive data remains.
