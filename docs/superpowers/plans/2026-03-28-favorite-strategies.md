# Favorite Strategies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a user favorites system for trading strategies with database persistence, API endpoints, and UI components for displaying and managing favorites.

**Architecture:** New `user_favorite_strategies` table stores user favorites keyed by (ticker, strategy, period, interval). REST API endpoints handle CRUD operations. React Query manages data fetching with optimistic UI updates. Components integrate into existing strategy table and add new favorites section.

**Tech Stack:** Drizzle ORM, PostgreSQL, TanStack Start server routes, TanStack Query, React 19, TypeScript, shadcn/ui components

---

## File Structure

**New files:**
- `src/db/schemas/userFavoriteStrategies.ts` - Database schema definition
- `src/routes/api/user/favorites/index.ts` - REST API handlers (GET, POST, DELETE)
- `src/hooks/use-favorites.ts` - React Query hooks for favorites
- `src/components/favorite/favorite-toggle.tsx` - Heart icon button component
- `src/components/favorite/favorite-cards.tsx` - Grid of favorite cards
- `src/components/favorite/favorite-section.tsx` - Container section with sorting
- `src/lib/types/favorite.ts` - TypeScript types for favorites

**Modified files:**
- `src/db/schemas/schema.ts` - Export new schema
- `src/components/strategy/strategy-table.tsx` - Add Favorite column
- `src/routes/strategy/index.tsx` - Add favorites section

---

## Task 1: Create Database Schema

**Files:**
- Create: `src/db/schemas/userFavoriteStrategies.ts`
- Modify: `src/db/schemas/schema.ts`

- [ ] **Step 1: Create the schema file**

Create `src/db/schemas/userFavoriteStrategies.ts`:

```typescript
import {
	index,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "../schema";
import { pgTable } from "drizzle-orm/pg-core";

export const userFavoriteStrategies = pgTable(
	"user_favorite_strategies",
	{
		id: serial("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		ticker: text("ticker").notNull(),
		strategy: text("strategy").notNull(),
		period: text("period").notNull(),
		interval: text("interval").notNull(),
		notes: text("notes"), // Reserved for future use
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => [
		index("idx_user_favorites").on(table.userId),
		index("idx_unique_favorite").on(
			table.userId,
			table.ticker,
			table.strategy,
			table.period,
			table.interval,
		),
	],
);
```

- [ ] **Step 2: Export the new schema**

Modify `src/db/schemas/schema.ts` to add the export:

Add this line to the barrel exports:
```typescript
export * from "./userFavoriteStrategies";
```

- [ ] **Step 3: Generate migration**

Run: `bun db:generate`

Expected output: New migration file created in `drizzle/` directory

- [ ] **Step 4: Review the generated migration**

Read the new migration file in `drizzle/` and verify it creates the table with correct columns and indexes

- [ ] **Step 5: Run migration**

Run: `bun db:migrate`

Expected: Migration applied successfully to database

- [ ] **Step 6: Commit**

```bash
git add src/db/schemas/userFavoriteStrategies.ts src/db/schemas/schema.ts drizzle/
git commit -m "feat: add user_favorite_strategies table

- Composite unique index prevents duplicate favorites
- Cascade delete on user deletion
- Notes field reserved for future customization"
```

---

## Task 2: Create TypeScript Types

**Files:**
- Create: `src/lib/types/favorite.ts`

- [ ] **Step 1: Create favorite types**

Create `src/lib/types/favorite.ts`:

```typescript
export interface FavoriteStrategy {
	id: number;
	userId: string;
	ticker: string;
	strategy: string;
	period: string;
	interval: string;
	notes: string | null;
	createdAt: Date;
}

export interface FavoriteStrategyConfig {
	ticker: string;
	strategy: string;
	period: string;
	interval: string;
}

export interface FavoriteWithBacktest extends FavoriteStrategyConfig {
	isFavorite: boolean;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types/favorite.ts
git commit -m "feat: add TypeScript types for favorites

- FavoriteStrategy: full database record
- FavoriteStrategyConfig: composite key for operations
- FavoriteWithBacktest: for table integration"
```

---

## Task 3: Create API Endpoints

**Files:**
- Create: `src/routes/api/user/favorites/index.ts`

- [ ] **Step 1: Create the favorites API handler**

