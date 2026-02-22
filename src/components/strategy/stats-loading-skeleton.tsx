// Loading skeleton for strategy stats

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsLoadingSkeleton() {
	return (
		<Card className="relative p-6 bg-background/50 border border-border/50">
			<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-foreground/20" />
			<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-foreground/20" />
			<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-foreground/20" />
			<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-foreground/20" />

			<CardHeader className="flex flex-col items-start justify-between md:flex-row">
				<div className="w-full max-w-md space-y-2">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="mt-4 h-10 w-48 md:mt-0" />
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex flex-wrap gap-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="relative w-48 p-4 bg-background/30 border border-border/30"
						>
							<div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-foreground/20" />
							<div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-foreground/20" />
							<Skeleton className="h-4 w-24 mb-2" />
							<Skeleton className="h-8 w-32" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
