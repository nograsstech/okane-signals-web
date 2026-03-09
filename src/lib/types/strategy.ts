// Strategy types based on okane-signals-2 interfaces

export interface KeyStrategyBacktestStats {
	id: string;
	ticker: string;
	strategy: string;
	period: string;
	interval: string;
	startTime: string;
	endTime: string;
	winRate: number;
	returnPercentage: number;
	sharpeRatio: number;
	sortinoRatio: number;
	calmarRatio: number;
	maxDrawdownPercentage: number;
	averageDrawdownPercentage: number;
	buyAndHoldReturn: number;
	returnAnnualized: number;
	avgTrade: number;
	bestTrade: number;
	worstTrade: number;
	tpsl_ratio: number;
	slCoef: number;
	notificationsOn: boolean;
	created_at: Date;
	updated_at: Date;
	// Computed fields for UI display
	"✨"?: string; // Top performer indicators
	"🔔"?: string; // Notification indicator
}

export interface TradeAction {
	id: string;
	created_at: Date;
	backtest_id: string;
	datetime: Date;
	trade_action: "buy" | "sell" | "close";
	entry_price: number;
	price: number;
	tp: number;
	sl: number;
	size: number;
}

export interface Signal {
	gmtTime: string;
	open?: number;
	high?: number;
	low?: number;
	close?: number;
	volume?: number;
	totalSignal?: number; // 1=sell, 2=buy
}

export interface SignalResponseDTO {
	status: number;
	message: string;
	data: {
		signals: {
			allSignals: Signal[];
		};
	};
}

// Table state types
export interface TableSort {
	id: string;
	desc: boolean;
}

export interface TablePagination {
	pageIndex: number;
	pageSize: number;
}

// Trades page types
export interface TradeWithBacktest {
	id: number;
	created_at: Date;
	backtest_id: number;
	datetime: Date;
	trade_action: "buy" | "sell" | "close";
	entry_price: number | null;
	price: number | null;
	sl: number | null;
	tp: number | null;
	size: number | null;
	// JOINed fields from backtest_stats
	ticker: string;
	strategy: string;
}

export interface TradesParams {
	page?: number;
	pageSize?: number;
	ticker?: string;
	actionType?: "buy" | "sell" | "close";
	startDate?: string; // ISO date string
	endDate?: string; // ISO date string
	search?: string; // Global search term
}

export interface TradesResponse {
	trades: TradeWithBacktest[];
	pagination: {
		page: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}
