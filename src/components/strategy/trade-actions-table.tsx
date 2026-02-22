// Trade actions table component
import { useState } from "react";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type ColumnDef,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowDownToDot,
	ArrowUpDown,
	ArrowUp,
	ArrowUpFromDot,
	Dot,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { TradeAction } from "@/lib/types/strategy";

interface TradeActionsTableProps {
	tradeActionsData: TradeAction[];
}

export function TradeActionsTable({
	tradeActionsData,
}: TradeActionsTableProps) {
	// Sort by datetime descending
	const sortedData = [...tradeActionsData].sort(
		(a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
	);

	const [sorting, setSorting] = useState<SortingState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [globalFilter, setGlobalFilter] = useState("");

	const columns: ColumnDef<TradeAction>[] = [
		{
			accessorKey: "trade_action",
			header: "Trade Action",
			cell: ({ getValue }) => {
				const action = getValue() as string;
				if (action === "buy") {
					return (
						<Badge className="bg-emerald-500/10 text-emerald-500">
							<ArrowUpFromDot className="mr-1 h-4 w-4" /> Buy
						</Badge>
					);
				}
				if (action === "sell") {
					return (
						<Badge className="bg-red-500/10 text-red-500">
							<ArrowDownToDot className="mr-1 h-4 w-4" /> Sell
						</Badge>
					);
				}
				return (
					<Badge variant="secondary">
						<Dot className="mr-1 h-4 w-4" /> Close
					</Badge>
				);
			},
		},
		{
			accessorKey: "datetime",
			header: "Time",
			cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
		},
		{
			accessorKey: "entry_price",
			header: "Entry Price",
			cell: ({ getValue }) => (getValue() ? getValue() : "N/A"),
		},
		{
			accessorKey: "price",
			header: "Price",
			cell: ({ getValue }) => (getValue() ? getValue() : "N/A"),
		},
		{
			accessorKey: "tp",
			header: "Take Profit",
			cell: ({ getValue }) => (getValue() ? getValue() : "N/A"),
		},
		{
			accessorKey: "sl",
			header: "Stop Loss",
			cell: ({ getValue }) => (getValue() ? getValue() : "N/A"),
		},
		{
			accessorKey: "size",
			header: "Size",
			cell: ({ getValue }) => (getValue() ? getValue() : "N/A"),
		},
	];

	const table = useReactTable({
		data: sortedData,
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

	return (
		<div className="space-y-4">
			<div className="flex items-center">
				<Input
					placeholder="Filter by date..."
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
								className="border-b border-border/20 hover:bg-muted/50"
							>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="px-4 py-4 h-14">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-end gap-2">
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
