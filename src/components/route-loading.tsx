import { Activity, Database, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface RouteLoadingProps {
	strategyId?: string;
}

export function RouteLoadingPage({ strategyId }: RouteLoadingProps) {
	const [dataPoints, setDataPoints] = useState<string[]>([]);
	const [currentPhase, setCurrentPhase] = useState(0);

	const phases = [
		{ icon: Database, text: "Connecting to data feed" },
		{ icon: Activity, text: "Processing backtest signals" },
		{ icon: Loader2, text: "Rendering visualization" },
	];

	useEffect(() => {
		// Generate streaming data effect
		const interval = setInterval(() => {
			setDataPoints((prev) => {
				const newPoint = (Math.random() * 100).toFixed(2);
				const updated = [newPoint, ...prev].slice(0, 8);
				return updated;
			});
		}, 150);

		// Cycle through phases
		const phaseInterval = setInterval(() => {
			setCurrentPhase((prev) => (prev + 1) % phases.length);
		}, 2000);

		return () => {
			clearInterval(interval);
			clearInterval(phaseInterval);
		};
	}, []);

	const CurrentIcon = phases[currentPhase].icon;

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-lg">
				{/* Main loading container */}
				<div className="relative bg-card/50 border border-border/50 overflow-hidden">
					{/* Corner brackets - consistent with project aesthetic */}
					<div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/50" />
					<div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/50" />
					<div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/50" />
					<div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/50" />

					{/* Scanline effect */}
					<div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.02)_51%)] bg-[length:100%_4px] animate-pulse" />

					{/* Header */}
					<div className="border-b border-border/50 bg-muted/30 px-6 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="relative">
									<div className="h-8 w-8 bg-primary/10 flex items-center justify-center">
										<CurrentIcon className="h-4 w-4 text-primary" />
									</div>
									<div className="absolute -inset-1 border border-primary/20 animate-ping opacity-20" />
								</div>
								<div>
									<p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
										Loading Backtest
									</p>
									<p className="font-mono text-sm font-medium text-foreground">
										{phases[currentPhase].text}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
								<span className="font-mono text-xs text-muted-foreground">LIVE</span>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="p-6 space-y-6">
						{/* Strategy ID display */}
						{strategyId && (
							<div className="flex items-center justify-between border-b border-border/30 pb-4">
								<span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
									Strategy ID
								</span>
								<span className="font-mono text-sm font-semibold text-primary">
									#{strategyId}
								</span>
							</div>
						)}

						{/* Data stream visualization */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Data Stream
								</span>
								<span className="font-mono text-[10px] text-muted-foreground">
									{dataPoints.length} packets
								</span>
							</div>
							<div className="relative bg-muted/30 border border-border/30 p-4 font-mono text-xs overflow-hidden">
								{/* Corner accents */}
								<div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-primary/30" />
								<div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-primary/30" />

								{/* Streaming numbers */}
								<div className="space-y-1">
									{dataPoints.map((point, i) => (
										<div
											key={`${point}-${i}`}
											className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300"
											style={{
												animationDelay: `${i * 50}ms`,
												opacity: 1 - i * 0.1,
											}}
										>
											<span className="text-muted-foreground">
												{String(i + 1).padStart(2, "0")}
											</span>
											<span className="text-foreground/70">{point}</span>
											<span
												className={parseFloat(point) > 50 ? "text-emerald-500" : "text-red-500"}
											>
												{parseFloat(point) > 50 ? "+" : "-"}
												{Math.abs(parseFloat(point) - 50).toFixed(2)}%
											</span>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Progress bar */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Progress
								</span>
								<span className="font-mono text-[10px] text-primary animate-pulse">
									PROCESSING
								</span>
							</div>
							<div className="h-1 bg-muted/50 overflow-hidden">
								<div className="h-full bg-primary/60 animate-[shimmer_2s_infinite] relative overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="border-t border-border/50 bg-muted/20 px-6 py-3">
						<p className="font-mono text-[10px] text-center text-muted-foreground">
							Backend API • Data retrieval in progress
						</p>
					</div>
				</div>

				{/* Decorative grid lines */}
				<div className="absolute inset-0 pointer-events-none -z-10">
					<div
						className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-[0.02]"
						style={{
							backgroundImage: `
								linear-gradient(to right, currentColor 1px, transparent 1px),
								linear-gradient(to bottom, currentColor 1px, transparent 1px)
							`,
							backgroundSize: "20px 20px",
						}}
					/>
				</div>
			</div>
		</div>
	);
}
