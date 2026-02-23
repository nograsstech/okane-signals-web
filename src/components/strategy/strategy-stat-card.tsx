// Individual strategy stat card with terminal aesthetic
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";

interface StrategyStatCardProps {
	field: string;
	value: string | number;
	description: string;
	icon?: LucideIcon;
	textColor?: "positive" | "negative" | "neutral";
}

export function StrategyStatCard({
	field,
	value,
	description,
	icon: Icon,
	textColor = "neutral",
}: StrategyStatCardProps) {
	const renderValue = () => {
		if (typeof value === "number") {
			return value.toFixed(2);
		}
		return value;
	};

	const getValueClass = () => {
		if (typeof value !== "number") return "";
		if (textColor === "positive") return "text-emerald-500";
		if (textColor === "negative") return "text-red-500";
		return "";
	};

	return (
		<Card className="relative p-4 bg-background/50 border border-border/50">
			{/* Corner accents for terminal aesthetic */}
			<div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-foreground/20" />
			<div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-foreground/20" />

			<CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
				<CardTitle className="text-sm font-mono uppercase tracking-wider">
					{field}
				</CardTitle>
				{Icon && <Icon className="text-foreground/50 h-4 w-4" />}
			</CardHeader>
			<CardContent className="p-0">
				<div className={cn("text-2xl font-bold font-mono", getValueClass())}>
					{renderValue()}
				</div>
				<p className="text-foreground/50 text-xs mt-1 max-w-48">
					{description}
				</p>
			</CardContent>
		</Card>
	);
}
