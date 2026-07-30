import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

function isCalendarDate(value: string) {
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	);
}

export const portfolioReplaySchema = z
	.object({
		start_date: dateString,
		end_date: dateString,
		starting_equity: z.number().finite().positive().max(1_000_000_000),
		risk_per_trade: z.number().finite().positive().max(1_000_000_000),
		cost_per_trade: z.number().finite().nonnegative().max(1_000_000_000),
	})
	.superRefine((value, context) => {
		const start = new Date(`${value.start_date}T00:00:00Z`);
		const end = new Date(`${value.end_date}T00:00:00Z`);
		const today = new Date();
		today.setUTCHours(0, 0, 0, 0);

		if (
			!isCalendarDate(value.start_date) ||
			!isCalendarDate(value.end_date) ||
			Number.isNaN(start.getTime()) ||
			Number.isNaN(end.getTime())
		) {
			context.addIssue({
				code: "custom",
				message: "Dates must be valid calendar dates",
			});
			return;
		}
		if (start > end) {
			context.addIssue({
				path: ["end_date"],
				code: "custom",
				message: "End date must be on or after start date",
			});
		}
		if (end > today) {
			context.addIssue({
				path: ["end_date"],
				code: "custom",
				message: "End date cannot be in the future",
			});
		}
		if ((end.getTime() - start.getTime()) / 86_400_000 > 59) {
			context.addIssue({
				path: ["end_date"],
				code: "custom",
				message: "Replay windows cannot exceed 59 days",
			});
		}
	});

export type PortfolioReplayFormValues = z.infer<typeof portfolioReplaySchema>;
