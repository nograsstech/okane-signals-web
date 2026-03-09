import { useMemo, useState } from "react";
import { useTrades } from "@/hooks/use-trades";
import { TradesTable } from "./trades-table";
import { TradesFilterBar } from "./trades-filter-bar";
import { TradesLoadingSkeleton } from "./trades-loading-skeleton";
import { TradesErrorState } from "./trades-error-state";

const defaultFilters = {
	ticker: "all",
	actionType: "all" as "buy" | "sell" | "close" | "all",
	startDate: "",
	endDate: "",
	search: "",
};

export default function TradesContent() {
	const [filters, setFilters] = useState(defaultFilters);
	const [pagination, setPagination] = useState({ page: 1, pageSize: 25 });

	// Filter out "all" values before passing to API
	const apiParams = {
		...(filters.ticker !== "all" && { ticker: filters.ticker }),
		...(filters.actionType !== "all" && { actionType: filters.actionType }),
		...(filters.startDate && { startDate: filters.startDate }),
		...(filters.endDate && { endDate: filters.endDate }),
		...(filters.search && { search: filters.search }),
		page: pagination.page,
		pageSize: pagination.pageSize,
	};

	const { data, isLoading, error, refetch } = useTrades(apiParams);

	// Extract unique tickers from trades data for filter dropdown
	const availableTickers = useMemo(() => {
		if (!data?.trades) return [];
		const tickers = new Set(data.trades.map((trade) => trade.ticker));
		return Array.from(tickers).sort();
	}, [data?.trades]);

	// Reset to page 1 when filters change
	const handleFiltersChange = (newFilters: typeof defaultFilters) => {
		setFilters(newFilters);
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	// Reset all filters
	const handleReset = () => {
		setFilters(defaultFilters);
		setPagination({ page: 1, pageSize: 25 });
	};

	if (isLoading) {
		return <TradesLoadingSkeleton />;
	}

	if (error) {
		return <TradesErrorState error={error} onRetry={() => refetch()} />;
	}

	return (
		<div className="min-h-screen p-4 sm:p-6">
			{/* Header */}
			<div className="flex flex-col gap-2 mb-6 sm:mb-8">
				<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
					Trading Signals
				</h2>
				<p className="text-sm text-muted-foreground">
					Global view of all trading signals across strategies
				</p>
			</div>

			{/* Filters */}
			<TradesFilterBar
				filters={filters}
				onFiltersChange={handleFiltersChange}
				onReset={handleReset}
				availableTickers={availableTickers}
			/>

			{/* Table */}
			{data && data.trades.length > 0 ? (
				<TradesTable
					trades={data.trades}
					pagination={data.pagination}
					onPaginationChange={setPagination}
				/>
			) : (
				<EmptyState onReset={handleReset} />
			)}
		</div>
	);
}

function EmptyState({ onReset }: { onReset: () => void }) {
	return (
		<div className="relative p-12 border border-border/50 rounded-lg bg-muted/20 text-center">
			{/* Corner brackets */}
			<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-border/30" />
			<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-border/30" />
			<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-border/30" />
			<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-border/30" />

			<div className="flex flex-col items-center gap-4">
				<div className="p-3 rounded-full bg-muted/50">
					<div className="w-8 h-8 text-muted-foreground" />
				</div>
				<div>
					<h3 className="text-lg font-semibold mb-1">No Trading Signals Found</h3>
					<p className="text-sm text-muted-foreground mb-4">
						{onReset
							? "Try adjusting your filters or create a new strategy to generate signals."
							: "Create a strategy to start generating trading signals."}
					</p>
					{onReset && (
						<button
							type="button"
							onClick={onReset}
							className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
						>
							Clear Filters
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
