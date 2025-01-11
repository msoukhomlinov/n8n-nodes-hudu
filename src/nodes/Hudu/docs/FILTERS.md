# Post-Processing Filters

This document describes the post-processing filter system implemented for the Hudu node resources.

## Overview

The filter system allows for flexible filtering of resource results after they are retrieved from the API. These filters are applied client-side after the API response is received.

## Resource-Specific Filters

### Articles
- `folder_id`: Filter by folder ID (exact match)

### Folders
- `parent_folder_id`: Filter by parent folder ID (exact match)
- `childFolder`: Filter by whether the folder is a child ('yes'/'no')

### Relations
- `fromable_type`: Filter by the type of the origin entity (case-insensitive match)
- `fromable_id`: Filter by the ID of the origin entity (exact match)
- `toable_type`: Filter by the type of the destination entity (case-insensitive match)
- `toable_id`: Filter by the ID of the destination entity (exact match)
- `is_inverse`: Filter by whether the relation is inverse (boolean match)

## Implementation Details

Post-processing filters are implemented using the `FilterMapping` type and applied using the `applyPostFilters` utility function. These filters are executed client-side after retrieving data from the API.

## Best Practices

1. Use post-processing filters sparingly as they may impact performance
2. Consider case sensitivity requirements for string matches
3. Use appropriate type conversion for numeric comparisons
4. Document any special filter behavior in the code

## Note

Other filters mentioned in the resource descriptions are applied directly through the API and are not part of the post-processing filter system. 