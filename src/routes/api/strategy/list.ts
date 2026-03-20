import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const Route = createFileRoute("/api/strategy/list")({
	server: {
		handlers: {
			GET: async () => {
				// Use DISTINCT ON to let Postgres deduplicate server-side.
				// This returns exactly one row per unique (ticker, strategy, period, interval)
				// — the most recent one — instead of a full table scan with JS dedup.
				// html column is intentionally excluded to avoid egress of 40-80 KB blobs.
				const result = await db.execute(sql`
					SELECT DISTINCT ON (ticker, strategy, period, interval)
						id,
						start_time      AS "startTime",
						end_time        AS "endTime",
						ticker,
						strategy,
						period,
						interval,
						average_drawdown_percentage   AS "averageDrawdownPercentage",
						max_drawdown_duration         AS "maxDrawdownDuration",
						duration,
						return_percentage             AS "returnPercentage",
						return_annualized             AS "returnAnnualized",
						buy_and_hold_return           AS "buyAndHoldReturn",
						sharpe_ratio                  AS "sharpeRatio",
						sortino_ratio                 AS "sortinoRatio",
						calmar_ratio                  AS "calmarRatio",
						win_rate                      AS "winRate",
						avg_trade                     AS "avgTrade",
						worst_trade                   AS "worstTrade",
						notifications_on              AS "notificationsOn",
						best_trade                    AS "bestTrade",
						created_at
					FROM backtest_stats
					ORDER BY ticker, strategy, period, interval, created_at DESC
				`);

				return new Response(JSON.stringify(result.rows), {
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "max-age=20, must-revalidate",
					},
				});
			},
		},
	},
});
