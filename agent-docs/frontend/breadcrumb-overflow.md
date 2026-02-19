# Breadcrumb Navigation Horizontal Overflow

## Overview

This document describes the implementation of horizontal overflow scrolling for the breadcrumb navigation component to improve mobile UX on narrow screens.

## Problem

When navigating deep directory structures, breadcrumb trails can extend beyond the screen width, making navigation difficult on mobile devices. Previously, the breadcrumbs would wrap to multiple lines using `flex-wrap: wrap`, which could take up significant vertical space.

## Solution

The breadcrumb component now uses CSS overflow properties to enable native horizontal scrolling on touch devices. Users can swipe the breadcrumbs left and right to view the entire trail on a single line.

### Key Features

1. **Native Touch Scrolling:** Uses `overflow-x: auto` which automatically enables swipe-to-scroll on mobile devices
2. **Momentum Scrolling:** `-webkit-overflow-scrolling: touch` provides smooth, native-feeling scrolling on iOS
3. **Hidden Scrollbar:** Cleaner appearance without visible scrollbar chrome
4. **Fade Indicator:** Subtle gradient mask hints at additional content
5. **No JavaScript Required:** Pure CSS solution leveraging native browser capabilities

## Implementation Details

### File Modified
- `/src/website/components/navigation/breadcrumb-nav.js`

### CSS Changes

#### Nav Container
```css
nav {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    mask-image: linear-gradient(to right, black 95%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black 95%, transparent 100%);
}
nav::-webkit-scrollbar {
    display: none;
}
```

#### List Styling
```css
ol {
    display: flex;
    flex-direction: row;
    /* Removed: flex-wrap: wrap */
}
li {
    flex-shrink: 0;
    white-space: nowrap;
}
```

### How It Works

| Property | Purpose |
|----------|---------|
| `overflow-x: auto` | Creates horizontal scrollable area; enables touch swipe on mobile |
| `white-space: nowrap` | Prevents text from wrapping within breadcrumb items |
| `flex-shrink: 0` | Prevents flex items from shrinking to fit viewport, triggering overflow |
| `-webkit-overflow-scrolling: touch` | Enables momentum scrolling on iOS for native feel |
| `scrollbar-width: none` + `::-webkit-scrollbar` | Hides scrollbar for app-like appearance |
| `mask-image` gradient | Subtle fade-out effect hints at additional content |

## Benefits

1. **Better Mobile UX:** Native touch scrolling feels intuitive on mobile devices
2. **Space Efficient:** Keeps breadcrumbs on single line, saving vertical space
3. **Consistent:** Works across all modern browsers and devices
4. **Accessible:** Content remains available to screen readers; gradient is purely visual
5. **No Dependencies:** Pure CSS solution with no JavaScript overhead

## Browser Support

- **Overflow scrolling:** Universal support in all modern browsers
- **Touch scrolling:** Automatic on touch devices
- **Momentum scrolling:** iOS Safari and other WebKit browsers
- **Scrollbar hiding:** Supported in modern Firefox, Chrome, Safari, Edge
- **Mask gradient:** Supported in all modern browsers with vendor prefixes

## Testing Scenarios

The implementation should be tested with:
- Short breadcrumb trails (1-3 items): Should display normally
- Long breadcrumb trails (10+ items): Should enable horizontal scrolling
- Touch devices: Swipe gestures should scroll breadcrumbs
- Desktop browsers: Mouse drag or scroll wheel should work
- Screen readers: All breadcrumb items should be announced

## Accessibility Considerations

- The gradient mask is set to 95% to minimize visual obstruction
- Content is not hidden from screen readers (mask is visual only)
- All breadcrumb items remain accessible via keyboard navigation
- The fade serves as a visual hint without blocking interaction
