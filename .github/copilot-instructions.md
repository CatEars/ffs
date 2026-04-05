# GitHub Copilot Instructions for FFS

## Project Overview

FFS (Friendly File Server) is a Deno-based file server application. The source code lives under `src/` and is organized into four top-level folders.

### Design goals

These goals should guide every technical decision:

- **Crash-resistant** — a power outage means "just restart"; avoid state that can't survive an unclean shutdown.
- **Zero config** — runnable with no configuration; all config lives in-files and in-app.
- **Low dependency** — prefer stable, standard APIs over fast-moving packages; keep the dependency surface small and slow-moving.
- **Mobile usable** — UI must be comfortable on mobile devices, not merely tolerable.
- **Easy to extend** — writing and enabling a custom plugin should be straightforward.

## Folder Structure

### `src/app/`
All application code goes here. This is the primary place for business logic, server startup, middleware, security, and feature modules. Sub-folders represent features or concerns (e.g., `security`, `thumbnails`, `files`, `logging`).

**API routes live under `src/app/api/`.** This folder uses file-based routing: every TypeScript file in this tree that exports a function whose name starts with `register` is automatically discovered and registered by the file router at startup. The URL path declared inside `register` **must match the folder/file structure**. For example, a route handler at `src/app/api/directory/index.ts` must register the path `/api/directory`.

**Website/UI code lives under `src/app/website/`.** Views, templates, and static files belong here alongside the component library registration.

### `src/lib/`
Shared, reusable utility libraries with no dependency on application state. Code here should be generic and independently testable. Examples: `file-router`, `file-system`, `http`, `logger`, `security`, `cache`.

### `src/test/`
All automated tests and test helpers. Test files are co-located with the features they cover and use the naming convention `*.test.ts`. Shared test utilities (fixtures, helpers, constants) live here rather than in `src/app/` or `src/lib/`.

### `src/scripts/`
Developer tooling and build scripts. These are not part of the deployable application. Use this folder for automation tasks such as bundling, code generation, release packaging, and setup helpers.

## API File-Based Routing

The file router (`src/lib/file-router/`) scans `src/app/api/` at startup and auto-registers every exported `register*` function it finds. Rules:

- Each API endpoint belongs in its own subfolder under `src/app/api/`, named after the path segment it serves.
- The `register` function inside that file must declare a route whose path matches the folder path. For example `src/app/api/download/index.ts` registers `/api/download`.
- Do not skip or merge path segments between the file location and the declared route.

## Web Components (Design System)

Reusable UI components are implemented as native Web Components under `src/app/website/components/`. Each component extends `BaseWebComponent` (defined in `base.js`) and implements the `render(html)` method using the `htm`/`preact` tagged-template helper.

- Components are organized into categories: `layout/`, `display/`, `control/`, `navigation/`, `text/`.
- All components are registered via `src/app/website/components/index.js`.
- When building new UI, reuse existing components from this library before creating new ones.
- New components must extend `BaseWebComponent` and follow the same `render(html)` pattern.

## Frontend Reactivity: Megaphone

The frontend uses a **homebrew reactivity framework called Megaphone**, defined in `src/app/website/templates/megaphone-js.html`. It is included into every HTML page via the `base.html` template (`src/app/website/templates/base.html`).

**Whenever making changes to the frontend** (HTML views under `src/app/website/views/`, or any inline JavaScript), consult `megaphone-js.html` first to understand:

- How application state is declared (`megaphone.declareState(...)`)
- How computed/derived values work (`megaphone.view(...)`)
- How API data is fetched reactively (`megaphone.jsonApi(...)`)
- How local/session storage is bound to state (`megaphone.localStorage(...)`, `megaphone.sessionStorage(...)`)
- How CSRF tokens are managed (`megaphone.declareCsrfCookie(...)`)

Do not bypass Megaphone by adding a second reactivity library or ad-hoc DOM mutation; keep all state management inside the existing Megaphone instance on each page.

## Dependencies

**Do not introduce new libraries or dependencies.** The project intentionally keeps its dependency surface small. All required packages are already declared in `deno.jsonc`. Use only what is already imported there.

## Comments

Follow the minimal-commenting philosophy described in `.github/CODING_GUIDELINES.md`. Write self-documenting code through clear names and types. Do not add comments that restate what the code does. Only comment when explaining a non-obvious algorithmic choice, a deliberate performance trade-off, an intentionally empty block, or a suppressed linter warning.

## Code Style

- Deno runtime; TypeScript for server-side code, JavaScript for client-side components.
- Formatting is enforced by `deno fmt` (see `deno.jsonc`): 4-space indentation, single quotes, semicolons, 100-character line width.
- Functions are named as actions (verbs); variables as nouns; booleans as questions (`isValid`, `hasAccess`).
- Prefer small, focused functions with single responsibilities.

## Tasks

Common development tasks are defined in `deno.jsonc`:

- `deno task run` — start the development server
- `deno task test` — run all tests
- `deno task bundle-component-library` — bundle the client-side component library
- `deno task setup` — first-time setup (downloads dependencies and vendor binaries)
