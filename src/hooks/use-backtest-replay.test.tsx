import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBacktestReplay } from "@/api/backtest-api";
import { useBacktestReplay } from "./use-backtest-replay";

vi.mock("@/api/backtest-api", () => ({
	getBacktestReplay: vi.fn(),
}));

const mockedGetBacktestReplay = vi.mocked(getBacktestReplay);

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};
}

describe("useBacktestReplay", () => {
	beforeEach(() => {
		mockedGetBacktestReplay.mockReset();
		mockedGetBacktestReplay.mockResolvedValue({ data: null });
	});

	it("does not fetch replay data while replay is disabled", async () => {
		renderHook(() => useBacktestReplay(42, false), {
			wrapper: createWrapper(),
		});

		await Promise.resolve();

		expect(mockedGetBacktestReplay).not.toHaveBeenCalled();
	});

	it("fetches replay data after replay is enabled", async () => {
		renderHook(() => useBacktestReplay(42, true), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(mockedGetBacktestReplay).toHaveBeenCalledWith(42);
		});
	});
});
