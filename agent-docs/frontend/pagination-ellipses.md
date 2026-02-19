# Pagination with Ellipses

## Overview

This document describes the implementation of pagination ellipses in the `paginate-control` web component to handle cases where there are many pages to display.

## Problem

When viewing content with many pages (e.g., 100+ pages), displaying all page numbers in the pagination control results in an excessively long list that is difficult to navigate and clutters the UI.

## Solution

The pagination component now intelligently truncates the page list using ellipses (`...`) while ensuring key pages remain accessible:

### Display Rules

1. **Always visible:**
   - Previous (`<`) and Next (`>`) navigation controls
   - First page (1)
   - Last page (maxPages)
   - Current page
   - 2 adjacent pages on each side of the current page (delta = 2)

2. **Ellipses display:**
   - Shown when there are gaps between displayed page numbers
   - Indicates hidden pages between sections

3. **Threshold:**
   - All pages shown when total pages ≤ 7
   - Ellipses used when total pages > 7

### Examples

#### Small pagination (5 pages, current: 1)
```
< [1] 2 3 4 5 >
```

#### Many pages at start (20 pages, current: 1)
```
< [1] 2 3 ... 20 >
```

#### Many pages in middle (20 pages, current: 10)
```
< 1 ... 8 9 [10] 11 12 ... 20 >
```

#### Many pages at end (20 pages, current: 20)
```
< 1 ... 18 19 [20] >
```

#### Very many pages (100 pages, current: 50)
```
< 1 ... 48 49 [50] 51 52 ... 100 >
```

## Implementation Details

### File Modified
- `/src/website/components/control/paginate-control.js`

### Key Algorithm

```javascript
const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // Show 2 pages on each side of current page
    
    // Calculate if we need ellipses
    const needsEllipses = maxPages > (delta * 2 + 1 + 2); // middle range + first + last
    
    if (!needsEllipses) {
        // Show all pages
        for (let i = 1; i <= maxPages; i++) {
            pages.push(i);
        }
        return pages;
    }
    
    // Show pages with ellipses
    for (let i = 1; i <= maxPages; i++) {
        if (
            i === 1 ||                              // First page
            i === maxPages ||                       // Last page
            (i >= currentPage - delta && i <= currentPage + delta) // Current ± delta
        ) {
            pages.push(i);
        }
    }
    
    return pages;
};
```

### Ellipsis Rendering

Ellipses are inserted when there's a gap (difference > 1) between consecutive page numbers:

```javascript
pageNumbers.map((pageNum, idx) => {
    const prevPageNum = idx > 0 ? pageNumbers[idx - 1] : 0;
    const showEllipsis = pageNum - prevPageNum > 1;
    
    return html`
        ${showEllipsis ? html`<li class="ellipsis">...</li>` : ''}
        <li>
            <a href="#" 
               class="${currentPage === pageNum ? 'disabled' : ''}"
               onclick="${() => to(pageNum)}"
            >${pageNum}</a>
        </li>
    `;
});
```

### Styling

Added `.ellipsis` class for visual consistency:

```css
.ellipsis {
    color: var(--font-color);
    opacity: var(--disabled-opacity);
}
```

## Benefits

1. **Improved UX:** Cleaner, more manageable pagination UI
2. **Scalability:** Handles any number of pages without UI degradation
3. **Navigation:** Key pages remain easily accessible
4. **Consistency:** Maintains the same interaction patterns

## Testing

The implementation was tested with various scenarios:
- Small page counts (1-7 pages): All pages displayed
- Medium page counts (8-20 pages): Appropriate ellipses placement
- Large page counts (100+ pages): Proper truncation at all positions
- Edge cases: Current page near start, middle, and end

## Backward Compatibility

This change is fully backward compatible:
- Existing API unchanged (same attributes: `page`, `max-pages`)
- Same events dispatched (`page-shift`)
- Same visual style for existing elements
- Only adds ellipses when beneficial (> 7 pages)
