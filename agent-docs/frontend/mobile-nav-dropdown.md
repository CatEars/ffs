# Mobile Navigation Dropdown

## Overview

This document describes the implementation of a responsive navigation dropdown for the top header on small screens (≤623px). On larger screens the existing `<header-tab>` row is used unchanged; on mobile a native `<select>` element replaces it.

## Problem

The header tab bar is a horizontal flex row. On narrow screens the tabs overflow or crowd the "FFS" logo link, making navigation difficult.

## Solution

A new `<header-nav-select>` web component is shown only on mobile. It renders a native `<select>` element whose options are provided by the parent template via the light DOM (slot pattern), so all navigation destinations remain defined in one place: `header.html`.

### Key Design Decisions

1. **Slot-based options** — `<option>` elements are declared in `header.html` as children of `<header-nav-select>`. The component clones them into its shadow `<select>` on connect and on `slotchange`. No navigation destinations are hardcoded in the component itself.
2. **Duplicate entries, CSS-toggled** — `<header-tab>` elements and `<header-nav-select>` both exist in the DOM at all times. CSS shows one and hides the other depending on screen width.
3. **Flexbox vertical alignment** — On mobile, `align-items: center` is added to `.header` and `.main-link`'s `padding-top` is reset to `0`, so the "FFS" logo and the dropdown share the same vertical centre without needing margin hacks.

## Files Changed

| File | Change |
|------|--------|
| `src/website/components/navigation/header-nav-select.js` | New web component |
| `src/website/components/index.js` | Register `header-nav-select` |
| `src/website/views/templates/header/header.html` | Add `<header-nav-select>` with `<option>` children |
| `src/website/static/css/header.css` | Hide `header-nav-select` by default |
| `src/website/static/css/screen-specific/xs.css` | Show dropdown, hide tabs, centre flex row on mobile |

## Implementation Details

### `header-nav-select.js`

Extends `HTMLElement` directly (no preact/htm dependency).

```js
connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    // <style>, <select>, <slot> appended to shadow root
    // <slot> is hidden (display: none) — it only serves as a projection point
    slot.addEventListener('slotchange', () => this._buildOptions(select));
    this._buildOptions(select);
}

_buildOptions(select) {
    // Normalise current URL path
    // Clone each HTMLOptionElement child into the shadow <select>
    // Mark the option whose value matches the current path as selected
}
```

Navigation is performed via `window.location.href` on the `change` event of the `<select>`.

Active route detection mirrors `<header-tab>`: `currentLocation.startsWith(option.value)`.

### `header.html`

```html
<header-nav-select>
    <option value="/home/">Files</option>
    <option value="/custom-commands/">Commands</option>
    <option value="/share-file/">Share</option>
    <option value="/logs/">Logs</option>
</header-nav-select>
<header-tab href="/home/">Files</header-tab>
<header-tab href="/custom-commands/">Commands</header-tab>
<header-tab href="/share-file/">Share</header-tab>
<header-tab href="/logs/">Logs</header-tab>
```

### CSS — `header.css` (all screen sizes)

```css
.header > header-nav-select {
    display: none; /* hidden unless overridden by a breakpoint */
}
```

### CSS — `xs.css` (≤623px)

```css
.header {
    align-items: center; /* vertically centre logo + dropdown */
}
.header > .main-link {
    padding-top: 0; /* remove top padding so centring is accurate */
}
.header > header-tab {
    display: none;
}
.header > header-nav-select {
    display: flex;
    align-items: center;
    flex: 1;
    margin: 0.25rem; /* small gap from logo and screen edges */
}
```

## Breakpoints

| Breakpoint | Behaviour |
|------------|-----------|
| `> 623px`  | `<header-tab>` row shown, `<header-nav-select>` hidden |
| `≤ 623px`  | `<header-nav-select>` shown, `<header-tab>` elements hidden |
