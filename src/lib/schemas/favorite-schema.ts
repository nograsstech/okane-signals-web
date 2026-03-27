import { z } from "zod";

/**
 * Zod schema for validating favorite strategy operations
 */
export const favoriteConfigSchema = z.object({
	ticker: z.string().min(1, "Ticker is required"),
	strategy: z.string().min(1, "Strategy is required"),
	period: z.string().min(1, "Period is required"),
	interval: z.string().min(1, "Interval is required"),
});

export type FavoriteConfigInput = z.infer<typeof favoriteConfigSchema>;
