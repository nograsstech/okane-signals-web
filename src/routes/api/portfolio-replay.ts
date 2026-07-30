import { createFileRoute } from "@tanstack/react-router";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { portfolioReplaySchema } from "@/lib/schemas/portfolio-replay-schema";

export const Route = createFileRoute("/api/portfolio-replay")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const session = await auth.api.getSession({ headers: request.headers });
				if (!session?.user) {
					return new Response(JSON.stringify({ error: "Unauthorized" }), {
						status: 401,
						headers: { "Content-Type": "application/json" },
					});
				}

				try {
					const body = portfolioReplaySchema.parse(await request.json());
					const baseUrl = process.env.OKANE_FINANCE_API_URL;
					const username = process.env.OKANE_FINANCE_API_USER;
					const password = process.env.OKANE_FINANCE_API_PASSWORD;
					if (!baseUrl || !username || !password) {
						console.error(
							"Portfolio replay API credentials are not configured",
						);
						return new Response(
							JSON.stringify({ error: "Portfolio replay is not configured" }),
							{
								status: 503,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					const upstream = await fetch(
						`${baseUrl.replace(/\/$/, "")}/signals/portfolio-replay`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Basic ${btoa(`${username}:${password}`)}`,
							},
							body: JSON.stringify(body),
						},
					);
					const text = await upstream.text();
					if (!upstream.ok) {
						console.error("Portfolio replay upstream failure", upstream.status);
						return new Response(
							JSON.stringify({ error: "Portfolio replay failed" }),
							{
								status: upstream.status >= 500 ? 502 : upstream.status,
								headers: { "Content-Type": "application/json" },
							},
						);
					}
					return new Response(text, {
						status: 200,
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "no-store",
						},
					});
				} catch (error) {
					if (error instanceof ZodError || error instanceof SyntaxError) {
						return new Response(
							JSON.stringify({ error: "Invalid replay parameters" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}
					console.error("Portfolio replay proxy failure", error);
					return new Response(
						JSON.stringify({ error: "Portfolio replay failed" }),
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
