// TradingView-style trading chart component with candlesticks and trade markers

import { useEffect, useRef, useState } from "react";
import { createChart, createSeriesMarkers, CandlestickSeries, type IChartApi, type ISeriesApi, type Time, type ISeriesMarkersPluginApi } from "lightweight-charts";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useChartData } from "./hooks/use-chart-data";
import { useChartResize } from "./hooks/use-chart-resize";
import { getChartOptions, CANDLESTICK_OPTIONS } from "./utils/chart-config";
import type { TradingChartProps } from "./types/chart.types";

// Timeframe options for the selector (days back filter)
interface TimeframeOption {
	value: string;
	label: string;
	daysBack: number | null;
}

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
	{ value: "1M", label: "1M", daysBack: 30 },
	{ value: "3M", label: "3M", daysBack: 90 },
	{ value: "6M", label: "6M", daysBack: 180 },
	{ value: "1Y", label: "1Y", daysBack: 365 },
	{ value: "2Y", label: "2Y", daysBack: 730 },
	{ value: "5Y", label: "5Y", daysBack: 1825 },
	{ value: "ALL", label: "ALL", daysBack: null },
];

// Default interval options (candlestick granularity)
const DEFAULT_INTERVAL_OPTIONS = [
	{ value: "1m", label: "1m" },
	{ value: "5m", label: "5m" },
	{ value: "15m", label: "15m" },
	{ value: "30m", label: "30m" },
	{ value: "1h", label: "1H" },
	{ value: "4h", label: "4H" },
	{ value: "1d", label: "1D" },
	{ value: "1w", label: "1W" },
];

export function TradingChart({
	ticker,
	signals,
	tradeActions,
	height = 600,
	// showVolume = false, // TODO: Implement volume support
	showMarkers = true,
	daysBack: initialDaysBack = null,
	interval: initialInterval = "1d",
	onIntervalChange,
	intervalOptions = DEFAULT_INTERVAL_OPTIONS.map(o => o.value),
	className,
}: TradingChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<IChartApi | null>(null);
	const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
	const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
	const [isReady, setIsReady] = useState(false);

	// Internal state for timeframe selection (controlled by chart's selector)
	const [selectedTimeframe, setSelectedTimeframe] = useState<string>(
		initialDaysBack === null ? "ALL" : TIMEFRAME_OPTIONS.find(opt => opt.daysBack === initialDaysBack)?.value || "ALL"
	);

	// Internal state for interval selection
	const [selectedInterval, setSelectedInterval] = useState<string>(initialInterval);

	// Handle interval change
	const handleIntervalChange = (newInterval: string) => {
		setSelectedInterval(newInterval);
		onIntervalChange?.(newInterval);
	};

	const { candlestickData, tradeMarkers, priceLines, isLoading } = useChartData({
		signals,
		tradeActions,
		daysBack: TIMEFRAME_OPTIONS.find(opt => opt.value === selectedTimeframe)?.daysBack ?? null,
	});

	// Initialize chart
	useEffect(() => {
		if (!containerRef.current) return;

		const chart = createChart(containerRef.current, getChartOptions(containerRef.current));
		chartRef.current = chart;

		// Static import — no dynamic import() needed
		const candlestickSeries = chart.addSeries(CandlestickSeries, CANDLESTICK_OPTIONS);
		candlestickSeriesRef.current = candlestickSeries;
		setIsReady(true);

		return () => {
			markersRef.current = null;
			chart.remove();
			chartRef.current = null;
			candlestickSeriesRef.current = null;
			setIsReady(false);
		};
	}, []);

	// Handle resize
	useChartResize(chartRef.current, containerRef as React.RefObject<HTMLElement>);

	// Update candlestick data when ready
	useEffect(() => {
		if (!isReady || !candlestickSeriesRef.current || candlestickData.length === 0) return;

		candlestickSeriesRef.current.setData(candlestickData);
	}, [isReady, candlestickData]);

	// Add/update markers — setMarkers removed in v5, use createSeriesMarkers instead
	useEffect(() => {
		if (!isReady || !candlestickSeriesRef.current || !showMarkers) return;

		if (!markersRef.current) {
			markersRef.current = createSeriesMarkers(candlestickSeriesRef.current, tradeMarkers);
		} else {
			markersRef.current.setMarkers(tradeMarkers);
		}
	}, [isReady, tradeMarkers, showMarkers]);

	// Add price lines (TP/SL) — lineWidth must be LineWidth literal (1|2|3|4), cast in chart-config
	// useEffect(() => {
	// 	if (!isReady || !candlestickSeriesRef.current || priceLines.length === 0) return;

	// 	priceLines.forEach((line) => {
	// 		candlestickSeriesRef.current?.createPriceLine(line);
	// 	});
	// }, [isReady, priceLines]);

	// Fit content to view
	useEffect(() => {
		if (!chartRef.current || candlestickData.length === 0) return;

		const timer = setTimeout(() => {
			chartRef.current?.timeScale().fitContent();
		}, 100);

		return () => clearTimeout(timer);
	}, [candlestickData]);

	if (isLoading) {
		return (
			<Card className={cn("relative overflow-hidden flex flex-col min-h-100", className)}>
				<div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-foreground/20" />
				<div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-foreground/20" />
				<div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-foreground/20" />
				<div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-foreground/20" />
				<div className="flex-1 h-full p-2 pb-4">
					<Skeleton className="h-full w-full" style={{ minHeight: "400px" }} />
				</div>
			</Card>
		);
	}

	if (candlestickData.length === 0) {
		return (
			<Card className={cn("relative overflow-hidden flex flex-col min-h-100", className)}>
				<div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-foreground/20" />
				<div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-foreground/20" />
				<div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-foreground/20" />
				<div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-foreground/20" />
				<div className="flex-1 h-full flex items-center justify-center text-center p-2 pb-4">
					<div>
						<p className="text-muted-foreground text-lg font-mono">No chart data available</p>
						<p className="text-muted-foreground text-sm">Unable to load candlestick data for {ticker}</p>
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card className={cn("relative overflow-hidden flex flex-col min-h-100", className)}>
			<div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-foreground/20" />
			<div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-foreground/20" />
			<div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-foreground/20" />
			<div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-foreground/20" />

			{/* Controls - Top Left */}
			<div className="absolute top-3 left-3 z-10 flex items-center gap-2">
				{/* Interval Selector */}
				{onIntervalChange && (
					<Select value={selectedInterval} onValueChange={handleIntervalChange}>
						<SelectTrigger className="h-7 w-14 text-xs font-mono bg-background/80 backdrop-blur-sm border-foreground/20 shadow-sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{DEFAULT_INTERVAL_OPTIONS.filter(opt => intervalOptions.includes(opt.value)).map((option) => (
								<SelectItem key={option.value} value={option.value} className="font-mono text-xs">
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}

				{/* Timeframe Selector */}
				<Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
					<SelectTrigger className="h-7 w-16 text-xs font-mono bg-background/80 backdrop-blur-sm border-foreground/20 shadow-sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TIMEFRAME_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value} className="font-mono text-xs">
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Chart container with inner padding for time scale labels */}
			<div className="flex-1 h-full p-2 pb-4">
				<div
					ref={containerRef}
					style={{ minHeight: "400px", height: typeof height === "number" ? `calc(${height}px - 16px)` : "100%" }}
					className="w-full h-full"
				/>
			</div>
		</Card>
	);
}