# Manual Test: Pagination Control Component

## Overview
This test document covers the `<paginate-control>` web component, which provides navigation controls for paginated content. The component displays page numbers with smart ellipsis handling and Previous/Next navigation arrows.

## Component Location
`/src/website/components/control/paginate-control.js`

## Test Environment Setup

### Prerequisites
- A test HTML page that includes the `<paginate-control>` component
- Browser developer console open to observe `page-shift` custom events
- Ability to modify component attributes (`page` and `max-pages`)

### Test Page Setup
Create a test HTML page that:
1. Imports and registers the `<paginate-control>` component
2. Includes multiple instances of the component with different configurations
3. Has an event listener to log `page-shift` events to the console

Example:
```html
<paginate-control page="1" max-pages="1"></paginate-control>
<paginate-control page="3" max-pages="5"></paginate-control>
<paginate-control page="1" max-pages="20"></paginate-control>
<paginate-control page="10" max-pages="20"></paginate-control>
<paginate-control page="20" max-pages="20"></paginate-control>

<script>
  document.addEventListener('page-shift', (e) => {
    console.log('Page shift event:', e.detail.page);
  });
</script>
```

---

## Test Case 1: Single Page Display

### Title
Verify pagination control with only one page

### Preconditions
- Component configured with `page="1"` and `max-pages="1"`

### Steps
1. Locate the pagination control with one page
2. Observe the displayed elements

### Expected Result
- Display shows: `< [1] >`
- The number `1` is displayed (representing the current page)
- Both Previous (`<`) and Next (`>`) arrows are visible but disabled (grayed out/reduced opacity)
- No ellipsis (`...`) appears
- The current page link has `disabled` class applied

---

## Test Case 2: Small Number of Pages (All Visible)

### Title
Verify pagination control displays all pages when ≤7 total pages

### Preconditions
- Component configured with `page="3"` and `max-pages="5"`

### Steps
1. Locate the pagination control with 5 pages
2. Observe the displayed page numbers

### Expected Result
- Display shows: `< 1 2 [3] 4 5 >`
- All page numbers from 1 to 5 are visible
- Page 3 is marked as current (disabled link)
- No ellipsis (`...`) appears
- Previous (`<`) arrow is enabled (clickable)
- Next (`>`) arrow is enabled (clickable)

### Additional Test Points
Test with different configurations:
- `page="1"` and `max-pages="7"`: Should show all 7 pages with first page as current
- `page="4"` and `max-pages="7"`: Should show all 7 pages with fourth page as current
- `page="7"` and `max-pages="7"`: Should show all 7 pages with last page as current

---

## Test Case 3: Many Pages - Current Page Near Start

### Title
Verify ellipsis appears on right side when current page is near the beginning

### Preconditions
- Component configured with `page="1"` and `max-pages="20"`

### Steps
1. Locate the pagination control with 20 pages starting at page 1
2. Observe the displayed page numbers and ellipsis placement

### Expected Result
- Display shows: `< [1] 2 3 ... 20 >`
- Page 1 (current) is shown and disabled
- Pages 2 and 3 are shown (within delta=2 range)
- Ellipsis (`...`) appears between page 3 and page 20
- Page 20 (last page) is always shown
- Previous (`<`) arrow is disabled
- Next (`>`) arrow is enabled

### Additional Test Points
Test with `page="2"` and `max-pages="20"`:
- Expected: `< 1 [2] 3 4 ... 20 >`
- Previous arrow should now be enabled

Test with `page="3"` and `max-pages="20"`:
- Expected: `< 1 2 [3] 4 5 ... 20 >`

---

## Test Case 4: Many Pages - Current Page in Middle

### Title
Verify ellipsis appears on both sides when current page is in the middle

### Preconditions
- Component configured with `page="10"` and `max-pages="20"`

### Steps
1. Locate the pagination control with 20 pages at page 10
2. Observe the displayed page numbers and ellipsis placement

### Expected Result
- Display shows: `< 1 ... 8 9 [10] 11 12 ... 20 >`
- Page 1 (first page) is always shown
- Ellipsis (`...`) appears between page 1 and page 8
- Pages 8, 9, 10 (current), 11, and 12 are shown (current ± delta=2 range)
- Page 10 is marked as current (disabled)
- Ellipsis (`...`) appears between page 12 and page 20
- Page 20 (last page) is always shown
- Both Previous (`<`) and Next (`>`) arrows are enabled

