import {
	ArrowDown,
	ArrowLeftRight,
	ArrowUp,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TradeWithBacktest } from "@/lib/types/strategy";
import { useState } from "react";

interface TradesTableProps {
	trades: TradeWithBacktest[];
	pagination?: {
		page: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
	onPaginationChange?: (pagination: { page: number; pageSize: number }) => void;
}

// Helper to format numeric values
function formatNumeric(value: number | null | undefined): string {
	if (value === null || value === undefined) return "N/A";
	if (typeof value === "string") {
		const num = Number.parseFloat(value);
		return Number.isNaN(num) ? "N/A" : num.toFixed(2);
	}
	return value.toFixed(2);
}

// Helper to format datetime
function formatDatetime(date: Date): string {
	return new Date(date).toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

// Column definitions
const columns: ColumnDef<TradeWithBacktest>[] = [
	{
		accessorKey: "datetime",
		header: "Datetime",
		cell: ({ getValue }) => (
			<span className="font-mono text-xs">
				{formatDatetime(getValue() as Date)}
			</span>
		),
	},
	{
		accessorKey: "ticker",
		header: "Ticker",
		cell: ({ row }) => (
			<div className="flex flex-col">
				<Badge variant="outline" className="w-fit text-xs font-mono">
					{row.original.ticker}
				</Badge>
				<span className="text-[9px] text-muted-foreground font-mono mt-0.5">
					{row.original.strategy}
				</span>
			</div>
		),
	},
	{
		accessorKey: "trade_action",
		header: "Action",
		cell: ({ getValue }) => {
			const action = getValue() as "buy" | "sell" | "close";
			const config = {
				buy: { icon: ArrowUp, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "BUY" },
				sell: { icon: ArrowDown, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", label: "SELL" },
				close: { icon: ArrowLeftRight, color: "text-muted-foreground", bg: "bg-muted", border: "border-border/30", label: "CLOSE" },
			};
			const { icon: Icon, color, bg, border, label } = config[action];

			return (
				<Badge className={`${color} ${bg} ${border} gap-1.5 font-mono text-[10px] font-semibold`}>
					<Icon className="w-3 h-3" />
					{label}
				</Badge>
			);
		},
	},
	{
		accessorKey: "entry_price",
		header: "Entry Price",
		cell: ({ getValue }) => (
			<span className="font-mono text-xs tabular-nums">
				{formatNumeric(getValue() as number | null)}
			</span>
		),
	},
	{
		accessorKey: "price",
		header: "Price",
		cell: ({ getValue }) => (
			<span className="font-mono text-xs tabular-nums">
				{formatNumeric(getValue() as number | null)}
			</span>
		),
	},
	{
		accessorKey: "tp",
		header: "Take Profit",
		cell: ({ getValue }) => (
			<span className="font-mono text-xs tabular-nums">
				{formatNumeric(getValue() as number | null)}
			</span>
		),
	},
	{
		accessorKey: "sl",
		header: "Stop Loss",
		cell: ({ getValue }) => (
			<span className="font-mono text-xs tabular-nums">
				{formatNumeric(getValue() as number | null)}
			</span>
		),
	},
	{
		accessorKey: "size",
		header: "Size",
		cell: ({ getValue }) => (
			<span className="font-mono text-xs tabular-nums">
				{formatNumeric(getValue() as number | null)}
			</span>
		),
	},
];

export function TradesTable({ trades, pagination, onPaginationChange }: TradesTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const table = useReactTable({
		data: trades,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		state: {
			sorting,
			columnFilters,
		},
	});

	return (
		<div>
			{/* Table */}
			<div className="relative border border-border/50 rounded-lg overflow-hidden">
				{/* Corner brackets */}
				<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-border/30" />
				<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-border/30" />
				<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-border/30" />
				<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-border/30" />

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-muted/30">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className="px-3 py-3 text-left text-[10px] font-mono font-semibold tracking-wider uppercase text-muted-foreground"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="hover:bg-muted/30 transition-colors border-b border-border/30 last:border-b-0 h-14"
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												className="px-3 py-3 text-sm"
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										))}
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={columns.length}
										className="h-24 text-center text-muted-foreground font-mono text-xs"
									>
										No trades found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{pagination && onPaginationChange && (
				<div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
					<div className="text-xs text-muted-foreground font-mono">
						Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{" "}
						{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{" "}
						{pagination.totalCount} trades
					</div>

					<div className="flex items-center gap-2">
						{/* Page size selector */}
						<Select
							value={String(pagination.pageSize)}
							onValueChange={(value) =>
								onPaginationChange({ ...pagination, pageSize: Number.parseInt(value, 10), page: 1 })
							}
						>
							<SelectTrigger className="h-8 w-[70px] font-mono text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="10">10</SelectItem>
								<SelectItem value="25">25</SelectItem>
								<SelectItem value="50">50</SelectItem>
								<SelectItem value="100">100</SelectItem>
							</SelectContent>
						</Select>

						{/* Page navigation */}
						<div className="flex items-center gap-1">
							<Button
								variant="outline"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => onPaginationChange({ ...pagination, page: 1 })}
								disabled={pagination.page === 1}
							>
								<ChevronLeft className="w-4 h-4" />
								<ChevronLeft className="w-4 h-4 -ml-2.5" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => onPaginationChange({ ...pagination, page: pagination.page - 1 })}
								disabled={pagination.page === 1}
							>
								<ChevronLeft className="w-4 h-4" />
							</Button>
							<span className="text-sm font-mono px-2">
								Page {pagination.page} of {pagination.totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => onPaginationChange({ ...pagination, page: pagination.page + 1 })}
								disabled={pagination.page === pagination.totalPages}
							>
								<ChevronRight className="w-4 h-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => onPaginationChange({ ...pagination, page: pagination.totalPages })}
								disabled={pagination.page === pagination.totalPages}
							>
								<ChevronRight className="w-4 h-4" />
								<ChevronRight className="w-4 h-4 -ml-2.5" />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
