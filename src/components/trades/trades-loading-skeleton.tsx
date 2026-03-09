import { Skeleton } from "@/components/ui/skeleton";

export function TradesLoadingSkeleton() {
	return (
		<div className="min-h-screen p-4 sm:p-6">
			{/* Header skeleton */}
			<div className="flex flex-col gap-2 mb-6 sm:mb-8">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-64" />
			</div>

			{/* Filter bar skeleton */}
			<div className="flex flex-wrap gap-3 mb-6">
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-10 w-40" />
				<Skeleton className="h-10 w-40" />
				<Skeleton className="h-10 w-48" />
			</div>

			{/* Table skeleton */}
			<div className="relative border border-border/50 rounded-lg overflow-hidden">
				{/* Corner brackets */}
				<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-border/30" />
				<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-border/30" />
				<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-border/30" />
				<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-border/30" />

				{/* Header row */}
				<div className="flex items-center gap-4 p-3 border-b border-border/50 bg-muted/30">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={`header-${i}`} className="h-4 flex-1" />
					))}
				</div>

				{/* Data rows */}
				{Array.from({ length: 25 }).map((_, rowIndex) => (
					<div
						key={`row-${rowIndex}`}
						className="flex items-center gap-4 p-3 border-b border-border/30 last:border-b-0 h-14"
					>
						{Array.from({ length: 8 }).map((_, cellIndex) => (
							<Skeleton key={`cell-${rowIndex}-${cellIndex}`} className="h-4 flex-1" />
						))}
					</div>
				))}
			</div>

			{/* Pagination skeleton */}
			<div className="flex items-center justify-between mt-4">
				<Skeleton className="h-8 w-48" />
				<div className="flex gap-2">
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-8 w-20" />
				</div>
			</div>
		</div>
	);
}
