import { createFileRoute } from "@tanstack/react-router";
import { getOkaneClient } from "@/lib/okane-finance-api/okane-client";
import { createStrategySchema } from "@/lib/schemas/strategy-schema";
import { ZodError } from "zod";

export const Route = createFileRoute("/api/strategy/backtest")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const body = await request.json();

					// Validate input using Zod
					const validatedData = createStrategySchema.parse(body);

					const client = getOkaneClient();
					const result = await client.backtestSignalsBacktestGet({
						ticker: validatedData.ticker,
						period: validatedData.period as any,
						interval: validatedData.interval,
						strategy: validatedData.strategy as any,
						strategyId: validatedData.strategy_id,
					});

					return new Response(JSON.stringify(result), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					if (error instanceof ZodError) {
						// Format Zod validation errors
						const formattedErrors = error.errors.map((e) => ({
							field: e.path.join("."),
							message: e.message,
						}));
						return new Response(
							JSON.stringify({
								error: "Validation failed",
								details: formattedErrors,
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					if (error instanceof Error) {
						return new Response(JSON.stringify({ error: error.message }), {
							status: 400,
							headers: { "Content-Type": "application/json" },
						});
					}

					return new Response(JSON.stringify({ error: "Unknown error" }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					});
				}
			},
		},
	},
});
