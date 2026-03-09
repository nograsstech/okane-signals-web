import { Search, X } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface TradesFilterBarProps {
	filters: {
		ticker: string;
		actionType: "buy" | "sell" | "close" | "all";
		startDate: string;
		endDate: string;
		search: string;
	};
	onFiltersChange: (filters: TradesFilterBarProps["filters"]) => void;
	onReset: () => void;
	availableTickers?: string[];
}

const ACTION_TYPES = [
	{ value: "all", label: "All Actions" },
	{ value: "buy", label: "Buy" },
	{ value: "sell", label: "Sell" },
	{ value: "close", label: "Close" },
];

export function TradesFilterBar({
	filters,
	onFiltersChange,
	onReset,
	availableTickers = [],
}: TradesFilterBarProps) {
	const tickerId = useId();
	const actionTypeId = useId();
	const startDateId = useId();
	const endDateId = useId();
	const searchId = useId();

	const updateFilter = (key: keyof TradesFilterBarProps["filters"], value: string) => {
		onFiltersChange({ ...filters, [key]: value });
	};

	const hasActiveFilters =
		filters.ticker !== "all" ||
		filters.actionType !== "all" ||
		filters.startDate ||
		filters.endDate ||
		filters.search;

	return (
		<div className="relative mb-6">
			{/* Corner brackets */}
			<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-border/30" />
			<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-border/30" />
			<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-border/30" />
			<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-border/30" />

			<div className="border border-border/50 rounded-lg bg-muted/20 p-4">
				<div className="flex flex-wrap gap-3 items-end">
					{/* Ticker Filter */}
					<div className="flex flex-col gap-1.5">
						<label htmlFor={tickerId} className="text-[10px] font-mono font-semibold tracking-wider uppercase text-muted-foreground">
							Ticker
						</label>
						<Select
							value={filters.ticker}
							onValueChange={(value) => updateFilter("ticker", value)}
						>
							<SelectTrigger className="h-9 w-[140px] font-mono text-xs" id={tickerId}>
								<SelectValue placeholder="All Tickers" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Tickers</SelectItem>
								{availableTickers.map((ticker) => (
									<SelectItem key={ticker} value={ticker}>
										{ticker}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Action Type Filter */}
					<div className="flex flex-col gap-1.5">
						<label htmlFor={actionTypeId} className="text-[10px] font-mono font-semibold tracking-wider uppercase text-muted-foreground">
							Action Type
						</label>
						<Select
							value={filters.actionType}
							onValueChange={(value) =>
								updateFilter("actionType", value as "buy" | "sell" | "close" | "all")
							}
						>
							<SelectTrigger className="h-9 w-[140px] font-mono text-xs" id={actionTypeId}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ACTION_TYPES.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Date Range - Start */}
					<div className="flex flex-col gap-1.5">
						<label htmlFor={startDateId} className="text-[10px] font-mono font-semibold tracking-wider uppercase text-muted-foreground">
							Start Date
						</label>
						<Input
							type="date"
							id={startDateId}
							value={filters.startDate}
							onChange={(e) => updateFilter("startDate", e.target.value)}
							className="h-9 w-[160px] font-mono text-xs"
						/>
					</div>

					{/* Date Range - End */}
					<div className="flex flex-col gap-1.5">
						<label htmlFor={endDateId} className="text-[10px] font-mono font-semibold tracking-wider uppercase text-muted-foreground">
							End Date
						</label>
						<Input
							type="date"
							id={endDateId}
							value={filters.endDate}
							onChange={(e) => updateFilter("endDate", e.target.value)}
							className="h-9 w-[160px] font-mono text-xs"
						/>
					</div>

					{/* Global Search */}
					<div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
						<label htmlFor={searchId} className="text-[10px] font-mono font-semibold tracking-wider uppercase text-muted-foreground">
							Search
						</label>
						<div className="relative">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								type="text"
								id={searchId}
								placeholder="Search ticker or strategy..."
								value={filters.search}
								onChange={(e) => updateFilter("search", e.target.value)}
								className="h-9 pl-8 font-mono text-xs"
							/>
						</div>
					</div>

					{/* Clear Filters Button */}
					{hasActiveFilters && (
						<Button
							variant="outline"
							size="sm"
							onClick={onReset}
							className="h-9 gap-2 font-mono text-xs border-border/50 hover:bg-muted/50"
						>
							<X className="w-3.5 h-3.5" />
							Clear Filters
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
