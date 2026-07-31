import { useMemo, useState } from "react";
import {
	AlertTriangle,
	BarChart3,
	CalendarDays,
	Play,
	Wallet,
} from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { usePortfolioReplay } from "@/hooks/use-portfolio-replay";
import {
	portfolioReplaySchema,
	type PortfolioReplayFormValues,
} from "@/lib/schemas/portfolio-replay-schema";
import type {
	PortfolioReplayData,
	PortfolioReplayTrade,
} from "@/lib/types/portfolio-replay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function isoDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

const today = new Date();
const defaultValues: PortfolioReplayFormValues = {
	start_date: isoDate(new Date(today.getTime() - 29 * 86_400_000)),
	end_date: isoDate(today),
	starting_equity: 100_000,
	risk_per_trade: 100,
	cost_per_trade: 0,
};

function money(value: number) {
	return `${value < 0 ? "−" : ""}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(value: number | null) {
	return value === null ? "—" : `${value.toFixed(1)}%`;
}

function signedMoney(value: number) {
	return `${value >= 0 ? "+" : "−"}${money(Math.abs(value))}`;
}

function statusLabel(trade: PortfolioReplayTrade) {
	if (trade.status === "marked") return "OPEN / MARKED";
	if (trade.status === "skipped") return "SKIPPED";
	return trade.status.toUpperCase();
}

export default function PortfolioContent() {
	const [values, setValues] = useState(defaultValues);
	const [formError, setFormError] = useState<string | null>(null);
	const [result, setResult] = useState<PortfolioReplayData | null>(null);
	const replay = usePortfolioReplay();

	const update = (key: keyof PortfolioReplayFormValues, value: string) => {
		setValues((current) => ({
			...current,
			[key]:
				key.includes("equity") || key.includes("risk") || key.includes("cost")
					? Number(value)
					: value,
		}));
	};

	const submit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormError(null);
		const parsed = portfolioReplaySchema.safeParse(values);
		if (!parsed.success) {
			setFormError(
				parsed.error.issues[0]?.message ?? "Check the replay parameters",
			);
			return;
		}
		replay.mutate(parsed.data, {
			onSuccess: (response) => setResult(response.data),
			onError: (error) => setFormError(error.message),
		});
	};

	const chartData = useMemo(() => {
		if (!result) return [];
		return result.equity_curve.map((point) => ({
			...point,
			label: new Date(point.datetime).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			}),
		}));
	}, [result]);

	return (
		<div className="min-h-screen p-4 sm:p-6">
			<div className="mb-6 flex flex-col gap-2 sm:mb-8">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded bg-foreground text-background">
						<BarChart3 size={18} />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
							Portfolio Replay
						</h1>
						<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
							Enabled strategy equity simulation
						</p>
					</div>
				</div>
				<p className="max-w-3xl text-sm text-muted-foreground">
					Replays currently enabled signals using stored stop-loss and
					take-profit levels. Results are normalized to fixed USD risk and
					should be read as a research model, not broker execution.
				</p>
			</div>

			<Card className="mb-6 border-border/50 bg-background/50">
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
						<CalendarDays size={15} /> Replay parameters
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
						onSubmit={submit}
					>
						<Parameter
							label="Start date"
							type="date"
							value={values.start_date}
							onChange={(value) => update("start_date", value)}
						/>
						<Parameter
							label="End date"
							type="date"
							value={values.end_date}
							onChange={(value) => update("end_date", value)}
						/>
						<Parameter
							label="Starting equity"
							type="number"
							min="1"
							step="1"
							value={String(values.starting_equity)}
							onChange={(value) => update("starting_equity", value)}
						/>
						<Parameter
							label="Risk / trade"
							type="number"
							min="0.01"
							step="0.01"
							value={String(values.risk_per_trade)}
							onChange={(value) => update("risk_per_trade", value)}
						/>
						<Parameter
							label="Cost / trade"
							type="number"
							min="0"
							step="0.01"
							value={String(values.cost_per_trade)}
							onChange={(value) => update("cost_per_trade", value)}
						/>
						<Button
							type="submit"
							className="h-9 gap-2 font-mono text-xs uppercase tracking-wider"
							disabled={replay.isPending}
						>
							<Play size={14} />
							{replay.isPending ? "Replaying..." : "Run replay"}
						</Button>
					</form>
					{formError && (
						<p className="mt-3 text-sm text-destructive">{formError}</p>
					)}
				</CardContent>
			</Card>

			{result ? (
				<ReplayResult result={result} chartData={chartData} />
			) : (
				<EmptyReplay />
			)}
		</div>
	);
}

function Parameter({
	label,
	type,
	value,
	onChange,
	min,
	step,
}: {
	label: string;
	type: string;
	value: string;
	onChange: (value: string) => void;
	min?: string;
	step?: string;
}) {
	const id = `portfolio-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
	return (
		<div className="flex flex-col gap-1.5">
			<Label
				htmlFor={id}
				className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
			>
				{label}
			</Label>
			<Input
				id={id}
				type={type}
				min={min}
				step={step}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="h-9 font-mono text-xs"
			/>
		</div>
	);
}

