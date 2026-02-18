# AI Agent Quick Reference

This is a quick reference card for AI agents working on the FFS repository.

## 🚨 Critical Rules

1. **ALWAYS target `mobile-contrib` branch** for:
   - Mobile UI changes
   - Responsive design updates
   - Touch interaction improvements
   - Mobile-specific bug fixes

2. **ALWAYS run before committing**:
   ```bash
   deno fmt
   deno task test
   ```

3. **ALWAYS follow mobile-first principles** for UI changes

## Quick Commands

```bash
# Setup
deno task setup

# Development
deno task run                    # Start dev server (port 8080)

# Testing
deno task test                   # Run all tests
deno test path/to/test.test.ts  # Run specific test

# Formatting
deno fmt                         # Format all files

# Building
deno task build-docker           # Build Docker image
```

## Project Structure Quick Map

```
src/
├── website/          → Frontend (views, components, CSS, JS)
│   ├── views/       → HTML pages
│   ├── components/  → Web Components
│   └── static/      → CSS, SVG, other static files
├── file-listing/    → File operations API
├── security/        → Auth & authorization
├── thumbnails/      → Thumbnail generation
└── main.ts          → Application entry point

test/                → All test files
scripts/             → Build and utility scripts
.github/
├── copilot-instructions.md     → Detailed instructions
├── COPILOT_PULL_REQUEST.md     → PR branch targeting rules
└── agents/                      → Custom agent definitions
```

## Code Style (Quick)

- **Indentation**: 4 spaces
- **Quotes**: Single (`'`)
- **Semicolons**: Yes
- **Line width**: 100 chars
- **Files**: `.ts` for source code

## Common Patterns

### Adding a Route
```typescript
// In src/main.ts or relevant router
router.get('/api/endpoint', async (ctx) => {
    // Handler code
});
```

### Creating a Component
```javascript
// In src/website/components/
export class MyComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `...`;
    }
}
customElements.define('my-component', MyComponent);
```

## Mobile Breakpoints
- `xs` - Extra small
- `s` - Small
- `m` - Medium
- `l` - Large
- `xl` - Extra large

CSS files in: `/src/website/static/css/screen-specific/`

## Testing Checklist

- [ ] Code formatted: `deno fmt`
- [ ] Tests pass: `deno task test`
- [ ] Manual testing: `deno task run`
- [ ] Mobile viewports tested (if UI change)
- [ ] No console errors
- [ ] Documentation updated

## When in Doubt

1. Check existing code for similar patterns
2. Read `.github/copilot-instructions.md` for details
3. Review `CONTRIBUTING.md` for workflows
4. Follow mobile-first principles for any UI work

## PR Creation

1. Write descriptive commit messages (conventional format)
2. Target `mobile-contrib` for mobile changes
3. Fill out PR template completely
4. Reference related issues

---

**Full Documentation**: 
- [copilot-instructions.md](./copilot-instructions.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [COPILOT_PULL_REQUEST.md](./COPILOT_PULL_REQUEST.md)
