import { createFileRoute } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import TradesContent from "@/components/trades/trades-content";

export const Route = createFileRoute("/trades/")({
	component: TradesPage,
});

function TradesPage() {
	return (
		<Layout>
			<ProtectedRoute>
				<TradesContent />
			</ProtectedRoute>
		</Layout>
	);
}
