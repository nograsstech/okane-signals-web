# Favorite Strategies Feature - Design Specification

**Date:** 2026-03-28
**Status:** Approved
**Author:** Design Phase
**Jira Ticket:** TBD

## Overview

Add a user favorites system for trading strategies, allowing users to mark strategy configurations as favorites and access them quickly through a dedicated favorites section and filter functionality.

## Requirements

### Functional Requirements

1. **Favorite Configuration Storage**
   - Users can favorite strategy configurations (ticker + strategy + period + interval)
   - Favorites are independent of specific backtest runs - always show the latest backtest for that configuration
   - No limit on the number of favorites a user can have
   - Favorites persist across sessions

2. **UI Display**
   - Dedicated "My Favorites" section at the top of the strategy list page
   - Favorites displayed as cards in a grid layout showing key metrics
   - "Favorites Only" filter button on the main strategy table
   - Heart icon column in the table for quick favorite/unfavorite toggle

3. **Customization**
   - Sort favorites by: Win Rate, Return %, Sharpe Ratio, Recently Added, Name
   - Group favorites by: Ticker, Strategy Type, Period (Phase 2 - not in MVP)
   - Sort preferences persist in localStorage

### Non-Functional Requirements

- Optimistic UI updates with rollback on error
- Graceful degradation if favorites API fails
- Responsive design for mobile and desktop
- Accessible keyboard navigation and screen reader support

## Architecture

### Database Schema

**New Table: `user_favorite_strategies`**

```typescript
export const userFavoriteStrategies = pgTable(
  "user_favorite_strategies",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    ticker: text("ticker").notNull(),
    strategy: text("strategy").notNull(),
    period: text("period").notNull(),
    interval: text("interval").notNull(),
    notes: text("notes"), // Optional user notes (Phase 2)
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_user_favorites").on(table.userId),
    index("idx_unique_favorite").on(table.userId, table.ticker, table.strategy, table.period, table.interval),
  ]
);
```

**Key Design Decisions:**
- Separate table keeps favorites independent of backtest_stats (which can be deleted)
- Composite unique index prevents duplicate favorites for same configuration
- Cascade delete if user is deleted
- Notes field reserved for future customization

### API Endpoints

**GET /api/user/favorites**
- Returns list of user's favorite configurations
- Response: `[{ ticker, strategy, period, interval, createdAt }]`

**POST /api/user/favorites**
- Body: `{ ticker, strategy, period, interval }`
- Creates favorite if not exists (idempotent)
- Returns: created favorite record

**DELETE /api/user/favorites**
- Query params: `ticker`, `strategy`, `period`, `interval`
- Removes favorite
- Returns: success message

### Data Flow

```
1. Load favorites on mount
   GET /api/user/favorites → returns list of configs

2. Fetch latest backtest for each favorite
   Use existing /api/strategy endpoint with dedup index
   (ticker, strategy, period, interval, created_at DESC)

3. Toggle favorite
   POST /api/user/favorites (add)
   DELETE /api/user/favorites (remove)
   → Optimistic UI update, rollback on error

4. Filter by favorites
   Client-side filter on table data using favorites list
```

## UI Components

### 1. FavoriteCards Section

**Location:** Top of `/routes/strategy/index.tsx`

**Layout:**
- Section header: "⭐ My Favorites (3)"
- Sort/Group controls dropdowns
- Grid of favorite cards (4 columns on desktop, 2 on tablet, 1 on mobile)

**Card Content:**
- Strategy name and ticker
- Heart icon (unfavorite button)
- Key metrics: Win Rate, Return %
- Optional: Sharpe Ratio, Trade Count (depending on space)

**States:**
- Loading: Skeleton cards
- Empty: "No favorites yet. Heart strategies you want to track."
- Populated: Grid of cards
- Error: "Unable to load favorites" with retry button

### 2. FavoriteToggle Column

**Location:** New column in StrategyTable, after "Notifications" column

