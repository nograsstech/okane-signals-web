import { createFileRoute } from "@tanstack/react-router";
import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { backtestStats, db } from "@/db";
import type { BacktestResponseDTO } from "@/lib/okane-finance-api/generated";
import { getOkaneClient } from "@/lib/okane-finance-api/okane-client";

export const Route = createFileRoute("/api/strategy")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const ticker = url.searchParams.get("ticker") ?? "";
				const period = url.searchParams.get("period") ?? "";
				const interval = url.searchParams.get("interval") ?? "";
				const strategy = url.searchParams.get("strategy") ?? "";
				const strategyID = url.searchParams.get("id") ?? "";
				const withHTML = url.searchParams.get("html") ?? "";

				// Fetch for existing backtest data using strategyID, if provided and if exists in the DB
				if (strategyID) {
					const { html, ...rest } = getTableColumns(backtestStats);
					const selectParam = withHTML ? { html, ...rest } : rest;

					const strategy = await db
						.select(selectParam)
						.from(backtestStats)
						.where(and(eq(backtestStats.id, Number(strategyID))))
						.limit(1);

					if (!strategy.length) {
						return new Response(JSON.stringify({ error: "Not Found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" },
						});
					}

					return new Response(JSON.stringify(strategy), {
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "max-age=20",
						},
					});
				}

				if (!ticker || !period || !interval || !strategy) {
					return new Response(JSON.stringify({ error: "Bad Request" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					});
				}

				// Fetch for existing backtest data using ticker, strategy, period, and interval
				const existingBacktestData = await db
					.select()
					.from(backtestStats)
					.where(
						and(
							eq(backtestStats.ticker, ticker),
							eq(backtestStats.period, period),
							eq(backtestStats.interval, interval),
							eq(backtestStats.strategy, strategy),
						),
					)
					.orderBy(desc(backtestStats.created_at))
					.limit(1);

				const today = new Date();
				today.setHours(0, 0, 0, 0); // set the time to 00:00:00

				const createdAt = existingBacktestData[0]?.created_at;
				if (createdAt) {
					createdAt.setHours(0, 0, 0, 0); // set the time to 00:00:00
				}

				if (existingBacktestData.length && createdAt && +createdAt === +today) {
					return new Response(JSON.stringify(existingBacktestData), {
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "max-age=20",
						},
					});
				}

				// If there's no existing backtest data, fetch the new backtest data from the Okane Finance API
				try {
					const okaneClient = getOkaneClient();
					const backtest_data: BacktestResponseDTO =
						await okaneClient.backtestSyncSignalsBacktestSyncGet({
							ticker,
							period: period as any,
							interval,
							strategy: strategy as any,
						});

					// Save the backtest data to the database
					const data = {
						...backtest_data.data,
						ticker: backtest_data.data.ticker,
						strategy,
						period,
						interval,
						startTime: backtest_data.data.startTime,
						endTime: backtest_data.data.endTime,
					} as unknown as typeof backtestStats.$inferInsert;

					const result = await db
						.insert(backtestStats)
						.values(data)
						.returning();

					return new Response(JSON.stringify(result), {
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "max-age=20",
						},
					});
				} catch (e) {
					return new Response(
						JSON.stringify({
							error: `Unable to save backtest data. Error: ${e}`,
						}),
						{ status: 400, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});
