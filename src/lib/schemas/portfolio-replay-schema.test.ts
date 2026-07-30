import { describe, expect, it } from "vitest";
import { portfolioReplaySchema } from "./portfolio-replay-schema";

const valid = {
	start_date: "2026-07-01",
	end_date: "2026-07-30",
	starting_equity: 100_000,
	risk_per_trade: 100,
	cost_per_trade: 0,
};

describe("portfolioReplaySchema", () => {
	it("accepts a bounded replay with fixed USD risk", () => {
		expect(portfolioReplaySchema.safeParse(valid).success).toBe(true);
	});

	it("rejects reversed and oversized date ranges", () => {
		expect(
			portfolioReplaySchema.safeParse({
				...valid,
				start_date: "2026-07-30",
				end_date: "2026-07-01",
			}).success,
		).toBe(false);
		expect(
			portfolioReplaySchema.safeParse({
				...valid,
				start_date: "2026-01-01",
				end_date: "2026-03-02",
			}).success,
		).toBe(false);
	});

	it("rejects invalid money inputs", () => {
		expect(
			portfolioReplaySchema.safeParse({ ...valid, risk_per_trade: 0 }).success,
		).toBe(false);
		expect(
			portfolioReplaySchema.safeParse({ ...valid, cost_per_trade: -1 }).success,
		).toBe(false);
	});

	it("rejects impossible calendar dates", () => {
		expect(
			portfolioReplaySchema.safeParse({ ...valid, start_date: "2026-02-30" })
				.success,
		).toBe(false);
	});
});
