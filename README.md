# TheBrain API Client

A TypeScript client for TheBrain API that provides type-safe access to all API endpoints.

## Installation
Requires **Node.js 18** or later.

```bash
yarn add thebrain-api
```

## Usage

```typescript
import { TheBrainApi } from 'thebrain-api';

// Initialize the client
const api = new TheBrainApi({
  apiKey: 'your-api-key',
  // Optional configuration
  requestLimit: 10, // Number of requests per window
  rateLimitWindows: 1000, // Window size in milliseconds
  baseURL: 'https://api.bra.in' // API base URL
});

// Example: Get all brains
const brains = await api.brains.getBrains();

// Example: Create a thought
const thought = await api.thoughts.createThought(brainId, {
  name: 'New Thought',
  kind: 1, // Normal thought
  label: 'Optional Label',
  acType: 0 // Public access
});

// Example: Add a file attachment
await api.attachments.addFileAttachment(brainId, thoughtId, file);

// Example: Add a URL attachment
await api.attachments.addUrlAttachment(brainId, thoughtId, 'https://example.com', 'Optional Name');
```

## Features

- Full TypeScript support with type definitions
- Automatic rate limiting
- All API endpoints supported
- File and URL attachment handling
- Error handling
- Request/response validation using Zod

## API Groups

- `brains`: Brain management and operations
- `thoughts`: Thought operations and management
- `links`: Link management between thoughts
- `attachments`: File and URL attachments
- `notes`: Note content management (Markdown, HTML, plain text)
- `notesImages`: Note image handling
- `search`: Search functionality across brains
- `users`: User and organization management
- `brainAccess`: Brain access control and permissions

## Development

```bash
# Install dependencies
yarn install

# Build the package
yarn build

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format
```

## License

MIT

## Using Minified Bundles

By default, you can import the package as usual in Node.js or modern bundlers (Webpack, Vite, etc.):

```js
// CommonJS (Node.js)
const { TheBrainApi } = require('thebrain-api');

// ES Modules (Node.js, modern bundlers)
import { TheBrainApi } from 'thebrain-api';
```

### Minified Bundles

For advanced users who want to use the minified bundles directly (for example, in a browser via a CDN or custom build process), you can reference the minified files:

- **CommonJS minified:** `dist/index.min.js`
- **ESM minified:** `dist/index.min.esm.js`

#### Example (Browser via CDN or direct script tag)

```html
<!-- ESM example -->
<script type="module">
  import { TheBrainApi } from 'https://unpkg.com/thebrain-api@latest/dist/index.min.esm.js';
  // Use TheBrainApi as needed
</script>
```

```html
<!-- CommonJS example (for environments that support require) -->
<script src="https://unpkg.com/thebrain-api@latest/dist/index.min.js"></script>
<script>
  // thebrain-api will be available as a global variable if you UMD-wrap it (not included by default)
</script>
```

> **Note:** The minified files are functionally identical to the regular bundles, but are optimized for production with reduced file size.



