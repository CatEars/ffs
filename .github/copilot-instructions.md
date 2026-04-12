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

**Whenever making changes to the frontend** (HTML views under `src/app/website/views/`, or any inline JavaScript), first check what is already available globally by consulting:

- `src/app/website/templates/base.html` — the base layout included on every page; it pulls in all shared scripts and styles.
- `src/app/website/templates/js-utils.html` — utility functions available on every page (e.g. `formatBytes`, `range`, `getUrlParam`, `setUrlParam`, `getCookie`). **Do not redefine these in individual page scripts.**

Then consult `megaphone-js.html` to understand:

- How application state is declared (`megaphone.declareState(...)`)
- How computed/derived values work (`megaphone.view(...)`)
- How API data is fetched reactively (`megaphone.jsonApi(...)`)
- How local/session storage is bound to state (`megaphone.localStorage(...)`, `megaphone.sessionStorage(...)`)
- How CSRF tokens are managed (`megaphone.declareCsrfCookie(...)`)
- How a state value is rendered into a DOM element (`megaphone.render(state, selector, renderFunc)`) — watches `state` and replaces the children of the element matched by `selector` with the result of `renderFunc(value)` on every change.
- How a list of state values is rendered (`megaphone.renderEach(state, selector, renderFunc)`) — like `render`, but iterates over an array, calling `renderFunc(item, idx)` for each element.
- How a reusable `<template>` element is cloned and populated (`megaphone.template(templateSelector, renderFunc)`) — returns a render function that deep-clones the `<template>` matched by `templateSelector` and passes the clone to `renderFunc` for population; use as the `renderFunc` argument of `render`/`renderEach`.
- How a Web Component element is created from state (`megaphone.webComponent(tagName, attributeGenerator)`) — returns a render function that creates a `<tagName>` element and sets attributes from the object returned by `attributeGenerator(value)`; use as the `renderFunc` argument of `render`/`renderEach`.

Prefer keeping all state management inside the existing Megaphone instance on each page. Avoid introducing a second reactivity library; direct DOM mutations outside of Megaphone render functions are discouraged.

## Dependencies

**Do not introduce new libraries or dependencies.** The project intentionally keeps its dependency surface small. All required packages are already declared in `deno.jsonc`. Use only what is already imported there.

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

## Running in the Agent Sandbox

The cloud agent sandbox intercepts outbound TLS with its own CA certificate. Deno does not trust this CA by default, so **all Deno commands must be prefixed with `DENO_TLS_CA_STORE=system`** to use the system certificate store. Without this, Deno cannot download JSR packages and will fail immediately with `invalid peer certificate: UnknownIssuer`.

```sh
DENO_TLS_CA_STORE=system deno task test
DENO_TLS_CA_STORE=system deno run --allow-all src/app/main.ts
```

### Starting the server for system tests

The system tests under `src/test/system/` connect to a live server at `http://localhost:8080`. The server must be running before executing `deno task test`. Start it in the background using the same environment variables that `src/scripts/dev-main.ts` sets:

```sh
FFS_ENV=dev \
FFS_STORE_ROOT=. \
FFS_USERS_FILE=data/users-file.json \
FFS_INSTANCE_SECRET=VerySecretIndeed \
FFS_CUSTOM_COMMANDS_FILE=data/sample-custom-commands.json \
DENO_TLS_CA_STORE=system \
nohup deno run --allow-all src/app/main.ts > /tmp/ffs-server.log 2>&1 &
```

Wait ~15 seconds for startup to complete (watch `/tmp/ffs-server.log` for `Starting server on port 8080`), then run:

```sh
DENO_TLS_CA_STORE=system deno test --allow-all
```