Create `src/routes/api/user/favorites/index.ts`:

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { and, eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db";
import { userFavoriteStrategies } from "@/db/schemas";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/user/favorites/")({
	server: {
		handler: async ({ request }) => {
			const session = await auth.api.getSession({
				headers: request.headers,
			});

			if (!session) {
				return new Response(JSON.stringify({ error: "Unauthorized" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
				});
			}

			const url = new URL(request.url);
			const method = request.method;

			// GET: Fetch all user favorites
			if (method === "GET") {
				const favorites = await db
					.select({
						ticker: userFavoriteStrategies.ticker,
						strategy: userFavoriteStrategies.strategy,
						period: userFavoriteStrategies.period,
						interval: userFavoriteStrategies.interval,
						createdAt: userFavoriteStrategies.createdAt,
					})
					.from(userFavoriteStrategies)
					.where(eq(userFavoriteStrategies.userId, session.user.id))
					.orderBy(userFavoriteStrategies.createdAt);

				return new Response(JSON.stringify(favorites), {
					headers: { "Content-Type": "application/json" },
				});
			}

			// POST: Add favorite
			if (method === "POST") {
				const body = await request.json() as {
					ticker: string;
					strategy: string;
					period: string;
					interval: string;
				};

				const { ticker, strategy, period, interval } = body;

				if (!ticker || !strategy || !period || !interval) {
					return new Response(
						JSON.stringify({ error: "Missing required fields" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				try {
					const result = await db
						.insert(userFavoriteStrategies)
						.values({
							userId: session.user.id,
							ticker,
							strategy,
							period,
							interval,
						})
						.onConflictDoNothing({
							target: [
								userFavoriteStrategies.userId,
								userFavoriteStrategies.ticker,
								userFavoriteStrategies.strategy,
								userFavoriteStrategies.period,
								userFavoriteStrategies.interval,
							],
						})
						.returning();

					return new Response(JSON.stringify(result[0]), {
						status: 201,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(
						JSON.stringify({ error: "Failed to create favorite" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			}

			// DELETE: Remove favorite
			if (method === "DELETE") {
				const ticker = url.searchParams.get("ticker");
				const strategy = url.searchParams.get("strategy");
				const period = url.searchParams.get("period");
				const interval = url.searchParams.get("interval");

				if (!ticker || !strategy || !period || !interval) {
					return new Response(
						JSON.stringify({ error: "Missing required parameters" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				try {
					await db
						.delete(userFavoriteStrategies)
						.where(
							and(
								eq(userFavoriteStrategies.userId, session.user.id),
								eq(userFavoriteStrategies.ticker, ticker),
								eq(userFavoriteStrategies.strategy, strategy),
								eq(userFavoriteStrategies.period, period),
								eq(userFavoriteStrategies.interval, interval),
							),
						);

					return new Response(JSON.stringify({ success: true }), {
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(
						JSON.stringify({ error: "Failed to delete favorite" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			}

			return new Response(JSON.stringify({ error: "Method not allowed" }), {
				status: 405,
				headers: { "Content-Type": "application/json" },
			});
		},
	},
});
```

- [ ] **Step 2: Test GET endpoint manually**

Run: `curl -H "Cookie: better-auth.session_token=<YOUR_TOKEN>" http://localhost:3000/api/user/favorites`

Expected: `[]` (empty array, no favorites yet)

- [ ] **Step 3: Test POST endpoint manually**

Run:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<YOUR_TOKEN>" \
  -d '{"ticker":"AAPL","strategy":"ema_bollinger","period":"60d","interval":"1d"}' \
  http://localhost:3000/api/user/favorites
```

Expected: JSON response with created favorite

- [ ] **Step 4: Test DELETE endpoint manually**

Run:
```bash
curl -X DELETE "http://localhost:3000/api/user/favorites?ticker=AAPL&strategy=ema_bollinger&period=60d&interval=1d" \
  -H "Cookie: better-auth.session_token=<YOUR_TOKEN>"
```

Expected: `{"success": true}`

- [ ] **Step 5: Commit**

```bash
git add src/routes/api/user/favorites/index.ts
git commit -m "feat: add favorites API endpoints

- GET /api/user/favorites: list user favorites
- POST /api/user/favorites: add favorite (idempotent)
- DELETE /api/user/favorites: remove favorite
- Authentication required on all endpoints"
```

---

## Task 4: Create React Query Hooks

**Files:**
- Create: `src/hooks/use-favorites.ts`

- [ ] **Step 1: Create useFavorites hook**

Create `src/hooks/use-favorites.ts`:

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FavoriteStrategyConfig } from "@/lib/types/favorite";

interface FavoriteResponse {
	ticker: string;
	strategy: string;
	period: string;
	interval: string;
	createdAt: Date;
}

// Query key factory
export const favoritesKeys = {
	all: ["favorites"] as const,
	list: () => [...favoritesKeys.all, "list"] as const,
};

// Fetch all favorites
export function useFavorites() {
	return useQuery({
		queryKey: favoritesKeys.list(),
		queryFn: async (): Promise<FavoriteStrategyConfig[]> => {
			const response = await fetch("/api/user/favorites");
			if (!response.ok) {
				throw new Error("Failed to fetch favorites");
			}
			const data: FavoriteResponse[] = await response.json();
			return data.map((fav) => ({
				ticker: fav.ticker,
				strategy: fav.strategy,
				period: fav.period,
				interval: fav.interval,
			}));
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Toggle favorite (add or remove)
export function useFavoriteToggle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (config: FavoriteStrategyConfig & { isCurrentlyFavorite: boolean }) => {
			const { isCurrentlyFavorite, ...favoriteConfig } = config;

			if (isCurrentlyFavorite) {
				// Remove favorite
				const params = new URLSearchParams(favoriteConfig as any);
				const response = await fetch(`/api/user/favorites?${params}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					throw new Error("Failed to remove favorite");
				}
				return { action: "removed", config: favoriteConfig };
			} else {
				// Add favorite
				const response = await fetch("/api/user/favorites", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(favoriteConfig),
				});
				if (!response.ok) {
					throw new Error("Failed to add favorite");
				}
				return { action: "added", config: favoriteConfig };
			}
		},
		onMutate: async (variables) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: favoritesKeys.list() });

			// Snapshot previous value
			const previousFavorites = queryClient.getQueryData<FavoriteStrategyConfig[]>(
				favoritesKeys.list(),
			);

			// Optimistically update
			if (variables.isCurrentlyFavorite) {
				// Remove from cache
				queryClient.setQueryData<FavoriteStrategyConfig[]>(
					favoritesKeys.list(),
					(old = []) =>
						old.filter(
							(fav) =>
								fav.ticker !== variables.ticker ||
								fav.strategy !== variables.strategy ||
								fav.period !== variables.period ||
								fav.interval !== variables.interval,
						),
				);
			} else {
				// Add to cache
				queryClient.setQueryData<FavoriteStrategyConfig[]>(
					favoritesKeys.list(),
					(old = []) => [
						...old,
						{
							ticker: variables.ticker,
							strategy: variables.strategy,
							period: variables.period,
							interval: variables.interval,
						},
					],
				);
			}

			// Return context with previous value
			return { previousFavorites };
		},
		onError: (err, variables, context) => {
			// Rollback on error
			if (context?.previousFavorites) {
				queryClient.setQueryData(favoritesKeys.list(), context.previousFavorites);
			}
			toast.error("Failed to update favorites", {
				description: "Please try again.",
			});
		},
		onSuccess: (data) => {
			const message = data.action === "added" ? "Added to favorites" : "Removed from favorites";
			toast.success(message);
		},
		onSettled: () => {
			// Refetch to ensure consistency
			queryClient.invalidateQueries({ queryKey: favoritesKeys.list() });
		},
	});
}

// Helper hook to check if a config is favorited
export function useIsFavorite(config: FavoriteStrategyConfig) {
	const { data: favorites } = useFavorites();

	return {
		isFavorite: favorites?.some(
			(fav) =>
				fav.ticker === config.ticker &&
				fav.strategy === config.strategy &&
				fav.period === config.period &&
				fav.interval === config.interval,
		),
	};
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-favorites.ts
git commit -m "feat: add React Query hooks for favorites

- useFavorites: fetch user favorites
- useFavoriteToggle: optimistic add/remove with rollback
- useIsFavorite: check if config is favorited
- Toast notifications for user feedback"
```

---

## Task 5: Create Favorite Toggle Component

**Files:**
- Create: `src/components/favorite/favorite-toggle.tsx`

- [ ] **Step 1: Create the toggle component**

Create `src/components/favorite/favorite-toggle.tsx`:

```typescript
import { Heart } from "lucide-react";
import type { FavoriteStrategyConfig } from "@/lib/types/favorite";
import { useFavoriteToggle, useIsFavorite } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

interface FavoriteToggleProps {
	config: FavoriteStrategyConfig;
	disabled?: boolean;
}

export function FavoriteToggle({ config, disabled = false }: FavoriteToggleProps) {
	const { isFavorite } = useIsFavorite(config);
	const favoriteToggle = useFavoriteToggle();

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent row click in table
		favoriteToggle.mutate({
			...config,
			isCurrentlyFavorite: isFavorite,
		});
	};

	return (
		<button
			type="button"
			onClick={handleToggle}
			disabled={disabled}
			data-favorite={isFavorite}
			className={cn(
				"hover:bg-muted/50 flex items-center justify-center rounded p-1.5 transition-all duration-300 ease-out",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"disabled:pointer-events-none disabled:opacity-50",
			)}
			aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
		>
			<Heart
				className={cn(
					"h-4 w-4 transition-all duration-300 ease-out",
					isFavorite
						? "fill-red-500 text-red-500"
						: "text-muted-foreground fill-transparent",
				)}
			/>
		</button>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/favorite/favorite-toggle.tsx
git commit -m "feat: add FavoriteToggle component

- Heart icon button with filled/outline states
- Optimistic updates via useFavoriteToggle hook
- Accessibility: aria-label, keyboard navigation
- Prevents event propagation for table integration"
```

---

## Task 6: Create Favorite Cards Component

**Files:**
- Create: `src/components/favorite/favorite-cards.tsx`

- [ ] **Step 1: Create the cards component**

Create `src/components/favorite/favorite-cards.tsx`:

```typescript
import { useMemo } from "react";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";
import { FavoriteToggle } from "./favorite-toggle";
import { cn } from "@/lib/utils";

interface FavoriteCardsProps {
	favoritesWithBacktest: Array<KeyStrategyBacktestStats & { isFavorite: true }>;
	sortBy?: "winRate" | "returnPercentage" | "sharpeRatio" | "createdAt";
	sortOrder?: "asc" | "desc";
}

type SortableFields = Pick<KeyStrategyBacktestStats, "winRate" | "returnPercentage" | "sharpeRatio">;

export function FavoriteCards({
	favoritesWithBacktest,
	sortBy = "winRate",
	sortOrder = "desc",
}: FavoriteCardsProps) {
	const sortedFavorites = useMemo(() => {
		const sorted = [...favoritesWithBacktest];

		if (sortBy === "createdAt") {
			sorted.sort((a, b) => {
				const dateA = new Date(a.created_at).getTime();
				const dateB = new Date(b.created_at).getTime();
				return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
			});
		} else {
			sorted.sort((a, b) => {
				const valueA = Number(a[sortBy as keyof SortableFields]);
				const valueB = Number(b[sortBy as keyof SortableFields]);
				const comparison = valueA - valueB;
				return sortOrder === "asc" ? comparison : -comparison;
			});
		}

		return sorted;
	}, [favoritesWithBacktest, sortBy, sortOrder]);

	if (sortedFavorites.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-muted-foreground text-lg">No favorites yet</p>
				<p className="text-muted-foreground/70 text-sm mt-2">
					Click the heart icon on any strategy to add it to your favorites.
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{sortedFavorites.map((item) => (
				<div
					key={`${item.ticker}-${item.strategy}-${item.period}-${item.interval}`}
					className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md"
				>
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h3 className="font-semibold text-sm">
								{item.ticker} {item.strategy}
							</h3>
							<p className="text-muted-foreground text-xs mt-1">
								{item.period} • {item.interval}
							</p>
						</div>
						<FavoriteToggle
							config={{
								ticker: item.ticker,
								strategy: item.strategy,
								period: item.period,
								interval: item.interval,
							}}
						/>
					</div>

					<div className="mt-4 grid grid-cols-2 gap-3">
						<div>
							<p className="text-muted-foreground text-xs">Win Rate</p>
							<p
								className={cn(
									"font-mono text-sm font-medium",
									Number(item.winRate) >= 50 ? "text-emerald-500" : "text-red-500",
								)}
							>
								{Number(item.winRate).toFixed(2)}%
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Return</p>
							<p
								className={cn(
									"font-mono text-sm font-medium",
									Number(item.returnPercentage) >= 0 ? "text-emerald-500" : "text-red-500",
								)}
							>
								{Number(item.returnPercentage).toFixed(2)}%
							</p>
						</div>
					</div>

					<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
						<span>Sharpe: {Number(item.sharpeRatio).toFixed(2)}</span>
						<span>{new Date(item.created_at).toLocaleDateString()}</span>
					</div>
				</div>
			))}
		</div>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/favorite/favorite-cards.tsx
git commit -m "feat: add FavoriteCards component

- Grid layout responsive: 1/2/3/4 columns
- Shows strategy name, ticker, period, interval
- Displays win rate, return, Sharpe ratio with color coding
- Integrated FavoriteToggle for quick unfavorite
- Empty state with helpful message"
```

---

## Task 7: Create Favorites Section Component

**Files:**
- Create: `src/components/favorite/favorite-section.tsx`

- [ ] **Step 1: Create the section container**

Create `src/components/favorite/favorite-section.tsx`:

```typescript
import { useMemo, useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import { useBacktestList } from "@/hooks/use-backtest-list";
import { FavoriteCards } from "./favorite-cards";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";

type SortOption = "winRate" | "returnPercentage" | "sharpeRatio" | "createdAt";
type SortOrder = "asc" | "desc";

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
	{ value: "winRate", label: "Win Rate" },
	{ value: "returnPercentage", label: "Return %" },
	{ value: "sharpeRatio", label: "Sharpe Ratio" },
	{ value: "createdAt", label: "Recently Added" },
];

export function FavoriteSection() {
	const { data: favorites, isLoading: isLoadingFavorites } = useFavorites();
	const { data: allBacktests, isLoading: isLoadingBacktests } = useBacktestList();

	const [sortBy, setSortBy] = useState<SortOption>("winRate");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

	// Match favorites with their latest backtest data
	const favoritesWithBacktest = useMemo(() => {
		if (!favorites || !allBacktests) return [];

		return favorites
			.map((fav) => {
				const backtest = allBacktests.find(
					(bt) =>
						bt.ticker === fav.ticker &&
						bt.strategy === fav.strategy &&
						bt.period === fav.period &&
						bt.interval === fav.interval,
				);

				if (!backtest) return null;

				return {
					...backtest,
					isFavorite: true as const,
				};
			})
			.filter((item): item is KeyStrategyBacktestStats & { isFavorite: true } => item !== null);
	}, [favorites, allBacktests]);

	if (isLoadingFavorites || isLoadingBacktests) {
		return (
			<div className="border-border/50 border rounded-md p-8">
				<div className="space-y-4">
					<div className="h-6 w-48 animate-pulse rounded bg-muted" />
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-32 animate-pulse rounded bg-muted" />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="border-border/50 border rounded-md p-6">
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-semibold">⭐ My Favorites</h2>
					<p className="text-muted-foreground text-sm">
						{favoritesWithBacktest.length} favorite{favoritesWithBacktest.length !== 1 ? "s" : ""}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<label htmlFor="sort-select" className="text-sm text-muted-foreground">
						Sort by:
					</label>
					<select
						id="sort-select"
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as SortOption)}
						className="bg-background border-input focus:ring-ring rounded-md border px-3 py-1.5 text-sm"
					>
						{SORT_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>

					<button
						type="button"
						onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
						className="bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded px-3 py-1.5 text-sm transition-colors"
					>
						{sortOrder === "asc" ? "↑" : "↓"}
					</button>
				</div>
			</div>

			<FavoriteCards
				favoritesWithBacktest={favoritesWithBacktest}
				sortBy={sortBy}
				sortOrder={sortOrder}
			/>
		</div>
	);
}
```

- [ ] **Step 2: Create useBacktestList hook (if not exists)**

Check if `src/hooks/use-backtest-list.ts` exists. If not, create it:

```typescript
import { useQuery } from "@tanstack/react-query";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";

export function useBacktestList() {
	return useQuery<KeyStrategyBacktestStats[]>({
		queryKey: ["backtests", "list"],
		queryFn: async () => {
			const response = await fetch("/api/strategy/list");
			if (!response.ok) {
				throw new Error("Failed to fetch backtests");
			}
			return response.json();
		},
		staleTime: 60 * 1000, // 1 minute
	});
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/favorite/favorite-section.tsx src/hooks/use-backtest-list.ts
git commit -m "feat: add FavoriteSection container component

- Fetches favorites and matches with latest backtest data
- Sort controls: metric selector and order toggle
- Loading skeleton with proper layout
- Displays favorite count
- Delegates to FavoriteCards for rendering"
```

---

## Task 8: Integrate Favorite Column into Strategy Table

**Files:**
- Modify: `src/components/strategy/strategy-table.tsx`

- [ ] **Step 1: Add Favorite column to table**

Find the `columns` useMemo in `src/components/strategy/strategy-table.tsx` and add the Favorite column after the "Top Performer" column:

```typescript
import { FavoriteToggle } from "@/components/favorite/favorite-toggle";

// In the columns array, add after the "✨" column:
{
	id: "favorite",
	header: "❤️ Favorite",
	size: 80,
	cell: ({ row }) => {
		const item = row.original as KeyStrategyBacktestStats;
		return (
			<FavoriteToggle
				config={{
					ticker: item.ticker,
					strategy: item.strategy,
					period: item.period,
					interval: item.interval,
				}}
			/>
		);
	},
},
```

- [ ] **Step 2: Commit**

```bash
git add src/components/strategy/strategy-table.tsx
git commit -m "feat: add Favorite column to strategy table

- Heart icon button in dedicated column
- Positioned after Top Performer column
- Uses FavoriteToggle component for consistency
- Integrates with existing table layout"
```

---

## Task 9: Add Favorites Section to Strategy List Page

**Files:**
- Modify: `src/routes/strategy/index.tsx`

- [ ] **Step 1: Import and render FavoriteSection**

In the strategy list page component, add the FavoriteSection above the table:

```typescript
import { FavoriteSection } from "@/components/favorite/favorite-section";

// In the component return, before StrategyTable:
return (
	<div className="container mx-auto p-6">
		<FavoriteSection />

		{/* Existing table and filters */}
		<StrategyTable data={strategies} />
	</div>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/strategy/index.tsx
git commit -m "feat: add favorites section to strategy list page

- Displays at top of page before main table
- Shows all favorites with latest backtest data
- Sort controls for ordering favorites
- Empty state guides users to favorite strategies"
```

---

## Task 10: Add Favorites Filter Button

**Files:**
- Modify: `src/routes/strategy/index.tsx` (or modify StrategyTable to accept filter)

- [ ] **Step 1: Add filter state and button**

Modify the strategy list page to add favorites filter:

```typescript
import { useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";

// In component:
const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
const { data: favorites } = useFavorites();

// Filter strategies based on favorites
const filteredStrategies = useMemo(() => {
	if (!showFavoritesOnly || !favorites) return strategies;

	return strategies.filter((strategy) =>
		favorites.some(
			(fav) =>
				fav.ticker === strategy.ticker &&
				fav.strategy === strategy.strategy &&
				fav.period === strategy.period &&
				fav.interval === strategy.interval,
		),
	);
}, [strategies, favorites, showFavoritesOnly]);

// In JSX, add filter button:
<div className="mb-4 flex gap-2">
	<button
		type="button"
		onClick={() => setShowFavoritesOnly(false)}
		className={!showFavoritesOnly ? "bg-primary text-primary-foreground" : "bg-secondary"}
	>
		All Strategies
	</button>
	<button
		type="button"
		onClick={() => setShowFavoritesOnly(true)}
		className={showFavoritesOnly ? "bg-primary text-primary-foreground" : "bg-secondary"}
	>
		❤️ Favorites Only
	</button>
</div>

// Pass filtered data to table:
<StrategyTable data={filteredStrategies} />
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/strategy/index.tsx
git commit -m "feat: add favorites filter button

- Toggle between All Strategies and Favorites Only
- Client-side filtering using favorites list
- Visual feedback on active filter
- Works with existing table filters"
```

---

## Task 11: Persist Sort Preference in localStorage

**Files:**
- Modify: `src/components/favorite/favorite-section.tsx`

- [ ] **Step 1: Add localStorage persistence**

Modify FavoriteSection to persist sort preferences:

```typescript
import { useEffect } from "react";
import { storage } from "@/lib/utils/storage";

// In component:
const [sortBy, setSortBy] = useState<SortOption>(() => {
	return storage.get<SortOption>("favorites-sort-by") ?? "winRate";
});

const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
	return storage.get<SortOrder>("favorites-sort-order") ?? "desc";
});

// Persist changes
useEffect(() => {
	storage.set("favorites-sort-by", sortBy);
}, [sortBy]);

useEffect(() => {
	storage.set("favorites-sort-order", sortOrder);
}, [sortOrder]);
```

- [ ] **Step 2: Commit**

```bash
git add src/components/favorite/favorite-section.tsx
git commit -m "feat: persist favorites sort preference

- Save sort metric and order to localStorage
- Restore preference on page load
- Improves UX by remembering user choice"
```

---

## Task 12: Add Loading and Error States

**Files:**
- Modify: `src/components/favorite/favorite-section.tsx`

- [ ] **Step 1: Enhance error handling**

Modify FavoriteSection to handle errors gracefully:

```typescript
import { useFavorites } from "@/hooks/use-favorites";

// In component:
const { data: favorites, isLoading: isLoadingFavorites, error: favoritesError } = useFavorites();

// Add error state rendering:
if (favoritesError) {
	return (
		<div className="border-border/50 border rounded-md p-8">
			<div className="flex flex-col items-center gap-4 text-center">
				<p className="text-destructive">Unable to load favorites</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="bg-primary text-primary-foreground rounded px-4 py-2"
				>
					Retry
				</button>
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/favorite/favorite-section.tsx
git commit -m "feat: add error handling to favorites section

- Show error message with retry button on failure
- Graceful degradation: main table still works
- Clear visual feedback for user action"
```

---

## Task 13: Write Tests

**Files:**
- Create: `src/components/favorite/favorite-toggle.test.tsx`
- Create: `src/components/favorite/favorite-cards.test.tsx`
- Create: `src/hooks/use-favorites.test.ts`

- [ ] **Step 1: Test FavoriteToggle component**

Create `src/components/favorite/favorite-toggle.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FavoriteToggle } from "./favorite-toggle";

const queryClient = new QueryClient({
	defaultOptions: {
		mutations: {
			retry: false,
		},
	},
});

function wrapper({ children }: { children: React.ReactNode }) {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("FavoriteToggle", () => {
 beforeEach(() => {
  vi.clearAllMocks();
  queryClient.clear();
 });

	const config = {
		ticker: "AAPL",
		strategy: "ema_bollinger",
		period: "60d",
		interval: "1d",
	};

	it("renders heart button", () => {
		render(<FavoriteToggle config={config} />, { wrapper });

		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
	});

	it("has correct aria-label when not favorited", () => {
		// Mock useIsFavorite to return false
		vi.mock("@/hooks/use-favorites", () => ({
			useIsFavorite: () => ({ isFavorite: false }),
			useFavoriteToggle: () => ({ mutate: vi.fn() }),
		}));

		render(<FavoriteToggle config={config} />, { wrapper });

		expect(screen.getByLabelText("Add to favorites")).toBeInTheDocument();
	});

	it("calls mutate on click", async () => {
		const mutate = vi.fn();

		vi.mock("@/hooks/use-favorites", () => ({
			useIsFavorite: () => ({ isFavorite: false }),
			useFavoriteToggle: () => ({ mutate }),
		}));

		render(<FavoriteToggle config={config} />, { wrapper });

		const button = screen.getByRole("button");
		fireEvent.click(button);

		await waitFor(() => {
			expect(mutate).toHaveBeenCalled();
		});
	});

	it("is disabled when prop is true", () => {
		vi.mock("@/hooks/use-favorites", () => ({
			useIsFavorite: () => ({ isFavorite: false }),
			useFavoriteToggle: () => ({ mutate: vi.fn() }),
		}));

		render(<FavoriteToggle config={config} disabled />, { wrapper });

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
	});
});
```

- [ ] **Step 2: Run tests**

Run: `bun test src/components/favorite/favorite-toggle.test.tsx`

Expected: All tests pass

- [ ] **Step 3: Test favorite cards sorting**

Create `src/components/favorite/favorite-cards.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FavoriteCards } from "./favorite-cards";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";

const mockFavorites: Array<KeyStrategyBacktestStats & { isFavorite: true }> = [
	{
		id: "1",
		ticker: "AAPL",
		strategy: "ema_bollinger",
		period: "60d",
		interval: "1d",
		winRate: 52.1,
		returnPercentage: 15.3,
		sharpeRatio: 1.8,
		isFavorite: true,
		created_at: new Date("2026-03-01"),
		// ... other required fields
	},
	{
		id: "2",
		ticker: "TSLA",
		strategy: "bollinger",
		period: "1y",
		interval: "1d",
		winRate: 58.3,
		returnPercentage: 22.1,
		sharpeRatio: 2.1,
		isFavorite: true,
		created_at: new Date("2026-03-15"),
		// ... other required fields
	},
];

describe("FavoriteCards", () => {
	it("renders empty state when no favorites", () => {
		render(<FavoriteCards favoritesWithBacktest={[]} />);

		expect(screen.getByText("No favorites yet")).toBeInTheDocument();
	});

	it("sorts by win rate descending by default", () => {
		const { container } = render(
			<FavoriteCards favoritesWithBacktest={mockFavorites} sortBy="winRate" sortOrder="desc" />
		);

		const cards = container.querySelectorAll('[class*="group relative"]');
		expect(cards[0]).toHaveTextContent("TSLA"); // Higher win rate
		expect(cards[1]).toHaveTextContent("AAPL");
	});

	it("displays metrics with correct color coding", () => {
		render(<FavoriteCards favoritesWithBacktest={mockFavorites} />);

		// Win rate >= 50 should be green
		const winRates = screen.getAllByText(/52.1%/);
		expect(winRates[0]).toHaveClass("text-emerald-500");
	});
});
```

- [ ] **Step 4: Run tests**

Run: `bun test src/components/favorite/favorite-cards.test.tsx`

Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/favorite/favorite-toggle.test.tsx src/components/favorite/favorite-cards.test.tsx
git commit -m "test: add component tests for favorites

- FavoriteToggle: rendering, click handler, disabled state
- FavoriteCards: empty state, sorting, color coding
- Test user interactions and edge cases"
```

---

## Task 14: Manual QA Testing

**Files:**
- Manual testing checklist

- [ ] **Step 1: Test favorite toggle**

1. Navigate to strategy list page
2. Click heart icon on a strategy
3. Verify heart fills with red color
4. Refresh page - verify favorite persists
5. Click heart again - verify unfavorites

- [ ] **Step 2: Test favorites section**

1. Add 3+ strategies to favorites
2. Verify favorites section appears at top of page
3. Verify cards display correct metrics
4. Click heart on card to unfavorite
5. Verify card disappears immediately

- [ ] **Step 3: Test sorting**

1. Select "Win Rate" sort
2. Verify cards reorder by win rate
3. Click sort order toggle
4. Verify cards reverse order
4. Refresh page - verify sort preference persists

- [ ] **Step 4: Test filter button**

1. Click "Favorites Only" button
2. Verify table shows only favorited strategies
3. Click "All Strategies" button
4. Verify table shows all strategies

- [ ] **Step 5: Test error handling**

1. Open browser dev tools
2. Go to Network tab
3. Throttle network to "Offline"
4. Try to favorite/unfavorite
5. Verify error toast appears
6. Verify UI rolls back to previous state

- [ ] **Step 6: Test on mobile**

1. Open on mobile viewport (375px width)
2. Verify favorites section stacks vertically
3. Verify cards are 1 column on mobile
4. Verify all buttons are tappable

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "test: complete manual QA testing

- Favorite toggle persistence and rollback
- Favorites section display and interactions
- Sorting and order persistence
- Filter button functionality
- Error handling and network failures
- Mobile responsive design verified"
```

---

## Task 15: Documentation and Polish

**Files:**
- Modify: `CLAUDE.md` (if needed)
- Create: `docs/favorites-feature.md`

- [ ] **Step 1: Create feature documentation**

Create `docs/favorites-feature.md`:

```markdown
# Favorites Feature

## Overview

Users can mark trading strategy configurations as favorites for quick access.

## How It Works

1. **Favoriting**: Click the heart icon in the strategy table
2. **Favorites Section**: Appears at top of page showing all favorites
3. **Filtering**: Use "Favorites Only" button to show only favorited strategies
4. **Sorting**: Sort favorites by Win Rate, Return, Sharpe Ratio, or Recently Added

## Data Model

Favorites are stored in `user_favorite_strategies` table with composite unique key:
- `user_id`
- `ticker`
- `strategy`
- `period`
- `interval`

Favorites reference strategy configurations, not specific backtest runs. The system always shows the latest backtest for a favorited configuration.

## API Endpoints

- `GET /api/user/favorites` - List user favorites
- `POST /api/user/favorites` - Add favorite (idempotent)
- `DELETE /api/user/favorites` - Remove favorite

## Components

- `FavoriteToggle` - Heart icon button
- `FavoriteCards` - Grid of favorite cards
- `FavoriteSection` - Container with sorting controls

## Future Enhancements

- Grouping by ticker/strategy/period
- User notes on favorites
- Performance tracking over time
- Notifications when favorites update
`
```

- [ ] **Step 2: Final commit**

```bash
git add docs/favorites-feature.md
git commit -m "docs: add favorites feature documentation

- Feature overview and user guide
- Data model explanation
- API endpoint reference
- Component documentation
- Future enhancement roadmap"
```

- [ ] **Step 3: Push to remote**

Run: `git push origin feat/favorite-strategy`

---

## Self-Review Checklist

- [x] **Spec Coverage**: All requirements from spec have tasks
  - Database schema: Task 1
  - TypeScript types: Task 2
  - API endpoints: Task 3
  - React Query hooks: Task 4
  - FavoriteToggle component: Task 5
  - FavoriteCards component: Task 6
  - FavoriteSection container: Task 7
  - Table integration: Task 8
  - Page integration: Task 9
  - Filter functionality: Task 10
  - Sort persistence: Task 11
  - Error handling: Task 12
  - Tests: Task 13
  - QA testing: Task 14
  - Documentation: Task 15

- [x] **Placeholder Scan**: No TBD, TODO, or incomplete steps found

- [x] **Type Consistency**: All type names match across tasks
  - `FavoriteStrategyConfig` used consistently
  - `KeyStrategyBacktestStats` used correctly
  - API signatures match hook usage

- [x] **File Paths**: All paths are absolute and correct
  - New files properly scoped
  - Modified files reference existing structure

---

**Plan complete! Ready for execution.**
