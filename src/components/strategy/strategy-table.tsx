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
import { ArrowDown, ArrowUp, ArrowUpDown, Bell, BellOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/utils/storage";
import { useNotificationToggle } from "@/hooks/use-notification-toggle";

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
	const [columnFilters, setColumnFilters] = useState<{ id: string; value: unknown }[]>(
		[],
	);

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
		setColumnFilters(tickerFilter ? [{ id: "ticker", value: tickerFilter }] : []);
	}, [tickerFilter]);

	const columns = useMemo<ColumnDef<KeyStrategyBacktestStats & { "✨": string }>[]>(
		() => [
		{ accessorKey: "✨", header: "✨ Top Performer", size: 120 },
		{
			id: "notifications",
			header: "Notifications",
			size: 100,
			cell: ({ row }) => {
				const item = row.original as KeyStrategyBacktestStats;
				return (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							notificationToggle.mutate({
								id: item.id,
								notificationsOn: !item.notificationsOn,
							});
						}}
						className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded transition-colors"
						aria-label={`Toggle notifications for ${item.strategy}`}
					>
						{item.notificationsOn ? (
							<Bell className="w-4 h-4 text-primary" />
						) : (
							<BellOff className="w-4 h-4 text-muted-foreground" />
						)}
						<Switch
							checked={item.notificationsOn}
							onChange={() => {}}
							className="pointer-events-none data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/50"
						/>
					</button>
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
			sortingFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)),
			cell: ({ getValue }) => {
				const value = Number(`${getValue()}`);
				return value.toFixed(2);
			},
		},
		{
			accessorKey: "returnPercentage",
			header: "Return %",
			sortingFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)),
			cell: ({ getValue }) => (Number(`${getValue()}`) as number).toFixed(2),
		},
		{
			accessorKey: "averageDrawdownPercentage",
			header: "Avg Drawdown %",
			sortingFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)),
			cell: ({ getValue }) => (Number(`${getValue()}`) as number).toFixed(2),
		},
		{
			accessorKey: "sharpeRatio",
			header: "Sharpe Ratio",
			sortingFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)),
			cell: ({ getValue }) => (Number(`${getValue()}`) as number).toFixed(2),
		},
	], [notificationToggle.mutate]);

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
		<div className="mt-8">
			<div className="mb-4 flex flex-col sm:flex-row items-center gap-3">
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

			<div className="relative rounded-md border border-border/50">
				<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-foreground/20" />
				<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-foreground/20" />
				<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-foreground/20" />
				<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-foreground/20" />

				<div className="w-full overflow-x-auto">
					<table className="w-full min-w-200">
						<thead className="border-b border-border/30">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className="px-4 py-3 text-left text-sm font-mono uppercase tracking-wider whitespace-nowrap"
										>
											{header.column.getCanSort() ? (
												<button
													type="button"
													onClick={header.column.getToggleSortingHandler()}
													className="flex items-center gap-2 hover:text-accent-foreground"
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
									className="border-b border-border/20 hover:bg-muted/50 cursor-pointer"
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
												"px-4 py-4 h-14 whitespace-nowrap",
												getCellClass(cell.getValue(), cell.column.id),
											)}
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
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
				<span className="text-sm font-mono">
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
