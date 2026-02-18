# Contributing to FFS (Friendly File Server)

Thank you for your interest in contributing to FFS! This guide will help you get started.

## Quick Start

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YourUsername/ffs.git
   cd ffs
   ```

2. **Set Up Development Environment**
   ```bash
   deno task setup
   ```

3. **Create a Feature Branch**
   ```bash
   # For mobile-related changes, always branch from and target mobile-contrib
   git checkout -b feature/your-feature-name
   ```

4. **Make Your Changes**
   - Follow the code style guidelines (see below)
   - Add tests for new functionality
   - Update documentation as needed

5. **Test Your Changes**
   ```bash
   deno fmt
   deno task test
   deno task run  # Manual testing at http://localhost:8080
   ```

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - **IMPORTANT**: For mobile-related features, create PR targeting `mobile-contrib` branch
   - For general features, target the default branch
   - Fill out the PR template completely
   - Reference any related issues

## Branch Strategy

- `main` - Stable production code
- `mobile-contrib` - Mobile-focused features and improvements
- Feature branches - Branch from appropriate base (`main` or `mobile-contrib`)

### When to target `mobile-contrib`
Create PRs to `mobile-contrib` for:
- Mobile UI improvements
- Touch interaction enhancements
- Responsive design changes
- Mobile-specific bug fixes
- Mobile performance optimizations

## Code Style

This project uses Deno's formatting with custom configuration:
- **Indentation**: 4 spaces (not tabs)
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Line Width**: 100 characters
- **TypeScript**: All source files should be `.ts`

Run `deno fmt` before committing to ensure consistent formatting.

## Project Structure

```
ffs/
├── .github/          # GitHub configurations and agent definitions
├── src/              # Source code
│   ├── website/      # Frontend (views, components, static files)
│   ├── file-listing/ # File operations API
│   ├── security/     # Authentication & authorization
│   ├── thumbnails/   # Thumbnail generation
│   └── ...
├── test/             # Test files
├── scripts/          # Build and utility scripts
├── data/             # Sample configurations
└── deploy/           # Deployment configurations
```

## Development Workflow

### Running the Development Server
```bash
deno task run
# Server runs on http://localhost:8080
```

### Running Tests
```bash
# Run all tests
deno task test

# Run specific test
deno test test/specific-test.test.ts
```

### Building Docker Image
```bash
deno task build-docker
```

## Writing Tests

- Place tests in `/test` directory
- Name test files with `.test.ts` suffix
- Use Deno's built-in test framework
- Follow existing test patterns

Example:
```typescript
import { assertEquals } from '@std/assert';

Deno.test('example test', () => {
    assertEquals(1 + 1, 2);
});
```

## Mobile-First Development

This project prioritizes mobile usability:

1. **Test on Mobile Viewports**
   - Use browser dev tools to test different screen sizes
   - Test on actual mobile devices when possible

2. **Responsive Design**
   - Use existing screen-specific CSS in `/src/website/static/css/screen-specific/`
   - Breakpoints: xs, s, m, l, xl

3. **Touch-Friendly UI**
   - Ensure buttons and interactive elements are large enough
   - Provide adequate spacing between clickable elements
   - Avoid hover-only interactions

## Working with Components

Frontend uses vanilla JavaScript Web Components:

```javascript
// Example component in /src/website/components/
export class MyComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div>Component content</div>`;
    }
}

customElements.define('my-component', MyComponent);
```

After adding/modifying components:
```bash
deno task bundle-component-library
```

## API Development

1. Create handler in appropriate module
2. Export from module's `index.ts`
3. Register route in main router
4. Add tests
5. Update documentation

## Security Guidelines

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate all user inputs
- Follow existing authentication patterns
- Test authorization boundaries

## Documentation

- Update README.md for user-facing changes
- Update code comments for complex logic
- Update API documentation if endpoints change
- Add examples for new features

## Commit Messages

Follow conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add thumbnail support for WEBP images`

## Getting Help

- Check existing issues and PRs
- Review the codebase and existing patterns
- Ask questions in issues or PR comments
- Refer to [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed technical info

## AI Agent Guidelines

For AI agents working on this repository:

1. **Always read** `.github/copilot-instructions.md` for technical details
2. **Always target** `mobile-contrib` branch for mobile-related changes
3. **Always run** `deno fmt` and `deno task test` before committing
4. **Keep changes minimal** - only modify what's necessary
5. **Follow existing patterns** - consistency is key
6. **Test thoroughly** - especially mobile viewports for UI changes

## License

By contributing, you agree that your contributions will be licensed under the ImageMagick License. See LICENSE file for details.

## Questions?

Feel free to open an issue for questions or clarifications!
