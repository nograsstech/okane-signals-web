import { useEffect, useRef } from "react";
import {
	createChart,
	ColorType,
	CrosshairMode,
	LineSeries,
} from "lightweight-charts";
import type { HMMRegimeDataPoint } from "@/lib/okane-finance-api/generated";
import { DominantRegime } from "@/lib/okane-finance-api/generated";

interface HmmPriceChartProps {
	data: HMMRegimeDataPoint[];
	onCrosshairMove?: (dateStr: string | null) => void;
}

const REGIME_COLORS: Record<DominantRegime, string> = {
	[DominantRegime.Bull]: "#10b981",
	[DominantRegime.Bear]: "#ef4444",
	[DominantRegime.Chop]: "#f59e0b",
};

function toChartTime(timestamp: string): string {
	// Extract YYYY-MM-DD from ISO timestamp, handling potential duplicates
	return timestamp.split("T")[0];
}

export function HmmPriceChart({ data, onCrosshairMove }: HmmPriceChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

	useEffect(() => {
		if (!containerRef.current || data.length === 0) return;

		const container = containerRef.current;

		const chart = createChart(container, {
			layout: {
				background: { type: ColorType.Solid, color: "transparent" },
				textColor: "rgba(156,163,175,0.8)",
				fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
				fontSize: 10,
			},
			grid: {
				vertLines: { color: "rgba(255,255,255,0.04)" },
				horzLines: { color: "rgba(255,255,255,0.04)" },
			},
			crosshair: {
				mode: CrosshairMode.Normal,
				vertLine: {
					color: "rgba(255,255,255,0.2)",
					width: 1,
					style: 3,
					labelBackgroundColor: "rgba(30,30,30,0.9)",
				},
				horzLine: {
					color: "rgba(255,255,255,0.2)",
					width: 1,
					style: 3,
					labelBackgroundColor: "rgba(30,30,30,0.9)",
				},
			},
			rightPriceScale: {
				borderColor: "rgba(255,255,255,0.08)",
				textColor: "rgba(156,163,175,0.7)",
			},
			timeScale: {
				borderColor: "rgba(255,255,255,0.08)",
				timeVisible: false,
				secondsVisible: false,
			},
			handleScroll: { mouseWheel: true, pressedMouseMove: true },
			handleScale: { mouseWheel: true, pinch: true },
			width: container.clientWidth,
			height: container.clientHeight,
		});

		chartRef.current = chart;

		// Deduplicate by date (keep last occurrence if duplicates)
		const seen = new Map<string, HMMRegimeDataPoint>();
		for (const point of data) {
			seen.set(toChartTime(point.timestamp), point);
		}
		const deduped = Array.from(seen.values()).sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);

		const series = chart.addSeries(LineSeries, {
			lineWidth: 2,
			lastValueVisible: true,
			priceLineVisible: false,
		});

		series.setData(
			deduped.map((point) => ({
				time: toChartTime(point.timestamp),
				value: point.close,
				color: REGIME_COLORS[point.dominantRegime],
			})),
		);

		chart.timeScale().fitContent();

		// Crosshair sync
		if (onCrosshairMove) {
			chart.subscribeCrosshairMove((param) => {
				if (!param.time) {
					onCrosshairMove(null);
					return;
				}
				onCrosshairMove(param.time as string);
			});
		}

		// Resize observer
		const ro = new ResizeObserver(() => {
			if (container) {
				chart.applyOptions({
					width: container.clientWidth,
					height: container.clientHeight,
				});
			}
		});
		ro.observe(container);

		return () => {
			ro.disconnect();
			chart.remove();
			chartRef.current = null;
		};
	}, [data, onCrosshairMove]);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between px-1">
				<span className="font-mono text-[9px] tracking-widest uppercase text-foreground/40">
					Price · Regime Colored
				</span>
				<div className="flex items-center gap-3">
					{(
						[
							{ label: "Bull", color: "bg-emerald-500" },
							{ label: "Bear", color: "bg-red-500" },
							{ label: "Chop", color: "bg-amber-500" },
						] as const
					).map(({ label, color }) => (
						<div key={label} className="flex items-center gap-1.5">
							<div className={`w-3 h-0.5 rounded-full ${color}`} />
							<span className="font-mono text-[9px] tracking-wider uppercase text-foreground/40">
								{label}
							</span>
						</div>
					))}
				</div>
			</div>
			<div
				ref={containerRef}
				className="w-full h-72 rounded border border-border/20"
			/>
		</div>
	);
}
