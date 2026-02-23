// Loading skeleton for tables
import { Skeleton } from "@/components/ui/skeleton";

export function TableLoadingSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center">
				<Skeleton className="h-10 w-64 max-w-sm" />
			</div>

			<div className="relative rounded-md border border-border/50">
				<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-foreground/20" />
				<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-foreground/20" />
				<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-foreground/20" />
				<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-foreground/20" />

				<div className="border-b border-border/30">
					<div className="flex h-14 px-4">
						{[1, 2, 3, 4, 5, 6, 7].map((i) => (
							<div key={i} className="flex-1 pr-4">
								<Skeleton className="h-4 w-full" />
							</div>
						))}
					</div>
				</div>

				{[1, 2, 3, 4, 5].map((i) => (
					<div key={i} className="flex h-14 px-4 border-b border-border/20">
						{[1, 2, 3, 4, 5, 6, 7].map((j) => (
							<div key={j} className="flex-1 pr-4">
								<Skeleton className="h-4 w-full" />
							</div>
						))}
					</div>
				))}
			</div>

			<div className="flex items-center justify-end gap-2">
				<Skeleton className="h-9 w-24" />
				<Skeleton className="h-9 w-24" />
				<Skeleton className="h-9 w-24" />
			</div>
		</div>
	);
}
