# GitHub Copilot Instructions for FFS

## Project Overview
Friendly File Server (FFS) is a zero-config, crash-resistant file server built with Deno. The project emphasizes mobile usability, low dependencies, and easy extensibility.

## Technology Stack
- **Runtime**: Deno (TypeScript/JavaScript)
- **Web Framework**: Oak (jsr:@oak/oak)
- **Frontend**: Vanilla JavaScript with Web Components
- **Styling**: Custom CSS with mobile-first approach
- **Build Tool**: Deno tasks (see deno.jsonc)

## Project Structure
- `/src` - Main application source code
  - `/website` - Frontend views, components, and static files
  - `/file-listing` - File operations (list, upload, delete, etc.)
  - `/security` - Authentication and authorization
  - `/thumbnails` - Image/video thumbnail generation
  - `/custom-commands` - Custom command execution
- `/scripts` - Build and utility scripts
- `/test` - Test files
- `/data` - Sample data and configuration files
- `/.github/agents` - Custom agent instructions

## Development Setup
1. Install Deno (if not already installed)
2. Run setup: `deno task setup`
3. Start dev server: `deno task run`
4. Run tests: `deno task test`

## Key Commands
- `deno task setup` - Initialize development environment
- `deno task run` - Run development server (port 8080)
- `deno task test` - Run all tests
- `deno task build-docker` - Build Docker image
- `deno fmt` - Format code (respects .prettierrc for HTML/JS exclusions)
- `deno lint` - Lint TypeScript files

## Code Style Guidelines
- Use TypeScript for all source code
- Indent with 4 spaces (not tabs)
- Use single quotes for strings
- Line width: 100 characters
- Semicolons: required
- Follow existing patterns in the codebase

## Testing
- Test files are in `/test` directory
- Use Deno's built-in test framework
- Run tests before committing changes: `deno task test`
- Add tests for new functionality

## Mobile-First Development
This project prioritizes mobile usability:
- Test UI changes on mobile viewports
- Use responsive CSS (see `/src/website/static/css/screen-specific/`)
- Ensure touch-friendly interfaces
- Keep UI simple and accessible

## Pull Request Guidelines
- **CRITICAL**: For any mobile-related changes (UI, responsive design, touch interactions, mobile bug fixes), ALWAYS create pull requests targeting the `mobile-contrib` branch
- For non-mobile changes, target the default branch
- Keep changes focused and minimal
- Update tests when modifying functionality
- Run `deno fmt` and `deno task test` before committing
- Reference related issues in PR description
- See `.github/COPILOT_PULL_REQUEST.md` for detailed branch targeting rules

## Working with Components
- Frontend uses vanilla JS Web Components (no framework)
- Components are in `/src/website/components/`
- Follow the existing component patterns
- Use the bundler: `deno task bundle-component-library`

## Security Considerations
- Authentication is handled via basic auth (see `/src/logon`)
- API endpoints are protected with claims-based authorization
- File access is controlled by user permissions
- Never expose sensitive configuration in logs

## Common Tasks
### Adding a new page
1. Create HTML in `/src/website/views/<name>/`
2. Create corresponding TypeScript file with route
3. Update `/src/website/collect-all-pages.ts`
4. Add CSS if needed in `/src/website/static/css/`

### Adding a new API endpoint
1. Create handler in appropriate module (e.g., `/src/file-listing/`)
2. Export from module's `index.ts`
3. Add route in `/src/main.ts` or relevant router
4. Add tests in `/test/`

### Modifying thumbnails
1. Nailers are in `/src/thumbnails/nailers/`
2. Test with various file types
3. Consider performance impact

## Deployment
- Docker is the primary deployment method
- Use `deno task build-docker` to build
- Configuration via environment variables (see `/src/config.ts`)
- Key env var: `FFS_STORE_ROOT` - root directory for file storage

## Troubleshooting
- If vendor binaries are missing: `deno task download-vendor-binaries`
- If dependencies fail: `deno task download-dependencies`
- For development issues, check `.devcontainer/` setup scripts

## Additional Resources
- Main README: `/README.md`
- Sample configurations: `/data/`
- Deployment examples: `/deploy/`
- Custom agent definitions: `/.github/agents/`
