import { createFileRoute } from "@tanstack/react-router";
import { backtestStats, db } from "@/db";

export const Route = createFileRoute("/api/strategy/list")({
	server: {
		handlers: {
			GET: async () => {
				console.log("HELLO WORLD")
				const strategyList = await db
					.selectDistinct({
						id: backtestStats.id,
						startTime: backtestStats.startTime,
						endTime: backtestStats.endTime,
						ticker: backtestStats.ticker,
						strategy: backtestStats.strategy,
						period: backtestStats.period,
						interval: backtestStats.interval,
						averageDrawdownPercentage: backtestStats.averageDrawdownPercentage,
						maxDrawdownDuration: backtestStats.maxDrawdownDuration,
						duration: backtestStats.duration,
						returnPercentage: backtestStats.returnPercentage,
						returnAnnualized: backtestStats.returnAnnualized,
						buyAndHoldReturn: backtestStats.buyAndHoldReturn,
						sharpeRatio: backtestStats.sharpeRatio,
						sortinoRatio: backtestStats.sortinoRatio,
						calmarRatio: backtestStats.calmarRatio,
						winRate: backtestStats.winRate,
						avgTrade: backtestStats.avgTrade,
						worstTrade: backtestStats.worstTrade,
						notificationsOn: backtestStats.notificationsOn,
						bestTrade: backtestStats.calmarRatio,
						created_at: backtestStats.created_at,
					})
					.from(backtestStats);

				// For each entry, only return the latest backtest data based on the created_at timestamp
				const strategyMap = new Map();
				for (const item of strategyList) {
					const key = `${item.ticker}-${item.strategy}-${item.period}-${item.interval}`;
					if (
						item.created_at !== null &&
						(!strategyMap.has(key) ||
							strategyMap.get(key).created_at < item.created_at)
					) {
						strategyMap.set(key, item);
					}
				}

				// Convert the map to an array
				const uniqueStrategyList = Array.from(strategyMap.values());

				return new Response(JSON.stringify(uniqueStrategyList), {
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "max-age=20",
					},
				});
			},
		},
	},
});
