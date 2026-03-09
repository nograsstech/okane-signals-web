import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { backtestStats, db } from "@/db";

export const Route = createFileRoute("/api/strategy/$id")({
	server: {
		handlers: {
			DELETE: async ({ params }) => {
				const strategyID = Number.parseInt(params.id, 10);

				// Validate ID
				if (!strategyID || Number.isNaN(strategyID)) {
					return new Response(
						JSON.stringify({ error: "Invalid strategy ID" }),
						{ status: 400, headers: { "Content-Type": "application/json" } },
					);
				}

				try {
					// Delete using Drizzle ORM
					const result = await db
						.delete(backtestStats)
						.where(eq(backtestStats.id, strategyID))
						.returning();

					// Check if record existed
					if (result.length === 0) {
						return new Response(
							JSON.stringify({ error: "Strategy not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } },
						);
					}

					return new Response(
						JSON.stringify({ success: true, id: strategyID }),
						{
							status: 200,
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (error) {
					console.error("Error deleting strategy:", error);
					return new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});
