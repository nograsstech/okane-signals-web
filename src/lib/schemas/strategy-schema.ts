import { z } from "zod";

/**
 * Zod schema for validating strategy creation form input
 */
export const createStrategySchema = z.object({
	ticker: z
		.string()
		.min(1, "Ticker is required")
		.regex(/^[A-Z]+=?[A-Z]*$/, "Invalid ticker format (e.g., AAPL, EURJPY=X)"),
	period: z
		.string()
		.min(1, "Period is required")
		.regex(/^\d+[dwmy]$/, "Invalid period format (e.g., 60d, 1w, 3m, 1y)"),
	interval: z
		.string()
		.min(1, "Interval is required")
		.regex(/^\d+[mhd]$/, "Invalid interval format (e.g., 15m, 1h, 1d)"),
	strategy: z
		.string()
		.min(1, "Strategy is required")
		.default("ema_bollinger"),
	strategy_id: z
		.string()
		.optional()
		.refine((val) => !val || !Number.isNaN(Number(val)), {
			message: "Strategy ID must be a number",
		}),
});

export type CreateStrategyFormInput = z.infer<typeof createStrategySchema>;
