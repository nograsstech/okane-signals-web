import { createFileRoute } from "@tanstack/react-router";
import { Activity, Search } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { z } from "zod";
import { ProtectedRoute } from "@/components/auth";
import { HmmPriceChart, type HmmPriceChartHandle } from "@/components/hmm/hmm-price-chart";
import { HmmProbabilityChart } from "@/components/hmm/hmm-probability-chart";
import { HmmRegimeSummary } from "@/components/hmm/hmm-regime-summary";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useHmmRegimes } from "@/hooks/use-hmm-regimes";

const hmmSearchSchema = z.object({
	ticker: z.string().default("SPY"),
	period: z.string().default("365d"),
	interval: z.string().default("4h"),
});

export const Route = createFileRoute("/hmm/")({
	validateSearch: hmmSearchSchema,
	component: HmmPage,
});

const PERIOD_OPTIONS = [
	{ value: "30d", label: "30 Days" },
	{ value: "60d", label: "60 Days" },
	{ value: "90d", label: "3 Months" },
	{ value: "180d", label: "6 Months" },
	{ value: "365d", label: "1 Year" },
	{ value: "730d", label: "2 Years" },
];

const INTERVAL_OPTIONS = [
	{ value: "1m", label: "1 Min" },
	{ value: "5m", label: "5 Min" },
	{ value: "15m", label: "15 Min" },
	{ value: "1h", label: "1 Hour" },
	{ value: "4h", label: "4 Hour" },
	{ value: "1d", label: "1 Day" },
	{ value: "1wk", label: "1 Week" },
];

function HmmPage() {
	return (
		<Layout>
			<ProtectedRoute>
				<HmmContent />
			</ProtectedRoute>
		</Layout>
	);
}