function EmptyReplay() {
	return (
		<div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-border/60 bg-muted/10 p-8 text-center">
			<Wallet className="mb-3 text-muted-foreground" size={26} />
			<h2 className="font-mono text-sm uppercase tracking-widest">
				No replay loaded
			</h2>
			<p className="mt-2 max-w-md text-sm text-muted-foreground">
				Choose a date range and risk model, then run the replay to see the
				equity curve and auditable trade outcomes.
			</p>
		</div>
	);
}

function ReplayResult({
	result,
	chartData,
}: {
	result: PortfolioReplayData;
	chartData: Array<{
		label: string;
		equity: number;
		pnl: number;
		datetime: string;
	}>;
}) {
	const { summary } = result;
	return (
		<>
			{result.warnings.length > 0 && (
				<div className="mb-6 border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
					<div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
						<AlertTriangle size={15} /> Coverage warnings
					</div>
					<ul className="list-disc space-y-1 pl-5">
						{result.warnings.map((warning) => (
							<li key={warning}>{warning}</li>
						))}
					</ul>
				</div>
			)}
			<div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<Metric
					label="Ending equity"
					value={money(summary.ending_equity)}
					tone={summary.net_pnl >= 0 ? "positive" : "negative"}
				/>
				<Metric
					label="Net P&L"
					value={signedMoney(summary.net_pnl)}
					tone={summary.net_pnl >= 0 ? "positive" : "negative"}
					description={`${summary.return_percentage.toFixed(2)}% return`}
				/>
				<Metric
					label="Max drawdown"
					value={money(summary.max_drawdown)}
					tone="negative"
					description={pct(summary.max_drawdown_percentage)}
				/>
				<Metric
					label="Win rate"
					value={pct(summary.win_rate)}
					description={`${summary.closed_trades} closed / ${summary.open_trades} open`}
				/>
			</div>
			<div className="mb-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
				<Card className="border-border/50 bg-background/50">
					<CardHeader>
						<CardTitle className="font-mono text-xs uppercase tracking-widest">
							Equity curve
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-72 w-full">
							{chartData.length > 1 ? (
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={chartData}>
										<defs>
											<linearGradient
												id="equityFill"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
														<stop
															offset="5%"
															stopColor="var(--chart-1)"
															stopOpacity={0.3}
														/>
														<stop
															offset="95%"
															stopColor="var(--chart-1)"
															stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="3 3"
											className="stroke-border/50"
										/>
										<XAxis
											dataKey="label"
											tick={{ fontSize: 10 }}
											minTickGap={24}
										/>
										<YAxis
											tick={{ fontSize: 10 }}
											tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
										/>
										<Tooltip
											formatter={(value: number) => money(value)}
											labelFormatter={(label) => label}
											contentStyle={{
												backgroundColor: "var(--popover)",
												border: "1px solid var(--border)",
												borderRadius: "6px",
												color: "var(--popover-foreground)",
											}}
											labelStyle={{ color: "var(--muted-foreground)" }}
											itemStyle={{ color: "var(--popover-foreground)" }}
										/>
														<Area
															type="monotone"
															dataKey="equity"
															stroke="var(--chart-1)"
											fill="url(#equityFill)"
											strokeWidth={2}
										/>
									</AreaChart>
								</ResponsiveContainer>
							) : (
								<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
									Not enough equity events for a chart.
								</div>
							)}
						</div>
					</CardContent>
				</Card>
				<Card className="border-border/50 bg-background/50">
					<CardHeader>
						<CardTitle className="font-mono text-xs uppercase tracking-widest">
							Replay scope
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						<ScopeRow
							label="Date range"
							value={`${result.start_date} → ${result.end_date}`}
						/>
						<ScopeRow
							label="Enabled strategies"
							value={`${result.enabled_strategy_count} (${result.strategy_count_with_actions} with actions)`}
						/>
						<ScopeRow
							label="Signals modeled"
							value={String(summary.total_trades)}
						/>
						<ScopeRow
							label="Costs charged"
							value={money(summary.total_costs)}
						/>
						<ScopeRow
							label="Realized / unrealized"
							value={`${money(summary.realized_pnl)} / ${money(summary.unrealized_pnl)}`}
						/>
					</CardContent>
				</Card>
			</div>
			<StrategyBreakdown result={result} />
			<TradeTable trades={result.trades} />
		</>
	);
}

