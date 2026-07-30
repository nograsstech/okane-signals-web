import { createFileRoute } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PortfolioContent from "@/components/portfolio/portfolio-content";

export const Route = createFileRoute("/portfolio/")({
	component: PortfolioPage,
});

function PortfolioPage() {
	return (
		<Layout>
			<ProtectedRoute>
				<PortfolioContent />
			</ProtectedRoute>
		</Layout>
	);
}
