# DECISIONS.md

## General Solution Approach

The solution was designed as a **fullstack application** with clear separation between backend and frontend, following the **REST API** pattern for communication between both layers.

### Architecture
- **Backend (NestJS)**: Processes data from the mock JSON, calculates the "Hype Level" according to business rules, and exposes a REST endpoint.
- **Frontend (React + TypeScript)**: Consumes the API, renders the user interface with loading/error states, and visually highlights "The Crown Jewel".

### Data Flow
1. Backend reads the `videos.mock.json` file (simulating YouTube's response)
2. Transforms each video by applying business rules (Hype, relative dates)
3. Identifies "The Crown Jewel" (highest Hype from the complete dataset)
4. Exposes data through `/api/videos` with support for search, sorting, and pagination
5. Frontend consumes this endpoint and renders the billboard

---

## Main Technical Decisions

### Backend (NestJS)

#### 1. Hype Level Calculation
**Implementation:** `hype-calculator.util.ts`

```typescript
// Base formula: (likes + comments) / views
let hype = (likes + comments) / views;

// x2 multiplier if title contains "tutorial" (case-insensitive)
if (snippet.title.toLowerCase().includes('tutorial')) {
  hype *= 2;
}
```

**Key decisions:**
- **Disabled comments rule as maximum priority**: If `commentCount` is `undefined` or `null`, returns `0` immediately, regardless of other conditions (even if title has "Tutorial")
- **Views validation**: If `views <= 0`, returns `0` to avoid division by zero or infinite results
- **Case-insensitive matching**: Using `.toLowerCase()` to detect "Tutorial", "TUTORIAL", "tUtOriAl", etc.
- **Normalized numeric values**: Explicit conversion to `Number()` to ensure correct arithmetic operations

#### 2. Date Transformation (Without Libraries)
**Implementation:** `relative-date.util.ts`

**Approach:**
- Manual calculation of differences in seconds between `now` and `publishedAt`
- Selection of the **largest unit** that fits the range (years > months > days > hours > minutes > seconds)
- Manual pluralization in Spanish ("1 día" vs "5 días")

```typescript
const UNITS = [
  { seconds: 31536000, singular: 'año', plural: 'años' },   // 365 * 24 * 60 * 60
  { seconds: 2592000,  singular: 'mes', plural: 'meses' },  // 30 * 24 * 60 * 60
  { seconds: 86400,    singular: 'día', plural: 'días' },   // 24 * 60 * 60
  // ...
];
```

**Key decisions:**
- **No external dependencies**: Strictly complies with "don't use date libraries" restriction
- **Edge case handling**:
  - Differences < 5 seconds → "Hace un momento"
  - Invalid dates → "Fecha desconocida"
- **Adaptive precision**: Shows "Hace 1 hora" instead of "Hace 90 minutos" (chooses the most significant unit)
- **Testable**: Accepts optional `now` parameter to facilitate testing with controlled dates

#### 3. "Crown Jewel" Identification
**Logic:** `videos.service.ts` → `pickCrownJewelId()` method

**Important decision:**
- The Jewel is chosen from the **complete dataset** (before filtering/pagination)
- This ensures the video with the highest global Hype is always shown, regardless of applied filters
- Videos with `hypeLevel <= 0` are automatically disqualified

#### 4. Backend Architecture
**Pattern:** Controller-Service

```
VideosController → VideosService → Utilities
     ↓                  ↓              ↓
  Validation      Business logic    Pure
  of params                       calculations
```

**Decisions:**
- **Robust query param validation**: Manual parsing with defaults and limits (e.g., max `limit` of 50)
- **Separation of concerns**:
  - Controller: HTTP validation, parameter parsing
  - Service: business logic, data transformation
  - Utils: pure and reusable functions
- **Swagger documentation**: `/api/docs` endpoint to explore the API interactively
- **CORS configured**: Allows requests from `localhost:*` for local development

---

### Frontend (React + TypeScript)

#### 1. State Management and Data Fetching
**Tool:** TanStack Query (React Query)

**Decisions:**
- **Smart caching**: `staleTime: 30_000` (30 seconds) to avoid unnecessary re-fetches
- **Granular states**: Separate handling of `isLoading`, `isError`, `isFetching` for precise UX
- **Manual refetch**: "Retry" button in error view

```typescript
const query = useVideos({
  search, sortBy, order, page, limit: PAGE_SIZE
});
```

#### 2. "Crown Jewel" Design 
**Component:** `joya-card.tsx`

**Visual differentiation implemented:**
- **Featured layout**: 2-column grid on desktop (image + info), takes more space than normal cards
- **Unique visual effects**:
  - 2px golden border (`border-amber-400`)
  - Custom shadow with amber glow (`shadow-[0_0_0_4px_rgba(245,158,11,0.15)]`)
  - Radial gradient background with 15% opacity
  - Golden ring with `ring-amber-400/40`
- **Distinctive badge**: "La Joya de la Corona" with crown icon (`<Crown />`)
- **Progress animation**: Hype level animates from 0 to its actual value on render
- **Featured typography**: Title in 3xl/4xl (vs 1xl in normal cards)

#### 3. Loading and Error State Handling

**Implemented states:**

| State | Condition | View |
|-------|-----------|------|
| `isInitialLoading` | First load | Skeleton loaders |
| `isError` | Fetch failure | Alert with message + retry button |
| `isEmpty` | No results | Card with friendly message |
| `isSuccess` | Data loaded | Jewel + Video grid |
| `isFetching` | Background refetch | Reduced opacity (70%) |

**Key decision:** Non-blocking UX during refetch (content remains visible with lowered opacity)

#### 4. Implemented Features

**Search:**
- Input with implicit debounce (controlled by React re-render)
- Searches in `title` and `author` (case-insensitive on backend)
- Resets pagination to page 1 when searching

**Sorting:**
- 4 criteria: Hype, Published Date, Title, Author
- ASC/DESC toggle with visual indicator
- Disabled when no criterion is selected

**Pagination:**
- 9 videos per page
- Prev/Next controls with disable at limits
- Visual indicator of current page

#### 5. URL Persistence
**Custom hook:** `useSearchParams`

**Decision:** All filters are reflected in the URL query string:
```
?search=tutorial&sortBy=hypeLevel&order=desc&page=2
```

**Benefits:**
- Shareable URLs with complete state
- Browser navigation (back/forward) works correctly
- Refresh maintains applied filters

---

**Organization decisions:**
- Monorepo-style with independent folders (not Nx/Turborepo for simplicity)
- Each layer has its own `package.json` and can run independently
- Tests alongside code (co-location for better maintainability)
- Pure utilities in `/utils` folders (easily testable and reusable)

---

## Assumptions and Simplifications

### Assumptions
1. **Valid data**: Assumes mock JSON has correct structure (no validation with Zod/class-validator)
2. **Development environment**: CORS only allows `localhost:*` (production would require additional configuration)
3. **No authentication**: Public endpoint without JWT/API keys
4. **Static data**: Mock is read from disk on each request (production would use database)

### Simplifications
1. **No persistence**: No database; data lives in memory/file
2. **No rate limiting**: Endpoint without throttling or DDoS protection
3. **Basic error handling**: Generic HTTP errors (no custom error codes per failure type)
4. **No internationalization**: Everything hardcoded in Spanish
5. **No E2E tests**: Only unit tests (no Cypress/Playwright)

---

## ⚠️ Problems Encountered and Solutions

### 1. Division by zero in Hype calculation
**Problem:** Videos with 0 views caused `Infinity` or `NaN`

**Solution:**
```typescript
if (!Number.isFinite(views) || views <= 0) {
  return 0;
}
```

### 2. "Tutorial" not detected in uppercase
**Problem:** Initial test used `title.includes('tutorial')` (case-sensitive)

**Solution:**
```typescript
snippet.title.toLowerCase().includes('tutorial')
```

### 3. Jewel changed when paginating/filtering
**Problem:** Jewel was chosen AFTER filtering, causing it to change by page

**Solution:** Move `pickCrownJewelId()` before `applyFilter()` in service:
```typescript
const crownJewelId = this.pickCrownJewelId(enriched);  // BEFORE filtering
const filtered = this.applyFilter(enriched, query.search);
```

### 4. Future dates showed negative values
**Problem:** Videos with `publishedAt` in the future generated texts like "Hace -5 días"

**Solution:** Validation in `toRelativeSpanish()`:
```typescript
if (diffSeconds < 5) {
  return 'Hace un momento';  // Also handles cases < 0
}
```

### 5. Duplicate query params in URL
**Problem:** When changing filters, parameters accumulated in URL

**Solution:** `patchParams()` function that cleans null/empty values:
```typescript
if (v === null || v === '') next.delete(k)
else next.set(k, v)
```

### 6. Excessive re-renders on search
**Problem:** Each keystroke in input caused a new fetch

**Solution:** React Query already does implicit debouncing with `staleTime`, but also added:
```typescript
const query = useVideos({ search, ... });  // Re-fetch only when search changes
```

---

##  Use of AI Tools

### Documentation and Concept Understanding
- _"Explain best practices for structuring a NestJS service with data transformation"_
- _"How to calculate time differences in native JavaScript without using moment.js or date-fns?"_
- _"Differences between React Query and SWR for data fetching"_
- _"What's better for query param validation in NestJS: Pipes or manual validation?"_

### UI and Component Design
- _"Ideas to visually highlight a 'hero' element in a card grid with Tailwind CSS"_
- _"How to create a realistic skeleton loader in React with Tailwind"_
- _"Best practices for progress animations with CSS/Tailwind"_
- _"Color palette for dark/light theme that works well for highlighting a golden element"_

### Debugging and Optimization
- _"Why does my Hype calculation return NaN on some videos"_ → Led to discovering the division by zero problem
- _"React Query refetches on every render, how to optimize?"_ → `staleTime` configuration
- _"CORS error in NestJS when fetching from React"_ → Correct `enableCors()` configuration

### Testing
- _"How to test utilities that depend on Date.now() in Jest"_ → Led to injecting `now` as parameter
- _"Strategies for testing data transformations without mocking everything"_ → Tests with builders (`buildItem()`)

**Approach:** AI as **documentation and debugging assistant**

---

##  Final Notes

### Solution Highlights
1. **Strict compliance with requirements**: All business rules implemented exactly as specified
2. **Robust testing**: Unit tests for critical logic (Hype, dates, controller)
3. **Careful UX**: Loading/error states, animations, visual feedback
4. **Clean code**: Separation of concerns, pure functions, descriptive naming
5. **Inline documentation**: Comments where logic isn't obvious

### Future Improvements (Out of Scope)
- Implement Redis caching to improve performance
- Add DTO validation with `class-validator`
- E2E tests with Cypress
- Deployment on Vercel (frontend) + Railway (backend)
- Implement infinite scroll instead of traditional pagination
- Add filters by date range or author

---

**Built with:** NestJS, React, TypeScript, TanStack Query, Tailwind CSS, shadcn/ui  
**Delivery date:** April 2026
