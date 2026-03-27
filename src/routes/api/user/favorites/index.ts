import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { userFavoriteStrategies } from "@/db/schemas";
import { auth } from "@/lib/auth";
import { favoriteConfigSchema } from "@/lib/schemas/favorite-schema";
import { ZodError } from "zod";

export const Route = createFileRoute("/api/user/favorites/")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const session = await auth.api.getSession({
					headers: request.headers,
				});

				if (!session) {
					return new Response(JSON.stringify({ error: "Unauthorized" }), {
						status: 401,
						headers: { "Content-Type": "application/json" },
					});
				}

				try {
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
				} catch (error) {
					console.error("Failed to fetch favorites:", error);
					return new Response(
						JSON.stringify({ error: "Failed to fetch favorites" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},

			POST: async ({ request }) => {
				const session = await auth.api.getSession({
					headers: request.headers,
				});

				if (!session) {
					return new Response(JSON.stringify({ error: "Unauthorized" }), {
						status: 401,
						headers: { "Content-Type": "application/json" },
					});
				}

				try {
					const body = await request.json();

					// Validate input using Zod
					const validatedData = favoriteConfigSchema.parse(body);

					const result = await db
						.insert(userFavoriteStrategies)
						.values({
							userId: session.user.id,
							ticker: validatedData.ticker,
							strategy: validatedData.strategy,
							period: validatedData.period,
							interval: validatedData.interval,
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

					// Check if the favorite was created or if it already existed
					if (result.length > 0) {
						return new Response(JSON.stringify(result[0]), {
							status: 201,
							headers: { "Content-Type": "application/json" },
						});
					} else {
						// Already exists (conflict)
						return new Response(
							JSON.stringify({ message: "Already favorited" }),
							{
								status: 200,
								headers: { "Content-Type": "application/json" },
							},
						);
					}
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

					console.error("Failed to create favorite:", error);
					return new Response(
						JSON.stringify({ error: "Failed to create favorite" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},

			DELETE: async ({ request }) => {
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
				const ticker = url.searchParams.get("ticker");
				const strategy = url.searchParams.get("strategy");
				const period = url.searchParams.get("period");
				const interval = url.searchParams.get("interval");

				// Validate that all parameters are present and non-empty
				if (
					!ticker ||
					!strategy ||
					!period ||
					!interval ||
					ticker.trim() === "" ||
					strategy.trim() === "" ||
					period.trim() === "" ||
					interval.trim() === ""
				) {
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
					console.error("Failed to delete favorite:", error);
					return new Response(
						JSON.stringify({ error: "Failed to delete favorite" }),
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
