# Favorites Feature Documentation

## Feature Overview

The Favorites Feature allows users to save and quickly access their preferred trading strategies, providing a streamlined experience for managing frequently used strategies. This feature enhances user engagement and workflow efficiency by enabling persistent strategy selection across sessions.

### Key Benefits
- **Quick Access**: Instant access to preferred strategies without searching
- **Persistent Selection**: User preferences saved across sessions
- **Multiple Favorites**: Support for saving multiple strategies
- **Seamless Integration**: Works seamlessly with existing strategy management system

---

## How It Works

The Favorites Feature operates through a 4-step process:

### Step 1: Strategy Selection
Users can mark any strategy as a favorite by clicking the "Add to Favorites" button in the strategy detail view. This action saves the strategy ID to the user's favorites collection in the database.

### Step 2: Database Storage
Favorites are stored in the `favorite_strategies` table with a composite unique constraint:
- `user_id` (foreign key referencing users table)
- `strategy_id` (foreign key referencing strategies table)

This ensures each user can save a strategy only once, preventing duplicates.

### Step 3: UI Integration
The user interface is enhanced with:
- **Star Icons**: Visual indicators showing whether a strategy is favorited
- **Favorites List**: Dedicated section showing all favorited strategies
- **Quick Actions**: Ability to remove favorites directly from the UI

### Step 4: Strategy Auto-Selection
When users return to the application, their previously favorited strategies are automatically highlighted, providing immediate access to their most important trading strategies.

---

## Data Model

### Database Schema

The `favorite_strategies` table implements the following structure:

```typescript
// src/db/schemas/favorite-strategies.ts
import { integer, text, timestamp } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { users } from './auth-schema';
import { strategies } from './backtestStats';

export const favoriteStrategies = pgTable('favorite_strategies', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('user_id').notNull().references(() => users.id),
  strategyId: integer('strategy_id').notNull().references(() => strategies.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});
```

### Composite Unique Key Constraint

```sql
-- Database-level constraint enforced at schema level
CREATE UNIQUE INDEX favorite_strategies_user_strategy_idx
ON favorite_strategies (user_id, strategy_id);
```

### Relationships
- **One-to-Many**: Users can have multiple favorite strategies
- **Many-to-One**: Each favorite strategy belongs to one user
- **Strategy Reference**: Foreign key links to the strategies table for detailed strategy information

---

## API Endpoints Reference

### Backend API Integration

The favorites feature integrates with the Okane Finance API through the following endpoints:

#### Get User Favorites
```typescript
// GET /api/favorites
// Returns all favorited strategies for the authenticated user
```

#### Add Favorite
```typescript
// POST /api/favorites/{strategyId}
// Adds a strategy to user's favorites
```

#### Remove Favorite
```typescript
// DELETE /api/favorites/{strategyId}
// Removes a strategy from user's favorites
```

#### Check Favorite Status
```typescript
// GET /api/favorites/{strategyId}/status
// Returns whether a specific strategy is in user's favorites
```

### Client-Side API Integration

The frontend uses the auto-generated API client (`@/lib/okane-finance-api/generated`):

```typescript
import { getOkaneClient } from '@/lib/okane-finance-api/okane-client';

const okaneClient = getOkaneClient();

// Get user favorites
const favorites = await okaneClient.getUserFavorites();

// Add favorite
await okaneClient.addFavorite(strategyId);

// Remove favorite
await okaneClient.removeFavorite(strategyId);

// Check favorite status
const isFavorite = await okaneClient.getFavoriteStatus(strategyId);
```

---

## Components List

### Core Components

#### 1. FavoriteButton
- **Location**: `src/components/strategy/FavoriteButton.tsx`
- **Purpose**: Star icon component for adding/removing favorites
- **Features**:
  - Toggle functionality
  - Visual state indication
  - Tooltip for action feedback

#### 2. FavoritesList
- **Location**: `src/components/strategy/FavoritesList.tsx`
- **Purpose**: Display all favorited strategies for current user
- **Features**:
  - Grid layout for strategy cards
  - Quick removal actions
  - Empty state handling

#### 3. StrategyCardFavorite
- **Location**: `src/components/strategy/StrategyCardFavorite.tsx`
- **Purpose**: Enhanced strategy card with favorite functionality
- **Features**:
  - Integrated favorite button
  - Favorite status indicator
  - Strategy metadata display

#### 4. FavoritesProvider
- **Location**: `src/components/strategy/FavoritesProvider.tsx`
- **Purpose**: Context provider for favorite state management
- **Features**:
  - Global favorite state
  - Cache invalidation on changes
  - Optimistic updates

### Supporting Components

#### 5. HeaderFavoriteIndicator
- **Location**: `src/components/Header.tsx`
- **Purpose**: Shows count of favorited strategies in navigation
- **Features**: Badge with favorite count

#### 6. FavoritesPage
- **Location**: `src/routes/strategy/favorites.tsx`
- **Purpose**: Dedicated favorites management page
- **Features**:
  - All favorites overview
  - Bulk actions support
  - Search and filtering

---

## Future Enhancements Roadmap

### Phase 1: Core Functionality (Complete)
- ✅ Basic favorite/unfavorite functionality
- ✅ Database persistence
- ✅ UI integration with existing strategy components
- ✅ API endpoint integration

### Phase 2: Enhanced User Experience (Planned)
- [ ] **Favorite Categories**: Organize favorites into custom categories (e.g., "Day Trading", "Swing Trading", "Long-term")
- [ ] **Favorite Notes**: Add personal notes to favorited strategies
- [ ] **Strategy Performance Tracking**: Track performance of favorited strategies
- [ ] **Bulk Operations**: Select multiple strategies for batch favorite actions

### Phase 3: Advanced Features (Future)
- [ ] **Smart Recommendations**: AI-powered strategy recommendations based on favorites
- [ ] **Favorite Sharing**: Share favorite strategies with other users
- [ ] **Strategy Templates**: Save favorited strategies as templates for new strategies
- [ ] **Performance Analytics**: Detailed analytics on favorite strategy usage and performance

### Phase 4: Integration Enhancements (Future)
- [ ] **Mobile App Support**: Sync favorites across mobile applications
- [ ] **Webhook Integration**: Notifications when favorited strategies are updated
- [ ] **Export/Import**: Backup and restore favorite collections
- [ ] **API Integration**: Connect with external trading platforms

---

## Technical Considerations

### Performance Optimization
- Database queries optimized with proper indexing on user_id and strategy_id
- Client-side caching to minimize API calls
- Debounced favorite/unfavorite actions to prevent excessive API calls

### Security
- Authentication required for all favorite operations
- Proper input validation and sanitization
- Rate limiting to prevent abuse

### Scalability
- Designed to handle large numbers of users and strategies
- Efficient database queries for favorite lookups
- Optimistic updates for responsive UI

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast visual indicators
- Proper ARIA labels for favorite actions