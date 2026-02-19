# FFS Coding Guidelines

This document outlines the coding standards and best practices for the FFS (Friendly File Server) project. All contributors, including AI coding agents, should follow these guidelines to maintain consistency and code quality.

## Core Principles

### Use Comments Sparingly

**The codebase follows a philosophy of minimal commenting.** Code should be self-documenting through:

- Clear, descriptive function and variable names
- Well-defined type signatures
- Logical code organization and structure
- Small, focused functions with single responsibilities

**Statistics:** The codebase maintains approximately 0.5% comment-to-code ratio (18 comments in ~3,249 lines of code).

### When Comments ARE Appropriate

Comments should only be added when they provide value that the code cannot express on its own:

1. **Explaining Non-Obvious Algorithmic Choices**
   ```typescript
   // Breadth-first search to cache a file tree with `visited`
   const queue = [rootPath];
   ```

2. **Documenting Performance Trade-offs**
   ```typescript
   // Lets skip stating files, this makes directory navigation faster at the cost of
   // date times on files not being up to date within 5 minute window
   ```

3. **Intentionally Empty Blocks**
   ```typescript
   catch (err) {
       // Intentionally left empty
   }
   ```

4. **Cross-Reference Links**
   ```typescript
   // LINK-FILE-EXTENSIONS
   const nailers: Thumbnailer[] = [...]
   ```

5. **Explaining Suppressed Linter Warnings**
   ```typescript
   // deno-lint-ignore no-explicit-any
   type Loggable = any;
   ```

6. **Clarifying "Good Enough" Approximations**
   ```typescript
   // This isn't necessarily true, but for prioritizing thumbnails
   // it is okay enough. E.g. ".d" directories are an exception to this.
   ```

### When to Avoid Comments

Do NOT add comments for:

- Restating what the code does (e.g., `// Loop through users`)
- Describing function parameters that are already clear from types
- Explaining standard language features or patterns
- Adding TODO markers (create issues instead)
- Documenting obvious return values or conditions
- Explaining imports or exports
- Describing simple variable assignments

### Example: Self-Documenting Code

**Bad (over-commented):**
```typescript
// Get the file tree from state
const fileTree = ctx.state.fileTree;
// Get the path parameter from the URL
const pathToCheck = ctx.request.url.searchParams.get('path');
// If no path provided, return 404
if (!pathToCheck) {
    ctx.response.status = HTTP_404_NOT_FOUND;
    return;
}
```

**Good (self-documenting):**
```typescript
const fileTree = ctx.state.fileTree;
const pathToCheck = ctx.request.url.searchParams.get('path');
if (!pathToCheck) {
    ctx.response.status = HTTP_404_NOT_FOUND;
    return;
}
```

## Additional Guidelines

### Code Structure
- Prefer small, focused functions over large, complex ones
- Use meaningful names that convey intent
- Leverage TypeScript's type system for self-documentation
- Group related functionality logically

### Naming Conventions
- Use descriptive names that eliminate the need for comments
- Functions should be named as actions (verbs): `registerRoutes`, `validateUser`, `generateThumbnail`
- Variables should be named as nouns: `fileTree`, `userConfig`, `thumbnailPath`
- Boolean variables should be questions: `isValid`, `hasAccess`, `canGenerate`

### Code Clarity
If you find yourself needing to write a comment to explain what code does:
1. First, try to refactor the code to be more self-explanatory
2. Consider extracting complex logic into a well-named function
3. Only if the code still requires explanation, add a minimal comment

## Summary

The FFS project values clean, readable code that speaks for itself. Before adding a comment, ask yourself: "Can I make the code clearer instead?" If the answer is yes, refactor the code. If the answer is no, and the comment provides genuine value, then add it sparingly.