function HmmContent() {
	const { ticker, period, interval } = Route.useSearch();
	const navigate = Route.useNavigate();

	const [tickerInput, setTickerInput] = useState(ticker);
	const [pendingPeriod, setPendingPeriod] = useState(period);
	const [pendingInterval, setPendingInterval] = useState(interval);

	const [activeDateStr, setActiveDateStr] = useState<string | null>(null);
	const [visibleRange, setVisibleRange] = useState<{
		from: string;
		to: string;
	} | null>(null);
	const priceChartRef = useRef<HmmPriceChartHandle>(null);

	const { data, isLoading, error, isFetching } = useHmmRegimes({
		ticker,
		period,
		interval,
		enabled: true,
	});

	const handleAnalyze = () => {
		const t = tickerInput.trim().toUpperCase();
		if (!t) return;
		navigate({
			search: { ticker: t, period: pendingPeriod, interval: pendingInterval },
		});
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleAnalyze();
	};

	const handlePriceCrosshairMove = useCallback((dateStr: string | null) => {
		setActiveDateStr(dateStr);
	}, []);

	const handleProbabilityCrosshairMove = useCallback(
		(dateStr: string | null) => {
			priceChartRef.current?.setCrosshairDate(dateStr);
		},
		[],
	);

	const handleVisibleRangeChange = useCallback((from: string, to: string) => {
		setVisibleRange({ from, to });
	}, []);

	const handleWheelZoom = useCallback((deltaY: number) => {
		// Math.exp gives smooth device-agnostic scaling:
		// trackpad (deltaY ≈ 5) → ~0.5% per event, mouse wheel (deltaY ≈ 100) → ~10%
		const factor = Math.exp(deltaY * 0.001);
		priceChartRef.current?.zoomBy(factor);
	}, []);

	return (
		<div className="min-h-screen w-full max-w-full overflow-x-hidden p-4 sm:p-6">
			{/* Page header */}
			<div className="mb-6">
				<div className="flex items-center gap-2 mb-1">
					<Activity size={16} className="text-primary" strokeWidth={2.5} />
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
						HMM Regime Analysis
					</h1>
				</div>
				<p className="text-foreground/40 font-mono text-xs tracking-wide">
					Hidden Markov Model · 3-State Market Regime Classifier
				</p>
			</div>

			{/* Controls */}
			<div className="relative p-4 mb-6 border border-border/30 bg-card/50">
				<div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-border/40" />
				<div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-border/40" />
				<div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-border/40" />
				<div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-border/40" />

				<div className="flex flex-col sm:flex-row sm:items-end gap-3">
					{/* Ticker — full width on mobile, grows to fill on desktop */}
					<div className="flex flex-col gap-1.5 sm:flex-1 min-w-0">
						<span className="font-mono text-[9px] tracking-widest uppercase text-foreground/40">
							Ticker
						</span>
						<Input
							value={tickerInput}
							onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
							onKeyDown={handleKeyDown}
							placeholder="SPY"
							className="font-mono text-sm h-9 uppercase tracking-widest bg-background/50"
						/>
					</div>

					{/* Period + Interval + Button — tightly grouped */}
					<div className="flex items-end gap-2">
						<div className="flex flex-col gap-1.5 flex-1 sm:flex-none sm:w-[120px]">
							<span className="font-mono text-[9px] tracking-widest uppercase text-foreground/40">
								Period
							</span>
							<Select value={pendingPeriod} onValueChange={setPendingPeriod}>
								<SelectTrigger className="h-9 w-full font-mono text-xs bg-background/50">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PERIOD_OPTIONS.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}
											className="font-mono text-xs"
										>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1.5 flex-1 sm:flex-none sm:w-[108px]">
							<span className="font-mono text-[9px] tracking-widest uppercase text-foreground/40">
								Interval
							</span>
							<Select value={pendingInterval} onValueChange={setPendingInterval}>
								<SelectTrigger className="h-9 w-full font-mono text-xs bg-background/50">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{INTERVAL_OPTIONS.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}
											className="font-mono text-xs"
										>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Button
							onClick={handleAnalyze}
							disabled={isLoading || isFetching}
							size="sm"
							className="h-9 gap-1.5 font-mono text-xs tracking-wider uppercase shrink-0"
						>
							<Search size={12} />
							{isFetching ? "Loading..." : "Analyze"}
						</Button>
					</div>
				</div>
			</div>

			{/* Error state */}
			{error && (
				<div className="relative mb-4 p-4 border border-red-500/30 bg-red-500/5">
					<div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-red-500/30" />
					<div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-red-500/30" />
					<div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-red-500/30" />
					<div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-red-500/30" />
					<p className="font-mono text-sm text-red-400">{error.message}</p>
				</div>
			)}

			{/* Loading skeleton */}
			{(isLoading || isFetching) && (
				<div className="flex flex-col gap-4">
					<div className="h-24 bg-muted/20 border border-border/20 animate-pulse rounded" />
					<div className="h-72 bg-muted/20 border border-border/20 animate-pulse rounded" />
					<div className="h-52 bg-muted/20 border border-border/20 animate-pulse rounded" />
				</div>
			)}

			{/* Data */}
			{data && !isFetching && (
				<div className="flex flex-col gap-4">
					{/* Ticker + data point count header */}
					<div className="flex items-center justify-between">
						<div className="flex items-baseline gap-2">
							<span className="font-mono text-lg font-bold text-foreground">
								{data.ticker}
							</span>
							<span className="font-mono text-xs text-foreground/40 uppercase tracking-wider">
								· {data.interval} · {data.dataPoints} data points
							</span>
						</div>
					</div>

					{/* Regime summary */}
					<HmmRegimeSummary summary={data.summary} />

					{/* Charts */}
					<div className="flex flex-col gap-4">
						<HmmPriceChart
							ref={priceChartRef}
							data={data.data}
							onCrosshairMove={handlePriceCrosshairMove}
							onVisibleRangeChange={handleVisibleRangeChange}
						/>
						<HmmProbabilityChart
							data={data.data}
							activeDateStr={activeDateStr}
							onCrosshairMove={handleProbabilityCrosshairMove}
							visibleRange={visibleRange}
							onWheelZoom={handleWheelZoom}
						/>
					</div>
				</div>
			)}

		</div>
	);
}
