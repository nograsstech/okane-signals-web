import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
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
				const body = (await request.json()) as {
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
