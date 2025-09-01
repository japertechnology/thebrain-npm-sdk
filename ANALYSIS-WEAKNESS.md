# Weakness Report

## Security

### Logger exposes sensitive request and response data
- **Severity**: High
- **Affected Files/Locations**: src/logger.ts
- **Description**: The Bunyan logger records request and response bodies and only redacts headers with exact lower-case names, leaving differently cased headers like `Authorization` unredacted and leaking sensitive payloads.
- **Recommendation**: Avoid logging raw request/response bodies by default and normalize header names before redaction; explicitly omit or mask sensitive fields.

### Unencoded parameters in NotesImagesApi can enable path injection
- **Severity**: Medium
- **Affected Files/Locations**: src/notes-images.ts
- **Description**: `getNoteImage` interpolates `brainId`, `token`, and `filename` directly into the URL path without encoding, allowing malicious values with `/` or `..` to alter the request path.
- **Recommendation**: Encode path segments with `encodeURIComponent` and validate tokens/filenames against safe patterns before constructing URLs.

## Code Quality

### Extensive use of `any` types
- **Severity**: Medium
- **Affected Files/Locations**: src/links.ts, src/thoughts.ts
- **Description**: Several API methods return `any` or `any[]`, disabling compile-time checks and obscuring the structure of data returned from the API.
- **Recommendation**: Replace `any` with explicit interfaces or shared DTO types to ensure type safety.

### Duplicate `BrainDto` definitions
- **Severity**: Low
- **Affected Files/Locations**: src/brains.ts, src/model.ts
- **Description**: `BrainDto` schema is declared separately in multiple files, increasing the risk of inconsistent updates if the API changes.
- **Recommendation**: Centralize shared DTO schemas in a single module and re-use them across APIs.

## Interface

### `getOrganizationMembers` returns a single user despite plural semantics
- **Severity**: Medium
- **Affected Files/Locations**: src/users.ts
- **Description**: The method name and documentation imply returning multiple organization members, yet the return type is a single `UserDto`.
- **Recommendation**: Adjust the return type to `UserDto[]` or rename the method and documentation to match the actual behavior.

### Manually setting multipart header may omit boundary
- **Severity**: Low
- **Affected Files/Locations**: src/brains.ts
- **Description**: `createBrain` sets `Content-Type: multipart/form-data` explicitly, which can omit the required boundary parameter and break uploads.
- **Recommendation**: Allow Axios or `FormData` to generate the `Content-Type` header with boundary automatically.

## Architecture

### Lack of shared API abstraction for HTTP calls
- **Severity**: Low
- **Affected Files/Locations**: src/links.ts, src/thoughts.ts, and other API classes
- **Description**: Each API class performs similar request/response handling without a common base, leading to duplicated logic and inconsistent error handling.
- **Recommendation**: Introduce a shared base API class or utility functions to centralize request logic, error handling, and response parsing.

