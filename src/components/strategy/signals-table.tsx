// Trading signals table component
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
	ArrowUpDown,
	ArrowUp,
	ArrowDownToDot,
	ArrowUpFromDot,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { SignalResponseDTO } from "@/lib/types/strategy";

interface SignalsTableProps {
	signalsData: { signals: SignalResponseDTO };
}

export function SignalsTable({ signalsData }: SignalsTableProps) {
	const formattedData = signalsData.signals.data.signals.allSignals
		.map((signal) => ({
			...signal,
			gmtTime: new Date(signal.gmtTime),
		}))
		.reverse();

	const [sorting, setSorting] = useState<SortingState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [globalFilter, setGlobalFilter] = useState("");

	const columns: ColumnDef<(typeof formattedData)[0]>[] = [
		{
			accessorKey: "totalSignal",
			header: "Trade Signal",
			cell: ({ getValue }) => {
				const signal = getValue() as number;
				if (signal === 2) {
					return (
						<Badge className="bg-emerald-500/10 text-emerald-500">
							<ArrowUpFromDot className="mr-1 h-4 w-4" /> Buy
						</Badge>
					);
				}
				if (signal === 1) {
					return (
						<Badge className="bg-red-500/10 text-red-500">
							<ArrowDownToDot className="mr-1 h-4 w-4" /> Sell
						</Badge>
					);
				}
				return null;
			},
		},
		{
			accessorKey: "gmtTime",
			header: "Time",
			cell: ({ getValue }) => new Date(getValue() as Date).toLocaleString(),
		},
		{
			accessorKey: "open",
			header: "Open",
			cell: ({ getValue }) => (getValue() ? getValue() : "N/A"),
		},
		{
			accessorKey: "high",
			header: "High",
			cell: ({ getValue }) => (getValue() ? getValue() : "N/A"),
		},
		{
			accessorKey: "low",
			header: "Low",
			cell: ({ getValue }) => (getValue() ? getValue() : "N/A"),
		},
		{
			accessorKey: "close",
			header: "Close",
			cell: ({ getValue }) => (getValue() ? getValue() : "N/A"),
		},
		{
			accessorKey: "volume",
			header: "Volume",
			cell: ({ getValue }) => (getValue() ? getValue() : "N/A"),
		},
	];

	const table = useReactTable({
		data: formattedData,
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
