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
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/utils/storage";

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

// Get notification badge
function getNotificationBadge(item: KeyStrategyBacktestStats): string {
	return item.notificationsOn ? "🔔" : "";
}

export function StrategyTable({ data }: StrategyTableProps) {
	const navigate = useNavigate();

	// Add computed fields
	const enrichedData = data.map((item) => ({
		...item,
		"✨": computeTopPerformer(item),
		"🔔": getNotificationBadge(item),
	}));

	// Initialize state from storage
	const [sorting, setSorting] = useState<SortingState>(() => {
		const saved = storage.get<SortingState>("strategy-sort");
		return saved ?? [{ id: "winRate", desc: true }];
	});

	const [pagination, setPagination] = useState<PaginationState>(() => {
		const savedPageIndex = storage.getSession<number>("strategy-page");
		return {
			pageIndex: savedPageIndex ?? 0,
			pageSize: 10,
		};
	});

	const [globalFilter, setGlobalFilter] = useState("");

	// Persist state changes
	useEffect(() => {
		storage.set("strategy-sort", sorting);
	}, [sorting]);

	useEffect(() => {
		storage.setSession("strategy-page", pagination.pageIndex);
	}, [pagination.pageIndex]);

	const columns: ColumnDef<
		KeyStrategyBacktestStats & { "✨": string; "🔔": string }
	>[] = [
		{ accessorKey: "🔔", header: "🔔", size: 50 },
		{ accessorKey: "✨", header: "✨ Top Performer", size: 120 },
		{ accessorKey: "strategy", header: "Strategy" },
		{ accessorKey: "ticker", header: "Ticker" },
		{ accessorKey: "period", header: "Period" },
		{ accessorKey: "interval", header: "Interval" },
		{
			accessorKey: "winRate",
			header: "Win Rate %",
			cell: ({ getValue }) => {
				const value = (Number(`${getValue()}`)) * 100;
				return value.toFixed(2);
			},
		},
		{
			accessorKey: "returnPercentage",
			header: "Return %",
			cell: ({ getValue }) => (Number(`${getValue()}`) as number).toFixed(2),
		},
		{
			accessorKey: "averageDrawdownPercentage",
			header: "Avg Drawdown %",
			cell: ({ getValue }) => (Number(`${getValue()}`) as number).toFixed(2),
		},
		{
			accessorKey: "sharpeRatio",
			header: "Sharpe Ratio",
			cell: ({ getValue }) => (Number(`${getValue()}`) as number).toFixed(2),
		},
	];

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
			<div className="mb-4 flex items-center">
				<Input
					placeholder="Filter Okane Signals..."
					value={globalFilter}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			<div className="relative rounded-md border border-border/50">
				<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-foreground/20" />
				<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-foreground/20" />
				<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-foreground/20" />
				<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-foreground/20" />

				<table className="w-full">
					<thead className="border-b border-border/30">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-4 py-3 text-left text-sm font-mono uppercase tracking-wider"
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
											"px-4 py-4 h-14",
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
