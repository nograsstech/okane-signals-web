import { useNavigate } from "@tanstack/react-router";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { Activity, ArrowUpRight, Bell, Clock, Target, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/utils/storage";

interface StrategyGridProps {
	data: KeyStrategyBacktestStats[];
}

// Compute top performer badges
function computeTopPerformer(item: KeyStrategyBacktestStats): string {
	let badges = "";
	if (item.sharpeRatio > 1.5 && item.winRate >= 0.5) badges += "✨";
	if (item.sharpeRatio > 1.5) badges += " ↑SR";
	if (item.winRate >= 0.5) badges += " ↑WR";
	return badges.trim();
}

export function StrategyGrid({ data }: StrategyGridProps) {
	const navigate = useNavigate();

	// Initialize state from storage
	const [sorting, setSorting] = useState<SortingState>(() => {
		const saved = storage.get<SortingState>("strategy-sort-grid");
		return saved ?? [{ id: "winRate", desc: true }];
	});

	const [pagination, setPagination] = useState<PaginationState>(() => {
		const savedPageIndex = storage.getSession<number>("strategy-page-grid");
		return {
			pageIndex: savedPageIndex ?? 0,
			pageSize: 12, // More items for grid
		};
	});

	const [globalFilter, setGlobalFilter] = useState("");

	// Persist state changes
	useEffect(() => {
		storage.set("strategy-sort-grid", sorting);
	}, [sorting]);

	useEffect(() => {
		storage.setSession("strategy-page-grid", pagination.pageIndex);
	}, [pagination.pageIndex]);

	// Setup table for data management (filtering, pagination, sorting)
	const columns = useMemo(() => [
		{ accessorKey: "strategy" },
		{ accessorKey: "ticker" },
		{ accessorKey: "period" },
		{ accessorKey: "interval" },
		{ accessorKey: "winRate", sortingFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)) },
		{ accessorKey: "returnPercentage", sortingFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)) },
		{ accessorKey: "averageDrawdownPercentage", sortingFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)) },
		{ accessorKey: "sharpeRatio", sortingFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)) },
	], []);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			pagination,
			globalFilter,
		},
	});

	const formatPercent = (val: number | string) => {
		return (Number(val)).toFixed(2) + "%";
	};

	const formatDecimal = (val: number | string) => {
		return (Number(val)).toFixed(2);
	};

	return (
		<div className="mt-8 flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<Input
					placeholder="Filter Strategies..."
					value={globalFilter}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="max-w-sm bg-background/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50"
				/>
				
				{/* Simple Sort Dropdown/Buttons could go here, for now using default sort. */}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
				{table.getRowModel().rows.map((row) => {
					const item = row.original as KeyStrategyBacktestStats;
					const badges = computeTopPerformer(item);
					const winRateVal = Number(item.winRate);
					const returnVal = Number(item.returnPercentage);
					const drawdownVal = Number(item.averageDrawdownPercentage);
					const sharpeVal = Number(item.sharpeRatio);

					return (
						<button
							type="button"
							key={item.id}
							onClick={() =>
								navigate({
									to: "/strategy/$id",
									params: { id: item.id },
								})
							}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									navigate({
										to: "/strategy/$id",
										params: { id: item.id },
									});
								}
							}}
							className="group relative flex flex-col justify-between p-5 cursor-pointer 
                                bg-card hover:bg-muted/30 border border-border/40 hover:border-border/80 
                                transition-all duration-300 ease-out z-10 
                                shadow-sm hover:shadow-md overflow-hidden rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 text-left w-full h-full"
						>
							{/* Subtle background gradient on hover */}
							<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
							
							<div className="flex flex-col gap-4 w-full">
								<div className="flex justify-between items-start w-full">
									<div className="space-y-1">
										<h3 className="font-semibold text-lg leading-tight tracking-tight text-foreground flex items-center gap-2">
											{item.strategy}
											{item.notificationsOn && <Bell className="w-3.5 h-3.5 text-primary animate-pulse" />}
										</h3>
										<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
											<Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50">{item.ticker}</Badge>
											<span>{item.period}</span>
											<span className="opacity-50">•</span>
											<span>{item.interval}</span>
										</div>
									</div>
									<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shrink-0">
										<ArrowUpRight className="w-4 h-4 text-primary" />
									</div>
								</div>

								{badges && (
									<div className="flex">
										<Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-[10px] font-mono">
											{badges}
										</Badge>
									</div>
								)}

								<div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-2 w-full">
									<div className="space-y-1">
										<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
											<Target className="w-3 h-3" /> Win Rate
										</span>
										<div className={cn("text-lg font-mono tracking-tight", winRateVal >= 50 ? "text-emerald-500" : "text-red-500")}>
											{formatPercent(winRateVal)}
										</div>
									</div>

									<div className="space-y-1">
										<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
											<Activity className="w-3 h-3" /> Return
										</span>
										<div className={cn("text-lg font-mono tracking-tight", returnVal >= 0 ? "text-emerald-500" : "text-red-500")}>
											{returnVal >= 0 ? "+" : ""}{formatPercent(returnVal)}
										</div>
									</div>

									<div className="space-y-1">
										<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
											<TrendingDown className="w-3 h-3" /> Max DD
										</span>
										<div className={cn("text-sm font-mono tracking-tight", drawdownVal >= -10 ? "text-emerald-500" : "text-red-500")}>
											{formatPercent(drawdownVal)}
										</div>
									</div>

									<div className="space-y-1">
										<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
											<TrendingUp className="w-3 h-3" /> Sharpe
										</span>
										<div className={cn("text-sm font-mono tracking-tight", sharpeVal >= 1 ? "text-emerald-500" : "text-yellow-500")}>
											{formatDecimal(sharpeVal)}
										</div>
									</div>
								</div>
							</div>
						</button>
					);
				})}
			</div>

			{/* Pagination */}
			{table.getPageCount() > 1 && (
				<div className="flex items-center justify-between border-t border-border/30 pt-4 mt-2">
					<span className="text-sm font-mono text-muted-foreground">
						Page {pagination.pageIndex + 1} of {table.getPageCount()}
					</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className="font-mono text-xs border-border/50 hover:bg-muted/50"
						>
							Prev
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className="font-mono text-xs border-border/50 hover:bg-muted/50"
						>
							Next
						</Button>
					</div>
				</div>
			)}

			{table.getRowModel().rows.length === 0 && (
				<div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-xl border-border/50 opacity-50">
					<Clock className="w-10 h-10 mb-4 text-muted-foreground" />
					<p className="text-lg font-medium text-foreground">No strategies found</p>
					<p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
				</div>
			)}
		</div>
	);
}
