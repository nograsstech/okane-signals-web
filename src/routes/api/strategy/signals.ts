import { createFileRoute } from "@tanstack/react-router";
import { getOkaneClient } from "@/lib/okane-finance-api/okane-client";

export const Route = createFileRoute("/api/strategy/signals")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const ticker = url.searchParams.get("ticker") ?? "";
				const period = url.searchParams.get("period") ?? "";
				const interval = url.searchParams.get("interval") ?? "";
				const strategy = url.searchParams.get("strategy") ?? "";

				if (!ticker || !period || !interval || !strategy) {
					return new Response(JSON.stringify({ error: "Bad Request" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					});
				}

				try {
					const okaneClient = getOkaneClient();
					const signals = await okaneClient.getSignalsSignalsGet({
						ticker,
						interval,
						period: period as any,
						strategy: strategy as any,
					});

					return new Response(
						JSON.stringify({
							signals,
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
