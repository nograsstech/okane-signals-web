import { createFileRoute } from "@tanstack/react-router";
import { Activity, Search } from "lucide-react";
import { useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth";
import { HmmPriceChart } from "@/components/hmm/hmm-price-chart";
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

export const Route = createFileRoute("/hmm/")({
	component: HmmPage,
});

const PERIOD_OPTIONS = [
	{ value: "90d", label: "3 Months" },
	{ value: "180d", label: "6 Months" },
	{ value: "365d", label: "1 Year" },
	{ value: "730d", label: "2 Years" },
];

const INTERVAL_OPTIONS = [
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
	const [tickerInput, setTickerInput] = useState("AAPL");
	const [period, setPeriod] = useState("365d");
	const [interval, setInterval] = useState("1d");

	// The submitted params — only set after pressing Analyze
	const [submitted, setSubmitted] = useState<{
		ticker: string;
		period: string;
		interval: string;
	} | null>({ ticker: "AAPL", period: "365d", interval: "1d" });

	const [activeDateStr, setActiveDateStr] = useState<string | null>(null);

	const { data, isLoading, error, isFetching } = useHmmRegimes({
		ticker: submitted?.ticker ?? "",
		period: submitted?.period,
		interval: submitted?.interval,
		enabled: !!submitted,
	});

	const handleAnalyze = () => {
		const t = tickerInput.trim().toUpperCase();
		if (!t) return;
		setSubmitted({ ticker: t, period, interval });
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleAnalyze();
	};

	const handleCrosshairMove = useCallback((dateStr: string | null) => {
		setActiveDateStr(dateStr);
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
			<div className="relative p-3 sm:p-4 mb-4 border border-border/30 bg-card/50">
				<div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-border/40" />
				<div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-border/40" />
				<div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-border/40" />
				<div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-border/40" />

				<div className="flex flex-wrap items-end gap-3">
					<div className="flex flex-col gap-1 flex-1 min-w-32 max-w-48">
						<span className="font-mono text-[9px] tracking-widest uppercase text-foreground/40">
							Ticker
						</span>
						<Input
							value={tickerInput}
							onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
							onKeyDown={handleKeyDown}
							placeholder="AAPL"
							className="font-mono text-sm h-8 uppercase tracking-widest bg-background/50"
						/>
					</div>

					<div className="flex flex-col gap-1 min-w-36">
						<span className="font-mono text-[9px] tracking-widest uppercase text-foreground/40">
							Period
						</span>
						<Select value={period} onValueChange={setPeriod}>
							<SelectTrigger className="h-8 font-mono text-xs bg-background/50">
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

					<div className="flex flex-col gap-1 min-w-32">
						<span className="font-mono text-[9px] tracking-widest uppercase text-foreground/40">
							Interval
						</span>
						<Select value={interval} onValueChange={setInterval}>
							<SelectTrigger className="h-8 font-mono text-xs bg-background/50">
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
						className="h-8 gap-2 font-mono text-xs tracking-wider uppercase shrink-0"
					>
						<Search size={12} />
						{isFetching ? "Loading..." : "Analyze"}
					</Button>
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
							data={data.data}
							onCrosshairMove={handleCrosshairMove}
						/>
						<HmmProbabilityChart
							data={data.data}
							activeDateStr={activeDateStr}
						/>
					</div>
				</div>
			)}

			{/* Empty state — not yet searched */}
			{!submitted && !isLoading && (
				<div className="flex flex-col items-center justify-center py-20 gap-3">
					<Activity size={32} className="text-foreground/20" />
					<p className="font-mono text-xs text-foreground/30 uppercase tracking-widest">
						Enter a ticker and press Analyze
					</p>
				</div>
			)}
		</div>
	);
}
