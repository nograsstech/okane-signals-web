import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

interface ProtectedRouteProps {
	children: React.ReactNode;
	redirectTo?: string;
}

export function ProtectedRoute({
	children,
	redirectTo = "/auth",
}: ProtectedRouteProps) {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isPending && !session?.user) {
			navigate({ to: redirectTo });
		}
	}, [session, isPending, navigate, redirectTo]);

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
					<p className="text-xs font-mono text-foreground/50 uppercase tracking-widest">
						Verifying Access...
					</p>
				</div>
			</div>
		);
	}

	if (!session?.user) {
		return null;
	}

	return <>{children}</>;
}