**Behavior:**
- Heart icon: ❤️ (filled) or 🤍 (outline)
- Click to toggle favorite status
- Optimistic update with animation
- Rollback on error with toast notification

### 3. Filter Button

**Location:** Above strategy table, next to existing filters

**States:**
- "All Strategies" (default, dimmed)
- "❤️ Favorites Only" (active, highlighted)

**Behavior:**
- Client-side filter: shows only rows matching favorite configs
- Persists state in URL search params (?favorites=true)

## Implementation Order

### Phase 1: Database & API
1. Create `src/db/schemas/userFavoriteStrategies.ts`
2. Generate migration: `bun db:generate`
3. Run migration: `bun db:migrate`

### Phase 2: API Endpoints
1. Create `src/routes/api/user/favorites/index.ts`
2. Implement GET, POST, DELETE handlers
3. Test with authentication middleware

### Phase 3: React Query Integration
1. Create `src/hooks/use-favorites.ts`
2. Implement `useFavorites` query
3. Implement `useFavoriteToggle` mutation with optimistic updates

### Phase 4: UI Components
1. Create `src/components/favorite/favorite-toggle.tsx`
2. Create `src/components/favorite/favorite-cards.tsx`
3. Create `src/components/favorite/favorite-section.tsx`

### Phase 5: Integration
1. Add Favorite column to StrategyTable
2. Add FavoriteSection to strategy list page
3. Add filter button and filter logic

### Phase 6: Polish
1. Implement sorting functionality
2. Add loading and error states
3. Add animations and transitions
4. Write tests

## Testing Strategy

### Database Tests
- Unique constraint prevents duplicate favorites
- Cascade delete when user deleted
- Concurrent favorite/unfavorite operations

### API Tests
- GET returns only user's favorites
- POST creates favorite, validates params
- DELETE removes favorite, validates ownership
- Authentication required on all endpoints

### Component Tests
- FavoriteToggle: toggle updates state, calls API
- FavoriteCards: renders loading, empty, populated states
- Filter button: toggles between views
- Sort controls: update card arrangement

### Integration Tests
- Favorite configuration matches latest backtest
- Deleting backtest doesn't delete favorite
- Notification and favorite toggles work independently

## Error Handling

### Toggle Favorite Failures
- Optimistic UI update (heart fills immediately)
- On error: rollback state, show toast
- Retry: user can click again

### Loading Favorites
- Show skeleton loading state
- On error: show message with retry button
- Graceful degradation: main table still works

### Stale Favorites
- Backtest deleted but favorite remains
- Show "No recent data" state on card
- Option to unfavorite
- Don't auto-delete (user's choice)

## Scope

### In MVP (Phase 1)
- Database table and migration
- API endpoints (GET, POST, DELETE)
- Favorite toggle in table
- Favorites section at top
- "Favorites Only" filter button
- Client-side sorting (win rate, return, name)
- Optimistic UI updates
- Persist sort preference

### Future Enhancements (Phase 2+)
- Grouping by ticker/strategy/period
- User notes on favorites
- Favorites performance tracking
- Notifications when favorites update
- Export/import favorites
- Favorite folders/tags

## Success Criteria

- Users can favorite/unfavorite strategies with one click
- Favorites section displays at top of page
- Filter button shows only favorite strategies
- Optimistic updates feel instant
- No data loss on API failures
- Works on mobile and desktop
- All tests passing

## Dependencies

- Better Auth (already configured)
- Drizzle ORM (already configured)
- React Query (already configured)
- Existing `/api/strategy` endpoint

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Many favorites slow down page load | Paginate favorites section, lazy load backtest data |
| Users confused by stale favorites | Clear "No recent data" message with unfavorite option |
| Sort/group logic complex | Keep it client-side for MVP, optimize later |

## Open Questions

None at this time.

## References

- Existing strategy table: `src/components/strategy/strategy-table.tsx`
- Notification toggle pattern: `src/hooks/use-notification-toggle.ts`
- Better Auth docs: Available via MCP
