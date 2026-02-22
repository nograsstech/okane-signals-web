import { createFileRoute } from "@tanstack/react-router";
import { db, tradeActions } from "@/db";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/strategy/tradeActions")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const backtest_id = url.searchParams.get("backtest_id") ?? "";

				try {
					const tradeActionsList = await db
						.select()
						.from(tradeActions)
						.where(eq(tradeActions.backtest_id, backtest_id));

					return new Response(
						JSON.stringify({
							tradeActionsList,
						}),
						{
							headers: {
								"Content-Type": "application/json",
								"Cache-Control": "max-age=300",
							},
						},
					);
				} catch (err) {
					return new Response(
						JSON.stringify({
							error: `Internal Server Error: ${err}`,
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
