// Strategy table with sorting, filtering, pagination, and persistent state

import { useNavigate } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Bell, BellOff, Heart } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIsFavorite } from "@/hooks/use-favorites";
import { toast } from "sonner";
import { StrategyDeleteButton } from "@/components/strategy/strategy-delete-button";
import { FavoriteToggle } from "@/components/favorite/favorite-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useNotificationToggle } from "@/hooks/use-notification-toggle";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/utils/storage";
import { useIsFavorite } from "@/hooks/use-favorites";

interface StrategyTableProps {
	data: KeyStrategyBacktestStats[];
}

// Compute top performer badges
function computeTopPerformer(item: KeyStrategyBacktestStats): string {
	let badges = "";
	if (item.sharpeRatio > 1.5 && item.winRate >= 0.5) badges += "✨ ";
	if (item.sharpeRatio > 1.5) badges += "↑SR ";
	if (item.winRate >= 0.5) badges += "↑WR ";
	return badges;
}

export function StrategyTable({ data }: StrategyTableProps) {
	const navigate = useNavigate();
	const notificationToggle = useNotificationToggle();

	// Optimistic state for notifications - tracks pending toggle states
	const [optimisticNotifications, setOptimisticNotifications] = useState<
		Map<string, boolean>
	>(new Map());

	// Add computed fields
	const enrichedData = useMemo(
		() =>
			data.map((item) => ({
				...item,
				"✨": computeTopPerformer(item),
			})),
		[data],
	);

	// Initialize state from storage
	const [sorting, setSorting] = useState<SortingState>(() => {
		const saved = storage.get<SortingState>("strategy-sort");
		return saved ?? [{ id: "winRate", desc: true }];
	});

	const [pageSize, setPageSize] = useState<number>(() => {
		const saved = storage.get<number>("strategy-page-size");
		return saved ?? 20;
	});

	const [pagination, setPagination] = useState<PaginationState>(() => {
		const savedPageIndex = storage.getSession<number>("strategy-page");
		return {
			pageIndex: savedPageIndex ?? 0,
			pageSize: pageSize,
		};
	});

	const [globalFilter, setGlobalFilter] = useState("");
	const [tickerFilter, setTickerFilter] = useState("");
	const [columnFilters, setColumnFilters] = useState<
		{ id: string; value: unknown }[]
	>([]);

	// Persist state changes
	useEffect(() => {
		storage.set("strategy-sort", sorting);
	}, [sorting]);

	useEffect(() => {
		storage.setSession("strategy-page", pagination.pageIndex);
	}, [pagination.pageIndex]);

	useEffect(() => {
		storage.set("strategy-page-size", pageSize);
		setPagination((prev) => ({ ...prev, pageSize }));
	}, [pageSize]);

	useEffect(() => {
		setColumnFilters(
			tickerFilter ? [{ id: "ticker", value: tickerFilter }] : [],
		);
	}, [tickerFilter]);

	// Helper to handle notification toggle with optimistic updates
	const handleToggleNotification = useCallback(
		(id: string, currentState: boolean) => {
			const newState = !currentState;

			// Optimistic update - update UI immediately
			setOptimisticNotifications((prev) => new Map(prev).set(id, newState));

			// Track when the toggle started for minimum animation time
			const toggleStartTime = Date.now();
			const MIN_ANIMATION_MS = 300;

			// Trigger mutation in background
			notificationToggle.mutate(
				{ id, notificationsOn: newState },
				{
					onError: () => {
						// Rollback on error
						setOptimisticNotifications((prev) => {
							const next = new Map(prev);
							next.delete(id);
							return next;
						});
						toast.error("Failed to update notifications", {
							description: "Please try again.",
						});
					},
					onSuccess: () => {
						// Ensure minimum time for smooth animation before clearing optimistic state
						const elapsed = Date.now() - toggleStartTime;
						const remainingDelay = Math.max(0, MIN_ANIMATION_MS - elapsed);

						setTimeout(() => {
							setOptimisticNotifications((prev) => {
								const next = new Map(prev);
								next.delete(id);
								return next;
							});
						}, remainingDelay);
					},
				},
			);
		},
		[notificationToggle],
	);

	const columns = useMemo<
		ColumnDef<KeyStrategyBacktestStats & { "✨": string }>[]
	>(
		() => [
			{ accessorKey: "✨", header: "✨ Top Performer", size: 120 },
			{
				id: "favorite",
				header: "",
				size: 80,
				cell: ({ row }) => {
					const item = row.original as KeyStrategyBacktestStats;
					const { isFavorite } = useIsFavorite({
						ticker: item.ticker,
						strategy: item.strategy,
						period: item.period,
						interval: item.interval,
					});
					return (
						<FavoriteToggle
							config={{
								ticker: item.ticker,
								strategy: item.strategy,
								period: item.period,
								interval: item.interval,
							}}
							variant="ghost"
							size="icon"
							onClick={(e) => e.stopPropagation()}
							ariaLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
						/>
					);
				},
			},
			{
				id: "notifications",
				header: "Notifications",
				size: 100,
				cell: ({ row }) => {
					const item = row.original as KeyStrategyBacktestStats;
					// Use optimistic state if available, otherwise use actual state
					const notificationsOn =
						optimisticNotifications.get(item.id) ?? item.notificationsOn;
					return (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handleToggleNotification(item.id, notificationsOn);
							}}
							data-enabled={notificationsOn}
							className="hover:bg-muted/50 flex items-center gap-2 rounded px-2 py-1 transition-all duration-300 ease-out will-change-[background-color]"
							aria-label={`Toggle notifications for ${item.strategy}`}
						>
							{notificationsOn ? (
								<Bell className="text-primary h-4 w-4 transition-colors duration-300 ease-out" />
							) : (
								<BellOff className="text-muted-foreground h-4 w-4 transition-colors duration-300 ease-out" />
							)}
							<Switch
								checked={notificationsOn}
								onChange={() => {}}
								className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/50 pointer-events-none transition-colors duration-300 ease-out"
							/>
						</button>
					);
				},
			},
			{
				id: "actions",
				header: "",
				size: 60,
				cell: ({ row }) => {
					const item = row.original as KeyStrategyBacktestStats;
					return (
						<div className="flex items-center justify-center">
							<StrategyDeleteButton
								id={item.id}
								strategy={item.strategy}
								ticker={item.ticker}
								variant="icon"
							/>
						</div>
					);
				},
			},
			{ accessorKey: "strategy", header: "Strategy" },
			{ accessorKey: "ticker", header: "Ticker" },
			{ accessorKey: "period", header: "Period" },
			{ accessorKey: "interval", header: "Interval" },
			{
				accessorKey: "winRate",
				header: "Win Rate %",
				sortingFn: (a, b, id) =>
					Number(a.getValue(id)) - Number(b.getValue(id)),
				cell: ({ getValue }) => {
					const value = Number(`${getValue()}`);
					return value.toFixed(2);
				},
			},
			{
				accessorKey: "returnPercentage",
				header: "Return %",
				sortingFn: (a, b, id) =>
					Number(a.getValue(id)) - Number(b.getValue(id)),
				cell: ({ getValue }) => (Number(`${getValue()}`) as number).toFixed(2),
			},
			{
				accessorKey: "averageDrawdownPercentage",
				header: "Avg Drawdown %",
				sortingFn: (a, b, id) =>
					Number(a.getValue(id)) - Number(b.getValue(id)),
				cell: ({ getValue }) => (Number(`${getValue()}`) as number).toFixed(2),
			},
			{
				accessorKey: "sharpeRatio",
				header: "Sharpe Ratio",
				sortingFn: (a, b, id) =>
					Number(a.getValue(id)) - Number(b.getValue(id)),
				cell: ({ getValue }) => (Number(`${getValue()}`) as number).toFixed(2),
			},
		],
		[handleToggleNotification, optimisticNotifications],
	);

	const table = useReactTable({
		data: enrichedData,
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
			columnFilters,
		},
	});

	// Get cell color class based on value and column
	const getCellClass = (value: any, columnId: string) => {
		const numValue =
			typeof value === "number" ? value : parseFloat(String(value));
		if (Number.isNaN(numValue)) return "";

		// Win rate specific
		if (columnId === "winRate") {
			return numValue >= 50 ? "text-emerald-500" : "text-red-500";
		}
		// Drawdown specific
		if (columnId === "averageDrawdownPercentage") {
			return numValue >= -10 ? "text-emerald-500" : "text-red-500";
		}
		// General positive/negative
		return numValue >= 0 ? "text-emerald-500" : "text-red-500";
	};

	return (
		<div className="mt-8 w-full max-w-full overflow-hidden">
			<div className="mb-4 flex flex-col items-center gap-3 sm:flex-row">
				<Input
					placeholder="Filter by Ticker..."
					value={tickerFilter}
					onChange={(e) => setTickerFilter(e.target.value)}
					className="max-w-sm"
				/>
				<Input
					placeholder="Filter Okane Signals..."
					value={globalFilter}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="max-w-sm"
				/>
				<Select
					value={String(pageSize)}
					onValueChange={(value) => setPageSize(Number(value))}
				>
					<SelectTrigger className="w-30">
						<SelectValue placeholder="Per page" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="10">10 / page</SelectItem>
						<SelectItem value="20">20 / page</SelectItem>
						<SelectItem value="50">50 / page</SelectItem>
						<SelectItem value="100">100 / page</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="border-border/50 relative rounded-md border overflow-hidden">
				<div className="border-foreground/20 absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2" />
				<div className="border-foreground/20 absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2" />
				<div className="border-foreground/20 absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2" />
				<div className="border-foreground/20 absolute bottom-0 right-0 h-3 w-3 border-r-2 border-b-2" />

				<div className="w-full overflow-x-auto">
					<table className="w-full">
						<thead className="border-border/30 border-b">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className="px-4 py-3 text-left font-mono text-sm tracking-wider whitespace-nowrap uppercase"
										>
											{header.column.getCanSort() ? (
												<button
													type="button"
													onClick={header.column.getToggleSortingHandler()}
													className="hover:text-accent-foreground flex items-center gap-2"
												>
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
													{header.column.getIsSorted() === "asc" && (
														<ArrowUp className="h-4 w-4" />
													)}
													{header.column.getIsSorted() === "desc" && (
														<ArrowDown className="h-4 w-4" />
													)}
													{header.column.getIsSorted() === false && (
														<ArrowUpDown className="h-4 w-4" />
													)}
												</button>
											) : (
												flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)
											)}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody>
							{table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className="border-border/20 hover:bg-muted/50 cursor-pointer border-b"
									onClick={() =>
										navigate({
											to: "/strategy/$id",
											params: {
												id: (row.original as KeyStrategyBacktestStats).id,
											},
										})
									}
								>
									{row.getVisibleCells().map((cell) => (
										<td
											key={cell.id}
											className={cn(
												"h-14 px-4 py-4 whitespace-nowrap",
												getCellClass(cell.getValue(), cell.column.id),
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-end gap-2 py-4">
				<span className="font-mono text-sm">
					Page {pagination.pageIndex + 1} of {table.getPageCount()}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
