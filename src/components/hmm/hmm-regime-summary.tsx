import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { HMMRegimeSummary } from "@/lib/okane-finance-api/generated";
import { DominantRegime } from "@/lib/okane-finance-api/generated";

interface HmmRegimeSummaryProps {
	summary: HMMRegimeSummary;
}

const REGIME_CONFIG = {
	[DominantRegime.Bull]: {
		label: "BULL",
		color: "text-emerald-400",
		borderColor: "border-emerald-500/30",
		bgColor: "bg-emerald-500/10",
		barColor: "bg-emerald-500",
		icon: TrendingUp,
	},
	[DominantRegime.Bear]: {
		label: "BEAR",
		color: "text-red-400",
		borderColor: "border-red-500/30",
		bgColor: "bg-red-500/10",
		barColor: "bg-red-500",
		icon: TrendingDown,
	},
	[DominantRegime.Chop]: {
		label: "CHOP",
		color: "text-amber-400",
		borderColor: "border-amber-500/30",
		bgColor: "bg-amber-500/10",
		barColor: "bg-amber-500",
		icon: Minus,
	},
} as const;

const CONFIDENCE_COLOR: Record<string, string> = {
	HIGH: "text-emerald-400",
	MEDIUM: "text-amber-400",
	LOW: "text-red-400",
};

function ProbBar({
	label,
	value,
	barClass,
	textClass,
}: {
	label: string;
	value: number;
	barClass: string;
	textClass: string;
}) {
	return (
		<div className="flex items-center gap-2 min-w-0">
			<span
				className={`font-mono text-[10px] tracking-widest uppercase w-10 shrink-0 ${textClass}`}
			>
				{label}
			</span>
			<div className="flex-1 h-1.5 bg-border/20 rounded-full overflow-hidden">
				<div
					className={`h-full rounded-full transition-all duration-700 ${barClass}`}
					style={{ width: `${value}%` }}
				/>
			</div>
			<span className="font-mono text-[10px] tabular-nums text-foreground/60 w-12 text-right shrink-0">
				{value.toFixed(1)}%
			</span>
		</div>
	);
}

export function HmmRegimeSummary({ summary }: HmmRegimeSummaryProps) {
	const regime = REGIME_CONFIG[summary.currentRegime];
	const RegimeIcon = regime.icon;
	const confidenceColor =
		CONFIDENCE_COLOR[summary.confidence] ?? "text-foreground/60";

	return (
		<div
			className={`relative p-4 border ${regime.borderColor} ${regime.bgColor}`}
		>
			{/* Corner accents */}
			<div
				className={`absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 ${regime.borderColor}`}
			/>
			<div
				className={`absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 ${regime.borderColor}`}
			/>
			<div
				className={`absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 ${regime.borderColor}`}
			/>
			<div
				className={`absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 ${regime.borderColor}`}
			/>

			<div className="flex flex-col lg:flex-row lg:items-center gap-4">
				{/* Regime badge */}
				<div className="flex items-center gap-3 shrink-0">
					<div
						className={`flex items-center justify-center w-10 h-10 rounded ${regime.bgColor} border ${regime.borderColor}`}
					>
						<RegimeIcon size={20} className={regime.color} strokeWidth={2.5} />
					</div>
					<div className="flex flex-col">
						<span className="text-foreground/50 font-mono text-[9px] tracking-widest uppercase">
							Current Regime
						</span>
						<span
							className={`font-mono text-lg font-bold tracking-wider ${regime.color}`}
						>
							{regime.label}
						</span>
					</div>
					<div className="border-l border-border/30 pl-3 ml-1 flex flex-col">
						<span className="text-foreground/50 font-mono text-[9px] tracking-widest uppercase">
							Confidence
						</span>
						<div className="flex items-baseline gap-1">
							<span
								className={`font-mono text-sm font-bold ${confidenceColor}`}
							>
								{summary.confidence}
							</span>
							<span className="font-mono text-xs text-foreground/40 tabular-nums">
								{summary.confidenceScore.toFixed(1)}%
							</span>
						</div>
					</div>
				</div>

				{/* Probability bars */}
				<div className="flex-1 flex flex-col gap-1.5 min-w-0">
					<ProbBar
						label="Bull"
						value={summary.probBull}
						barClass="bg-emerald-500"
						textClass="text-emerald-400"
					/>
					<ProbBar
						label="Bear"
						value={summary.probBear}
						barClass="bg-red-500"
						textClass="text-red-400"
					/>
					<ProbBar
						label="Chop"
						value={summary.probChop}
						barClass="bg-amber-500"
						textClass="text-amber-400"
					/>
				</div>

				{/* Strategy */}
				<div className="shrink-0 max-w-xs">
					<span className="text-foreground/50 font-mono text-[9px] tracking-widest uppercase block mb-1">
						Recommended Strategy
					</span>
					<span className="font-mono text-xs text-foreground/80 leading-relaxed">
						{summary.recommendedStrategy}
					</span>
				</div>
			</div>
		</div>
	);
}
