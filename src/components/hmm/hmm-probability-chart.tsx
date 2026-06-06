import { useMemo, useEffect, useRef } from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Customized,
	ResponsiveContainer,
} from "recharts";
import type { HMMRegimeDataPoint } from "@/lib/okane-finance-api/generated";

interface HmmProbabilityChartProps {
	data: HMMRegimeDataPoint[];
	activeDateStr?: string | null;
	onCrosshairMove?: (dateStr: string | null) => void;
	visibleRange?: { from: string; to: string } | null;
	onWheelZoom?: (deltaY: number) => void;
}

interface ChartDataPoint {
	date: string;
	dateLabel: string;
	probBull: number;
	probBear: number;
	probChop: number;
}

const MAX_CHART_POINTS = 500;

function downsample(points: HMMRegimeDataPoint[]): HMMRegimeDataPoint[] {
	if (points.length <= MAX_CHART_POINTS) return points;
	const result: HMMRegimeDataPoint[] = [];
	const step = (points.length - 1) / (MAX_CHART_POINTS - 1);
	for (let i = 0; i < MAX_CHART_POINTS; i++) {
		result.push(points[Math.round(i * step)]);
	}
	return result;
}

function formatDate(timestamp: string): string {
	const d = new Date(timestamp);
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "2-digit",
	});
}

type BandScale = ((value: string) => number | undefined) & {
	bandwidth?: () => number;
};

type CustomizedChartProps = {
	xAxisMap?: Record<string, { scale?: BandScale }>;
	offset?: { top: number; height: number };
	activeDateStr?: string;
};

type TooltipPayloadEntry = {
	name: string;
	value: number;
	color: string;
};

function CustomTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: TooltipPayloadEntry[];
	label?: string;
}) {
	if (!active || !payload?.length) return null;

	return (
		<div className="bg-background/95 border border-border/50 rounded px-3 py-2 shadow-xl backdrop-blur-sm">
			<div className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider mb-2">
				{label}
			</div>
			{payload.map((entry) => (
				<div
					key={entry.name}
					className="flex items-center justify-between gap-4 py-0.5"
				>
					<div className="flex items-center gap-1.5">
						<div
							className="w-2 h-2 rounded-sm shrink-0"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="font-mono text-[10px] uppercase tracking-wider text-foreground/60">
							{entry.name}
						</span>
					</div>
					<span className="font-mono text-[11px] tabular-nums text-foreground/90">
						{Number(entry.value).toFixed(1)}%
					</span>
				</div>
			))}
		</div>
	);
}

