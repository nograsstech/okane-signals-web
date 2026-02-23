import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import pako from "pako";
import { backtestStats, db } from "@/db";

export const Route = createFileRoute("/api/strategy/$id/backtest")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const strategyID = parseInt(params.id, 10);

				if (!strategyID || Number.isNaN(strategyID)) {
					return new Response(`Invalid ID: ${params.id}`, { status: 400 });
				}

				try {
					// Query string field html for this specific strategy id
					const strategyData = await db
						.select({
							html: backtestStats.html,
						})
						.from(backtestStats)
						.where(eq(backtestStats.id, strategyID))
						.limit(1);

					if (strategyData.length === 0 || !strategyData[0].html) {
						return new Response(`Not found for strategy ID: ${strategyID}`, {
							status: 404,
						});
					}

					// Get compressed data (base64 encoded, from Python)
					const compressedBase64 = strategyData[0].html;

					// The Python backend gzips, then base64 encodes it OR it stores simple HTML directly...
					// Let's check if it's naturally just an HTML string already:
					if (compressedBase64.trim().startsWith("<")) {
						// Return raw HTML directly
						return new Response(compressedBase64, {
							headers: {
								"Content-Type": "text/html",
								"Cache-Control": "public, max-age=86400", // Cache for 24 hours
							},
						});
					}

					// Decode the base64 string to a byte array using Buffer for Node/SSR compatibility
					// The native atob sometimes mangles binary payloads in pure Node environment
					const buffer = Buffer.from(compressedBase64, "base64");
					const compressedData = new Uint8Array(buffer);

					// Decompress the data using pako
					const decompressedData = pako.inflate(compressedData, {
						to: "string",
					});

					// Return the HTML content directly
					return new Response(decompressedData, {
						headers: {
							"Content-Type": "text/html",
							"Cache-Control": "public, max-age=86400", // Cache for 24 hours
						},
					});
				} catch (error) {
					console.error("Decompression failed:", error);
					return new Response("Decompression failed", { status: 500 });
				}
			},
		},
	},
});
