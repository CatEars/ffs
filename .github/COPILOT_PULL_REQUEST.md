# Copilot Pull Request Instructions

## Default Branch for Pull Requests

**CRITICAL**: When creating pull requests with GitHub Copilot, follow these rules:

### Mobile-Related Changes
If your changes involve any of the following, target the `mobile-contrib` branch:
- Mobile UI improvements or fixes
- Touch interaction enhancements
- Responsive design changes
- Mobile viewport optimizations
- Mobile-specific CSS changes
- Screen-specific styling (xs, s, m, l, xl breakpoints)
- Changes to `/src/website/static/css/screen-specific/`
- Mobile usability improvements

**Command**: Target `mobile-contrib` as the base branch

### General Changes
For non-mobile-specific changes, target the default repository branch.

## How to Determine Branch Target

Ask yourself:
1. Does this change improve mobile experience?
2. Does this modify responsive design?
3. Does this affect touch interactions?
4. Is this a mobile-specific bug fix?

If YES to any: → **Target `mobile-contrib`**
If NO to all: → Target default branch

## Pull Request Checklist

Before creating a PR, ensure:
- [ ] Code is formatted: `deno fmt`
- [ ] Tests pass: `deno task test`
- [ ] Mobile viewports tested (for UI changes)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventional format
- [ ] PR description references related issues
- [ ] Correct base branch selected

## Examples

### Mobile-Related PR (target: mobile-contrib)
```
Title: feat: improve touch target sizes for file selection
Branch: feature/improve-touch-targets → mobile-contrib
```

### General PR (target: default branch)
```
Title: fix: correct file upload validation logic
Branch: fix/upload-validation → main
```

## Notes for AI Agents

- When in doubt about which branch to target, prefer `mobile-contrib` for any UI-related changes
- The project has a mobile-first philosophy, so mobile improvements are always welcome
- Review the mobile-first guidelines in CONTRIBUTING.md before making UI changes
