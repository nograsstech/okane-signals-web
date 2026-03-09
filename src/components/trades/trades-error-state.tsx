import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Error as ErrorResponse } from "@tanstack/react-query";

interface TradesErrorStateProps {
	error: ErrorResponse | null;
	onRetry?: () => void;
}

export function TradesErrorState({ error, onRetry }: TradesErrorStateProps) {
	return (
		<div className="min-h-screen p-4 sm:p-6">
			{/* Header */}
			<div className="flex flex-col gap-2 mb-6 sm:mb-8">
				<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
					Trading Signals
				</h2>
				<p className="text-sm text-muted-foreground">
					Global view of all trading signals across strategies
				</p>
			</div>

			{/* Error state */}
			<div className="relative p-6 border border-red-500/30 bg-red-500/5 rounded-lg">
				{/* Corner brackets */}
				<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-500/30" />
				<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-500/30" />
				<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-500/30" />
				<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-500/30" />

				<div className="flex items-start gap-4">
					<div className="shrink-0">
						<div className="p-2 rounded-lg bg-red-500/10">
							<AlertCircle className="w-5 h-5 text-red-500" />
						</div>
					</div>

					<div className="flex-1">
						<h3 className="text-lg font-semibold text-red-500 mb-1">
							Error Loading Trading Signals
						</h3>
						<p className="text-sm text-foreground/70 mb-4">
							{error?.message || "An unexpected error occurred while fetching trades data."}
						</p>

						{onRetry && (
							<Button
								variant="outline"
								size="sm"
								onClick={onRetry}
								className="gap-2 border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
							>
								<RefreshCw className="w-4 h-4" />
								Retry
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
