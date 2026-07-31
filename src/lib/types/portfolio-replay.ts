export interface PortfolioReplayRequest {
	start_date: string;
	end_date: string;
	starting_equity: number;
	risk_per_trade: number;
	cost_per_trade: number;
}

export interface PortfolioReplayTrade {
	backtest_id: number;
	ticker: string;
	strategy: string;
	datetime: string;
	action: string;
	direction: "long" | "short";
	entry_price: number;
	exit_price: number | null;
	stop_loss: number;
	take_profit: number | null;
	risk_units: number;
	r_multiple: number | null;
	pnl: number | null;
	cost: number;
	status: "tp" | "sl" | "close" | "marked" | "skipped";
	exit_datetime: string | null;
	message?: string | null;
}

export interface PortfolioReplayStrategyResult {
	backtest_id: number;
	ticker: string;
	strategy: string;
	trades: number;
	closed_trades: number;
	open_trades: number;
	wins: number;
	net_pnl: number;
	win_rate: number | null;
	average_r: number | null;
}

export interface PortfolioReplayEquityPoint {
	datetime: string;
	equity: number;
	pnl: number;
}

export interface PortfolioReplaySummary {
	starting_equity: number;
	ending_equity: number;
	net_pnl: number;
	return_percentage: number;
	realized_pnl: number;
	unrealized_pnl: number;
	total_costs: number;
	max_drawdown: number;
	max_drawdown_percentage: number;
	total_trades: number;
	closed_trades: number;
	open_trades: number;
	wins: number;
	losses: number;
	win_rate: number | null;
}

export interface PortfolioReplayData {
	start_date: string;
	end_date: string;
	summary: PortfolioReplaySummary;
	enabled_strategy_count: number;
	strategy_count_with_actions: number;
	equity_curve: PortfolioReplayEquityPoint[];
	strategies: PortfolioReplayStrategyResult[];
	trades: PortfolioReplayTrade[];
	warnings: string[];
}

export interface PortfolioReplayResponse {
	status: number;
	message: string;
	data: PortfolioReplayData;
}
