import { useMutation } from "@tanstack/react-query";
import { runPortfolioReplay } from "@/api/portfolio-replay-api";
import type { PortfolioReplayRequest } from "@/lib/types/portfolio-replay";

export function usePortfolioReplay() {
	return useMutation({
		mutationFn: (request: PortfolioReplayRequest) =>
			runPortfolioReplay(request),
	});
}
