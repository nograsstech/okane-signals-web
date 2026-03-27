import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Activity, ArrowUpRight, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FavoriteStrategyConfig } from "@/lib/types/favorite";
import { FavoriteToggle } from "./favorite-toggle";

interface FavoriteWithStats extends FavoriteStrategyConfig {
	backtestId: string | null;
	winRate: number | null;
	returnPercentage: number | null;
	sharpeRatio: number | null;
	lastUpdated: Date | string | null;
}

interface FavoriteCardsProps {
	favorites: FavoriteWithStats[];
	sortBy?: "winRate" | "return" | "sharpe" | "createdAt";
	className?: string;
}

const FavoriteCards = React.forwardRef<HTMLDivElement, FavoriteCardsProps>(
	({ favorites, className = "" }, ref) => {
		const formatPercent = (val: number) => Number(val).toFixed(2) + "%";
		const formatDecimal = (val: number) => Number(val).toFixed(2);

		return (
			<div
				ref={ref}
				className={cn(
					"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr",
					className,
				)}
			>
				{favorites.map((item) => {
					const winRateVal = item.winRate !== null ? Number(item.winRate) : null;
					const returnVal = item.returnPercentage !== null ? Number(item.returnPercentage) : null;
					const sharpeVal = item.sharpeRatio !== null ? Number(item.sharpeRatio) : null;

					return (
						<div
							key={`${item.ticker}-${item.strategy}-${item.period}-${item.interval}`}
							className="group relative flex flex-col bg-card border border-border/40 hover:border-border/80 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:shadow-lg"
						>
							{/* Top gradient accent */}
							<div className="h-1 bg-linear-to-r from-primary/60 via-primary to-primary/60" />

							{/* Header */}
							<div className="p-4 pb-3 border-b border-border/20">
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0 flex-1">
										<h3
											className="font-semibold text-base leading-tight tracking-tight text-foreground truncate pr-2"
											title={item.strategy}
										>
											{item.strategy}
										</h3>
										<div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
											<Badge className="text-[10px] px-1.5 py-0 font-medium bg-muted/70 text-foreground border-border/60">
												{item.ticker}
											</Badge>
											<span className="text-[10px] text-muted-foreground font-mono">
												{item.period}
											</span>
											<span className="text-[10px] text-muted-foreground/50">•</span>
											<span className="text-[10px] text-muted-foreground font-mono">
												{item.interval}
											</span>
										</div>
									</div>
									<FavoriteToggle
										config={{
											ticker: item.ticker,
											strategy: item.strategy,
											period: item.period,
											interval: item.interval,
										}}
										variant="ghost"
										size="icon"
										ariaLabel="Remove from favorites"
									/>
								</div>
							</div>

							{/* Stats Grid */}
							<div className="p-4 flex-1">
								{winRateVal !== null || returnVal !== null || sharpeVal !== null ? (
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-0.5">
											<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
												<Target className="w-3 h-3" /> Win Rate
											</span>
											<div
												className={cn(
													"text-base font-mono tracking-tight font-medium",
													winRateVal !== null && winRateVal >= 50 ? "text-emerald-500" : "text-red-500",
												)}
											>
												{winRateVal !== null ? formatPercent(winRateVal) : "—"}
											</div>
										</div>

										<div className="space-y-0.5">
											<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
												<Activity className="w-3 h-3" /> Return
											</span>
											<div
												className={cn(
													"text-base font-mono tracking-tight font-medium",
													returnVal !== null && returnVal >= 0 ? "text-emerald-500" : "text-red-500",
												)}
											>
												{returnVal !== null
													? `${returnVal >= 0 ? "+" : ""}${formatPercent(returnVal)}`
													: "—"}
											</div>
										</div>

										<div className="space-y-0.5">
											<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
												<TrendingDown className="w-3 h-3" /> Sharpe
											</span>
											<div
												className={cn(
													"text-sm font-mono tracking-tight",
													sharpeVal !== null && sharpeVal >= 1
														? "text-emerald-500"
														: "text-yellow-500",
												)}
											>
												{sharpeVal !== null ? formatDecimal(sharpeVal) : "—"}
											</div>
										</div>

										{item.lastUpdated && (
											<div className="space-y-0.5">
												<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
													<TrendingUp className="w-3 h-3" /> Updated
												</span>
												<div className="text-[10px] text-muted-foreground font-mono">
													{new Date(item.lastUpdated as string | Date).toLocaleDateString()}
												</div>
											</div>
										)}
									</div>
								) : (
									<div className="flex items-center justify-center h-full py-4">
										<p className="text-xs text-muted-foreground">No backtest data</p>
									</div>
								)}
							</div>

							{/* Footer Action */}
							{item.backtestId && (
								<div className="flex items-center divide-x divide-border/20">
									<Link
										to="/strategy/$id"
										params={{ id: String(item.backtestId) }}
										className="flex items-center justify-between flex-1 px-4 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors group/btn"
									>
										<span className="text-xs font-medium text-foreground/70 group-hover/btn:text-foreground transition-colors">
											View Details
										</span>
										<ArrowUpRight className="w-4 h-4 text-foreground/50 group-hover/btn:text-foreground group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
									</Link>
								</div>
							)}
						</div>
					);
				})}
			</div>
		);
	},
);

FavoriteCards.displayName = "FavoriteCards";

export { FavoriteCards };
export type { FavoriteWithStats };
