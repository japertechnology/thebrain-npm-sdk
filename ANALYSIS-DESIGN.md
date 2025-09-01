# Repository Overview
This repository provides a TypeScript SDK for TheBrain API, offering typed access to brain, thought, link, attachment, note, search, user, and access control endpoints. The client manages authentication, rate limiting, and structured data modeling.

# Directory and File Structure
```
/ (root)
├── src/
│   ├── attachments.ts
│   ├── brain-access.ts
│   ├── brains.ts
│   ├── index.ts
│   ├── links.ts
│   ├── logger.ts
│   ├── model.ts
│   ├── notes.ts
│   ├── notes-images.ts
│   ├── search.ts
│   ├── thoughts.ts
│   ├── users.ts
│   └── __tests__/
│       ├── mocked/…
│       └── e2e/…
├── package.json
├── rollup.config.js
├── tsconfig.json
├── tsconfig.test.json
├── vitest.config.ts
└── README.md
```
- **src/**: Source code for the SDK.
- **src/__tests__/**: Unit and end-to-end tests.
- **package.json**: Project metadata, scripts, and dependencies.
- **rollup.config.js**: Build configuration.
- **tsconfig*.json**: TypeScript configurations.
- **vitest.config.ts**: Testing configuration.

# Core Components
- **TheBrainApi (src/index.ts)**: Central client that configures Axios with rate limiting and logging interceptors, exposes grouped APIs (`brains`, `thoughts`, `links`, etc.).
- **BrainsApi, ThoughtsApi, LinksApi, AttachmentsApi, NotesApi, NotesImagesApi, SearchApi, UsersApi, BrainAccessApi (src/*.ts)**: Modules encapsulating REST calls for specific resources, returning typed results and supporting CRUD operations.
- **Model definitions (src/model.ts)**: Zod schemas and enums describing domain entities like thoughts, links, attachments, and search results.
- **Logger (src/logger.ts)**: Bunyan-based logger with custom serializers and header sanitization.

# Data Flow or Control Flow
```
TheBrainApi
    ├─ initializes Axios instance
    ├─ sets rate limit & logging interceptors
    └─ exposes resource APIs
            └─ each API uses shared Axios instance → TheBrain REST endpoints
```
The client receives configuration, authenticates requests with a bearer token, intercepts requests for throttling and logging, and delegates endpoint-specific logic to resource APIs.

# External Dependencies
- **axios**: HTTP client used for API requests and interceptors.
- **zod**: Runtime schema validation and typing for request/response models.
- **bunyan**: Structured logging with custom serializers.
- **vitest** and **@vitest/coverage-v8**: Testing framework and coverage tools.
- **rollup** and plugins: Build and bundling tools for distribution.

# Notable Design Decisions
- Modular API classes share a single Axios instance, promoting consistent configuration and easier testing.
- Zod schemas enforce runtime validation and provide TypeScript inference for API models.
- Interceptors implement basic rate limiting and structured logging, reducing boilerplate in individual API methods.

# Limitations or Warnings
- End-to-end tests require a valid `THEBRAIN_API_KEY`, making them unusable without credentials.
- Some API methods return `any` for complex responses, limiting type safety.
- Error handling primarily relies on Axios rejections; no custom recovery strategies are implemented.

# Error Handling
Modules largely propagate Axios errors to callers. The central client logs request and response failures but does not implement retries or granular error classification.