### Additional Test Points
Test with different middle positions:
- `page="7"` and `max-pages="15"`: Should show `< 1 ... 5 6 [7] 8 9 ... 15 >`
- `page="12"` and `max-pages="20"`: Should show `< 1 ... 10 11 [12] 13 14 ... 20 >`

---

## Test Case 5: Many Pages - Current Page Near End

### Title
Verify ellipsis appears on left side when current page is near the end

### Preconditions
- Component configured with `page="20"` and `max-pages="20"`

### Steps
1. Locate the pagination control with 20 pages at the last page
2. Observe the displayed page numbers and ellipsis placement

### Expected Result
- Display shows: `< 1 ... 18 19 [20] >`
- Page 1 (first page) is always shown
- Ellipsis (`...`) appears between page 1 and page 18
- Pages 18, 19, and 20 are shown (within delta=2 range of current page)
- Page 20 is marked as current (disabled)
- Previous (`<`) arrow is enabled
- Next (`>`) arrow is disabled

### Additional Test Points
Test with `page="19"` and `max-pages="20"`:
- Expected: `< 1 ... 17 18 [19] 20 >`
- Next arrow should now be enabled

Test with `page="18"` and `max-pages="20"`:
- Expected: `< 1 ... 16 17 [18] 19 20 >`

---

## Test Case 6: Navigation - Previous and Next Arrows

### Title
Verify clicking Previous and Next arrows changes the current page

### Preconditions
- Component configured with `page="10"` and `max-pages="20"`
- Browser console is open and listening for `page-shift` events

### Steps
1. Locate the pagination control at page 10
2. Click the Previous (`<`) arrow
3. Observe the console output
4. Return to page 10
5. Click the Next (`>`) arrow
6. Observe the console output

### Expected Result - Previous Arrow
- A `page-shift` custom event is fired
- Event detail contains: `{ page: 9 }`
- Event bubbles and is composed (crosses shadow DOM boundaries)
- Console logs: "Page shift event: 9"

### Expected Result - Next Arrow
- A `page-shift` custom event is fired
- Event detail contains: `{ page: 11 }`
- Event bubbles and is composed
- Console logs: "Page shift event: 11"

### Notes
- The component itself does not update its `page` attribute automatically
- The parent application is responsible for handling the event and updating the attribute

---

## Test Case 7: Disabled State Validation

### Title
Verify Previous arrow is disabled on first page and Next arrow is disabled on last page

### Preconditions
- Two component instances:
  - Instance A: `page="1"` and `max-pages="10"`
  - Instance B: `page="10"` and `max-pages="10"`

### Steps

#### Part A: First Page
1. Locate Instance A (page 1 of 10)
2. Observe the Previous (`<`) arrow
3. Attempt to click the Previous arrow
4. Observe the console for events

#### Part B: Last Page
5. Locate Instance B (page 10 of 10)
6. Observe the Next (`>`) arrow
7. Attempt to click the Next arrow
8. Observe the console for events

### Expected Result - Part A (First Page)
- Previous (`<`) arrow has the `disabled` class applied
- Arrow appears grayed out (reduced opacity via CSS)
- Clicking the arrow does nothing (pointer-events: none)
- No `page-shift` event is fired
- Next (`>`) arrow is enabled and functional

### Expected Result - Part B (Last Page)
- Next (`>`) arrow has the `disabled` class applied
- Arrow appears grayed out (reduced opacity via CSS)
- Clicking the arrow does nothing (pointer-events: none)
- No `page-shift` event is fired
- Previous (`<`) arrow is enabled and functional

---

## Test Case 8: Page Number Click Navigation

### Title
Verify clicking a specific page number fires the page-shift event with correct page

### Preconditions
- Component configured with `page="5"` and `max-pages="10"`
- Browser console is open and listening for `page-shift` events

### Steps
1. Locate the pagination control at page 5
2. Identify page number 7 in the display
3. Click on page number 7
4. Observe the console output
5. Click on page number 1
6. Observe the console output
7. Attempt to click on page number 5 (current page)
8. Observe the console output

### Expected Result - Clicking Different Page (7)
- A `page-shift` custom event is fired
- Event detail contains: `{ page: 7 }`
- Console logs: "Page shift event: 7"