export function HmmProbabilityChart({
	data,
	activeDateStr,
	onCrosshairMove,
	visibleRange,
	onWheelZoom,
}: HmmProbabilityChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const allChartData: ChartDataPoint[] = useMemo(
		() =>
			downsample(data).map((point) => ({
				date: point.timestamp.split("T")[0],
				dateLabel: formatDate(point.timestamp),
				probBull: Number(point.probBull.toFixed(2)),
				probBear: Number(point.probBear.toFixed(2)),
				probChop: Number(point.probChop.toFixed(2)),
			})),
		[data],
	);

	const chartData = useMemo(() => {
		if (!visibleRange) return allChartData;
		return allChartData.filter(
			(p) => p.date >= visibleRange.from && p.date <= visibleRange.to,
		);
	}, [allChartData, visibleRange]);

	// ReferenceLine x must exactly match a category in chartData — snap to nearest
	const snappedActiveDateStr = useMemo(() => {
		if (!activeDateStr || chartData.length === 0) return null;
		const target = new Date(activeDateStr).getTime();
		let nearest = chartData[0];
		let minDiff = Math.abs(new Date(chartData[0].date).getTime() - target);
		for (const point of chartData) {
			const diff = Math.abs(new Date(point.date).getTime() - target);
			if (diff < minDiff) {
				minDiff = diff;
				nearest = point;
			}
		}
		return nearest.date;
	}, [activeDateStr, chartData]);

	// Non-passive wheel listener so preventDefault works correctly
	useEffect(() => {
		const el = containerRef.current;
		if (!el || !onWheelZoom) return;
		const handler = (e: WheelEvent) => {
			e.preventDefault();
			onWheelZoom(e.deltaY);
		};
		el.addEventListener("wheel", handler, { passive: false });
		return () => el.removeEventListener("wheel", handler);
	}, [onWheelZoom]);

	const tickInterval = Math.max(1, Math.floor(chartData.length / 8));

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between px-1">
				<span className="font-mono text-[9px] tracking-widest uppercase text-foreground/40">
					Regime Probabilities
				</span>
				<div className="flex items-center gap-3">
					{(
						[
							{ label: "Bull", color: "#10b981" },
							{ label: "Bear", color: "#ef4444" },
							{ label: "Chop", color: "#f59e0b" },
						] as const
					).map(({ label, color }) => (
						<div key={label} className="flex items-center gap-1.5">
							<div
								className="w-2 h-2 rounded-sm shrink-0"
								style={{ backgroundColor: color }}
							/>
							<span className="font-mono text-[9px] tracking-wider uppercase text-foreground/40">
								{label}
							</span>
						</div>
					))}
				</div>
			</div>

			<div
				ref={containerRef}
				className="w-full h-52 rounded border border-border/20 overflow-hidden"
			>
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={chartData}
						margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
						style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
						onMouseMove={(e) => {
							if (e.activeLabel) onCrosshairMove?.(e.activeLabel as string);
						}}
						onMouseLeave={() => onCrosshairMove?.(null)}
					>
						<defs>
							<linearGradient id="gradBull" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
								<stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
							</linearGradient>
							<linearGradient id="gradBear" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
								<stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
							</linearGradient>
							<linearGradient id="gradChop" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
								<stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
							</linearGradient>
						</defs>

						<CartesianGrid
							strokeDasharray="2 4"
							stroke="rgba(255,255,255,0.04)"
							vertical={false}
						/>

						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							padding={{ left: 16, right: 16 }}
							tick={{
								fill: "rgba(156,163,175,0.5)",
								fontSize: 9,
								fontFamily: "inherit",
							}}
							tickFormatter={(val: string) => {
								const d = new Date(val);
								return d.toLocaleDateString("en-US", {
									month: "short",
									year: "2-digit",
								});
							}}
							interval={tickInterval}
						/>

						<YAxis
							tickLine={false}
							axisLine={false}
							tick={{
								fill: "rgba(156,163,175,0.5)",
								fontSize: 9,
								fontFamily: "inherit",
							}}
							domain={[0, 100]}
							tickFormatter={(v: number) => `${v}%`}
							ticks={[0, 25, 50, 75, 100]}
						/>

						<Tooltip
							content={<CustomTooltip />}
							cursor={{
								stroke: "rgba(255,255,255,0.15)",
								strokeWidth: 1,
								strokeDasharray: "3 3",
							}}
						/>

						<Area
							type="monotone"
							dataKey="probBull"
							name="Bull"
							stackId="1"
							stroke="#10b981"
							strokeWidth={1.5}
							fill="url(#gradBull)"
							dot={false}
							activeDot={{ r: 3, fill: "#10b981", stroke: "none" }}
							isAnimationActive={false}
						/>
						<Area
							type="monotone"
							dataKey="probBear"
							name="Bear"
							stackId="1"
							stroke="#ef4444"
							strokeWidth={1.5}
							fill="url(#gradBear)"
							dot={false}
							activeDot={{ r: 3, fill: "#ef4444", stroke: "none" }}
							isAnimationActive={false}
						/>
						<Area
							type="monotone"
							dataKey="probChop"
							name="Chop"
							stackId="1"
							stroke="#f59e0b"
							strokeWidth={1.5}
							fill="url(#gradChop)"
							dot={false}
							activeDot={{ r: 3, fill: "#f59e0b", stroke: "none" }}
							isAnimationActive={false}
						/>

						{snappedActiveDateStr && (
							<Customized
								activeDateStr={snappedActiveDateStr}
								component={({
									xAxisMap,
									offset,
									activeDateStr: dateStr,
								}: CustomizedChartProps) => {
									if (!dateStr) return null;
									const scale =
										Object.values(xAxisMap ?? {})[0]?.scale;
									if (!scale) return null;
									const left = scale(dateStr);
									if (left == null || Number.isNaN(left)) return null;
									const bw = scale.bandwidth?.() ?? 0;
									const cx = left + bw / 2;
									const y1 = offset?.top ?? 0;
									const y2 = (offset?.top ?? 0) + (offset?.height ?? 200);
									return (
										<line
											x1={cx}
											x2={cx}
											y1={y1}
											y2={y2}
											stroke="rgba(255,255,255,0.65)"
											strokeWidth={1}
											strokeDasharray="3 3"
											pointerEvents="none"
										/>
									);
								}}
							/>
						)}
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
