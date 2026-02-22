import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/strategy_/$id/backtest")({
	component: StrategyBacktestPage,
});

function StrategyBacktestPage() {
	const { id } = Route.useParams();

	return (
		<Layout>
			<ProtectedRoute>
				<div className="flex flex-col h-[calc(100vh-4rem)] p-4">
					<div className="mb-4">
						<Link to="/strategy/$id" params={{ id }}>
							<Button variant="link" className="px-0">
								<ChevronLeft className="h-4 w-4 mr-1" />
								<span>Back to Strategy Details</span>
							</Button>
						</Link>
					</div>

					<div className="flex-1 rounded-lg border border-border/50 overflow-hidden bg-background">
						<iframe
							src={`/api/strategy/${id}/backtest`}
							title={`Backtest Strategy ${id}`}
							className="w-full h-full border-none"
							sandbox="allow-scripts allow-same-origin"
						/>
					</div>
				</div>
			</ProtectedRoute>
		</Layout>
	);
}
