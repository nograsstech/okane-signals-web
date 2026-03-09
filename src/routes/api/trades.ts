import { createFileRoute } from "@tanstack/react-router";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { backtestStats, db, tradeActions } from "@/db";

export const Route = createFileRoute("/api/trades")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);

				// Parse query parameters
				const pageParam = url.searchParams.get("page");
				const pageSizeParam = url.searchParams.get("pageSize");
				const ticker = url.searchParams.get("ticker");
				const actionType = url.searchParams.get("actionType");
				const startDate = url.searchParams.get("startDate");
				const endDate = url.searchParams.get("endDate");
				const search = url.searchParams.get("search");

				// Validate pagination params
				const page = pageParam ? Number.parseInt(pageParam, 10) : 1;
				const pageSize = pageSizeParam ? Number.parseInt(pageSizeParam, 10) : 25;

				if (page < 1 || Number.isNaN(page)) {
					return new Response(
						JSON.stringify({ error: "Invalid page parameter" }),
						{ status: 400, headers: { "Content-Type": "application/json" } },
					);
				}

				if (pageSize < 1 || pageSize > 100 || Number.isNaN(pageSize)) {
					return new Response(
						JSON.stringify({ error: "pageSize must be between 1 and 100" }),
						{ status: 400, headers: { "Content-Type": "application/json" } },
					);
				}

				// Validate actionType
				if (actionType && !["buy", "sell", "close"].includes(actionType)) {
					return new Response(
						JSON.stringify({ error: "actionType must be 'buy', 'sell', or 'close'" }),
						{ status: 400, headers: { "Content-Type": "application/json" } },
					);
				}

				try {
					// Authentication (no user filtering - global view)
					const session = await auth.api.getSession({
						headers: request.headers,
					});
					if (!session?.user) {
						return new Response("Unauthorized", { status: 401 });
					}

					// Build dynamic query
					const conditions = [];

					if (ticker) {
						conditions.push(eq(backtestStats.ticker, ticker));
					}

					if (actionType) {
						conditions.push(eq(tradeActions.trade_action, actionType));
					}

					if (startDate) {
						const start = new Date(startDate);
						if (Number.isNaN(start.getTime())) {
							return new Response(
								JSON.stringify({ error: "Invalid startDate format" }),
								{ status: 400, headers: { "Content-Type": "application/json" } },
							);
						}
						conditions.push(gte(tradeActions.datetime, start));
					}

					if (endDate) {
						const end = new Date(endDate);
						if (Number.isNaN(end.getTime())) {
							return new Response(
								JSON.stringify({ error: "Invalid endDate format" }),
								{ status: 400, headers: { "Content-Type": "application/json" } },
							);
						}
						conditions.push(lte(tradeActions.datetime, end));
					}

					if (search) {
						// Global search across ticker and strategy
						conditions.push(
							sql`(${backtestStats.ticker} ILIKE ${`%${search}%`} OR ${backtestStats.strategy} ILIKE ${`%${search}%`})`,
						);
					}

					// Build the JOIN query
					const baseQuery = db
						.select({
							id: tradeActions.id,
							created_at: tradeActions.created_at,
							backtest_id: tradeActions.backtest_id,
							datetime: tradeActions.datetime,
							trade_action: tradeActions.trade_action,
							entry_price: tradeActions.entry_price,
							price: tradeActions.price,
							sl: tradeActions.sl,
							tp: tradeActions.tp,
							size: tradeActions.size,
							ticker: backtestStats.ticker,
							strategy: backtestStats.strategy,
						})
						.from(tradeActions)
						.innerJoin(backtestStats, eq(tradeActions.backtest_id, backtestStats.id))
						.where(conditions.length > 0 ? and(...conditions) : undefined)
						.orderBy(desc(tradeActions.datetime));

					// Get total count
					const countResult = await db
						.select({ count: sql<number>`count(*)::int` })
						.from(tradeActions)
						.innerJoin(backtestStats, eq(tradeActions.backtest_id, backtestStats.id))
						.where(conditions.length > 0 ? and(...conditions) : undefined);

					const totalCount = countResult[0]?.count ?? 0;
					const totalPages = Math.ceil(totalCount / pageSize);

					// Fetch paginated results
					const trades = await baseQuery.limit(pageSize).offset((page - 1) * pageSize);

					// Convert numeric strings to numbers for proper JSON serialization
					const processedTrades = trades.map((trade) => ({
						...trade,
						backtest_id:
							typeof trade.backtest_id === "string"
								? Number.parseInt(trade.backtest_id, 10)
								: trade.backtest_id,
						entry_price: trade.entry_price ? Number(trade.entry_price) : null,
						price: trade.price ? Number(trade.price) : null,
						sl: trade.sl ? Number(trade.sl) : null,
						tp: trade.tp ? Number(trade.tp) : null,
						size: trade.size ? Number(trade.size) : null,
					}));

					return new Response(
						JSON.stringify({
							trades: processedTrades,
							pagination: {
								page,
								pageSize,
								totalCount,
								totalPages,
							},
						}),
						{
							headers: {
								"Content-Type": "application/json",
								"Cache-Control": "max-age=10",
							},
						},
					);
				} catch (err) {
					console.error("Error fetching trades:", err);
					return new Response(
						JSON.stringify({ error: `Internal Server Error: ${err}` }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});