function Metric({
	label,
	value,
	description,
	tone = "neutral",
}: {
	label: string;
	value: string;
	description?: string;
	tone?: "positive" | "negative" | "neutral";
}) {
	return (
		<Card className="border-border/50 bg-background/50 p-4">
			<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
				{label}
			</p>
			<p
				className={`mt-2 font-mono text-2xl font-bold ${tone === "positive" ? "text-emerald-500" : tone === "negative" ? "text-red-500" : ""}`}
			>
				{value}
			</p>
			{description && (
				<p className="mt-1 text-xs text-muted-foreground">{description}</p>
			)}
		</Card>
	);
}

function ScopeRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-start justify-between gap-4 border-b border-border/30 pb-3 last:border-b-0 last:pb-0">
			<span className="text-muted-foreground">{label}</span>
			<span className="text-right font-mono text-xs">{value}</span>
		</div>
	);
}

function StrategyBreakdown({ result }: { result: PortfolioReplayData }) {
	return (
		<Card className="mb-6 border-border/50 bg-background/50">
			<CardHeader>
				<CardTitle className="font-mono text-xs uppercase tracking-widest">
					Strategy breakdown
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[680px] text-left">
						<thead>
							<tr className="border-b border-border/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								<th className="px-2 py-3">Ticker / strategy</th>
								<th className="px-2 py-3">Trades</th>
								<th className="px-2 py-3">Win rate</th>
								<th className="px-2 py-3">Avg R</th>
								<th className="px-2 py-3 text-right">Net P&L</th>
							</tr>
						</thead>
						<tbody>
							{result.strategies.map((item) => (
								<tr
									key={item.backtest_id}
									className="border-b border-border/20 last:border-0"
								>
									<td className="px-2 py-3">
										<div className="font-mono text-xs">{item.ticker}</div>
										<div className="text-xs text-muted-foreground">
											{item.strategy}
										</div>
									</td>
									<td className="px-2 py-3 font-mono text-xs">{item.trades}</td>
									<td className="px-2 py-3 font-mono text-xs">
										{pct(item.win_rate)}
									</td>
									<td className="px-2 py-3 font-mono text-xs">
										{item.average_r === null ? "—" : item.average_r.toFixed(2)}
									</td>
									<td
										className={`px-2 py-3 text-right font-mono text-xs ${item.net_pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}
									>
										{signedMoney(item.net_pnl)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
}

function TradeTable({ trades }: { trades: PortfolioReplayTrade[] }) {
	return (
		<Card className="border-border/50 bg-background/50">
			<CardHeader>
				<CardTitle className="font-mono text-xs uppercase tracking-widest">
					Trade ledger
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[980px] text-left">
						<thead>
							<tr className="border-b border-border/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								<th className="px-2 py-3">Time</th>
								<th className="px-2 py-3">Ticker / strategy</th>
								<th className="px-2 py-3">Side</th>
								<th className="px-2 py-3">Entry → exit</th>
								<th className="px-2 py-3">Status</th>
								<th className="px-2 py-3">R</th>
								<th className="px-2 py-3 text-right">P&L</th>
							</tr>
						</thead>
						<tbody>
							{trades
								.slice()
								.reverse()
								.map((trade, index) => (
									<tr
										key={`${trade.backtest_id}-${trade.datetime}-${index}`}
										className="border-b border-border/20 last:border-0"
									>
										<td className="px-2 py-3 font-mono text-xs">
											{new Date(trade.datetime).toLocaleString("en-US", {
												month: "short",
												day: "2-digit",
												hour: "2-digit",
												minute: "2-digit",
												hour12: false,
											})}
										</td>
										<td className="px-2 py-3">
											<div className="font-mono text-xs">{trade.ticker}</div>
											<div className="text-xs text-muted-foreground">
												{trade.strategy}
											</div>
										</td>
										<td
											className={`px-2 py-3 font-mono text-xs uppercase ${trade.direction === "long" ? "text-emerald-500" : "text-red-500"}`}
										>
											{trade.direction}
										</td>
										<td className="px-2 py-3 font-mono text-xs">
											{trade.entry_price.toFixed(4)} →{" "}
											{trade.exit_price === null
												? "—"
												: trade.exit_price.toFixed(4)}
										</td>
										<td className="px-2 py-3 font-mono text-[10px]">
											{statusLabel(trade)}
										</td>
										<td className="px-2 py-3 font-mono text-xs">
											{trade.r_multiple === null
												? "—"
												: trade.r_multiple.toFixed(2)}
										</td>
										<td
											className={`px-2 py-3 text-right font-mono text-xs ${(trade.pnl ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}
										>
											{trade.pnl === null ? "—" : signedMoney(trade.pnl)}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
}