### Expected Result - Clicking Different Page (1)
- A `page-shift` custom event is fired
- Event detail contains: `{ page: 1 }`
- Console logs: "Page shift event: 1"

### Expected Result - Clicking Current Page (5)
- No `page-shift` event is fired
- Current page link has `disabled` class (pointer-events: none)
- Nothing happens when clicked

### Additional Validation
- Verify that all visible page numbers (except current) are clickable
- Verify that clicking any valid page number fires the event with the correct page value

---

## Test Case 9: Boundary Validation (Delta = 2)

### Title
Verify the component correctly shows 2 pages on each side of current page (delta = 2)

### Preconditions
- Component configured with `page="10"` and `max-pages="20"`

### Steps
1. Locate the pagination control at page 10
2. Count the page numbers visible on each side of the current page (excluding ellipses)

### Expected Result
- Pages shown: `1 ... 8 9 [10] 11 12 ... 20`
- Exactly 2 pages before current: 8, 9
- Exactly 2 pages after current: 11, 12
- Current page: 10
- First page always shown: 1
- Last page always shown: 20
- Total visible page numbers: 7 (1, 8, 9, 10, 11, 12, 20)

### Additional Test Points
Test edge cases where delta range overlaps with first/last page:
- `page="3"` and `max-pages="10"`: Expected `< 1 2 [3] 4 5 ... 10 >`
- `page="8"` and `max-pages="10"`: Expected `< 1 ... 6 7 [8] 9 10 >`

---

## Test Case 10: Ellipsis Threshold Validation

### Title
Verify component shows all pages without ellipsis for ≤7 pages

### Preconditions
- Multiple component instances with different max-pages values

### Steps
1. Test with `max-pages="7"`: Observe display
2. Test with `max-pages="8"`: Observe display
3. Test with `max-pages="6"`: Observe display

### Expected Result - 7 Pages or Fewer
- For `max-pages="7"` (or less): All pages shown, no ellipsis
- Example with 7 pages at page 4: `< 1 2 3 [4] 5 6 7 >`

### Expected Result - 8 Pages or More
- For `max-pages="8"` (or more): Ellipsis logic applies
- Example with 8 pages at page 1: `< [1] 2 3 ... 8 >`
- Example with 8 pages at page 4: `< 1 2 3 [4] 5 6 ... 8 >`
- Example with 8 pages at page 5: `< 1 ... 3 4 [5] 6 7 8 >`

### Notes
- The threshold is calculated as: `delta * 2 + 1 + 2 = 2*2 + 1 + 2 = 7`
- This means 7 pages or fewer will always show all pages

---

## Edge Cases and Additional Validation

### Invalid Attribute Values
Test the component's behavior with invalid or missing attributes:

1. **Missing max-pages**: `page="5"` with no `max-pages` attribute
   - Expected: Defaults to 1 page, showing `< [1] >`

2. **Zero or negative page**: `page="0"` or `page="-1"` and `max-pages="10"`
   - Expected: Should default to page 1

3. **Page exceeds max-pages**: `page="15"` and `max-pages="10"`
   - Expected: Component shows page 15 as current, but navigation should prevent going beyond boundaries

### Dynamic Attribute Updates
Test that the component re-renders when attributes change:

1. Start with `page="5"` and `max-pages="10"`
2. Update `page` attribute to "8" via JavaScript
3. Expected: Display updates to show page 8 as current

### Rapid Clicking
Test the component's behavior with rapid user interactions:

1. Rapidly click the Next (`>`) arrow multiple times
2. Expected: Each click fires a separate `page-shift` event with incremented page numbers
3. Note: The parent application is responsible for rate limiting or debouncing

---

## Summary

This test document covers all major functionality of the `<paginate-control>` component:
- ✅ Single page display
- ✅ Small pagination (≤7 pages, all shown)
- ✅ Large pagination with smart ellipsis (left, right, both sides)
- ✅ Navigation via Previous/Next arrows
- ✅ Disabled states on first/last pages
- ✅ Page number click navigation
- ✅ Boundary validation (delta = 2)
- ✅ Ellipsis threshold validation
- ✅ Edge cases and invalid inputs

All tests should verify that the `page-shift` custom event is properly fired with the correct page number in the `detail` object, and that the event bubbles and is composed for use across shadow DOM boundaries.
