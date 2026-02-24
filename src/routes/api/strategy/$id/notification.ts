import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { backtestStats, db } from "@/db";

export const Route = createFileRoute("/api/strategy/$id/notification")({
	server: {
		handlers: {
			PATCH: async ({ request, params }) => {
				const strategyID = Number.parseInt(params.id, 10);

				// Validate ID
				if (!strategyID || Number.isNaN(strategyID)) {
					return new Response(
						JSON.stringify({ error: "Invalid strategy ID" }),
						{ status: 400, headers: { "Content-Type": "application/json" } },
					);
				}

				try {
					// Parse request body
					const body = (await request.json()) as { notificationsOn: boolean };

					// Validate notificationsOn field
					if (typeof body.notificationsOn !== "boolean") {
						return new Response(
							JSON.stringify({ error: "notificationsOn must be a boolean" }),
							{ status: 400, headers: { "Content-Type": "application/json" } },
						);
					}

					// Update using Drizzle ORM
					const result = await db
						.update(backtestStats)
						.set({
							notificationsOn: body.notificationsOn,
							updated_at: new Date(), // Update timestamp
						})
						.where(eq(backtestStats.id, strategyID))
						.returning();

					// Check if record exists
					if (result.length === 0) {
						return new Response(
							JSON.stringify({ error: "Strategy not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } },
						);
					}

					return new Response(JSON.stringify(result[0]), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					console.error("Error updating notification:", error);
					return new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});
