import type {
	PortfolioReplayRequest,
	PortfolioReplayResponse,
} from "@/lib/types/portfolio-replay";

export async function runPortfolioReplay(
	request: PortfolioReplayRequest,
): Promise<PortfolioReplayResponse> {
	const response = await fetch("/api/portfolio-replay", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(request),
	});

	const payload = (await response.json().catch(() => null)) as
		| PortfolioReplayResponse
		| { error?: string }
		| null;
	if (!response.ok) {
		throw new Error(
			payload && "error" in payload ? payload.error : "Portfolio replay failed",
		);
	}
	return payload as PortfolioReplayResponse;
}
