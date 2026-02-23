// Performance metrics calculation utilities for trade actions

import type { TradeAction } from "@/lib/types/strategy";

export interface TradeMetrics {
	// Basic trade statistics
	totalTrades: number;
	winningTrades: number;
	losingTrades: number;
	winRate: number;

	// PnL metrics
	totalPnL: number;
	totalPnLPercentage: number;
	averagePnL: number;
	averageWin: number;
	averageLoss: number;
	bestTrade: number;
	worstTrade: number;
	profitFactor: number;

	// Risk-adjusted returns
	sharpeRatio: number;
	sortinoRatio: number;

	// Drawdown metrics
	maxDrawdown: number;
	maxDrawdownPercentage: number;
	averageDrawdown: number;

	// Additional metrics
	totalProfit: number;
	totalLoss: number;
	expectancy: number;
}

interface CompletedTrade {
	entryPrice: number;
	exitPrice: number;
	size: number;
	pnl: number;
	pnlPercentage: number;
	isWin: boolean;
	entryDate: Date;
	exitDate: Date;
}

/**
 * Calculate performance metrics from trade actions
 * Pairs buy and sell trades to calculate round-trip performance
 */
export function calculateTradeMetrics(tradeActions: TradeAction[], initialCapital: number = 10000): TradeMetrics {
	// Sort trade actions by date
	const sortedTrades = [...tradeActions].sort((a, b) =>
		new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
	);

	// Pair buy and sell trades to create completed trades
	const completedTrades: CompletedTrade[] = [];
	const buyTrades: Map<string, { price: number; size: number; date: Date }> = new Map();

	for (const trade of sortedTrades) {
		if (trade.trade_action === "buy" && trade.price && trade.size) {
			// Store buy trade
			buyTrades.set(trade.id, {
				price: trade.price,
				size: trade.size,
				date: new Date(trade.datetime),
			});
		} else if (trade.trade_action === "sell" && buyTrades.size > 0) {
			// Find the oldest buy trade to pair (FIFO)
			const [buyId, buyTrade] = Array.from(buyTrades.entries())[0];
			buyTrades.delete(buyId);

			const entryPrice = buyTrade.price;
			const exitPrice = trade.price;
			const size = buyTrade.size;

			// Calculate PnL (assuming long position)
			const pnl = (exitPrice - entryPrice) * size;
			const pnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;

			completedTrades.push({
				entryPrice,
				exitPrice,
				size,
				pnl,
				pnlPercentage,
				isWin: pnl > 0,
				entryDate: buyTrade.date,
				exitDate: new Date(trade.datetime),
			});
		}
	}

	// If no completed trades, return empty metrics
	if (completedTrades.length === 0) {
		return getEmptyMetrics();
	}

	// Calculate basic statistics
	const totalTrades = completedTrades.length;
	const winningTrades = completedTrades.filter((t) => t.isWin).length;
	const losingTrades = totalTrades - winningTrades;
	const winRate = (winningTrades / totalTrades) * 100;

	// Calculate PnL metrics
	const totalPnL = completedTrades.reduce((sum, t) => sum + t.pnl, 0);
	const totalPnLPercentage = (totalPnL / initialCapital) * 100;
	const averagePnL = totalPnL / totalTrades;

	const wins = completedTrades.filter((t) => t.isWin);
	const losses = completedTrades.filter((t) => !t.isWin);

	const averageWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
	const averageLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length : 0;

	const bestTrade = Math.max(...completedTrades.map((t) => t.pnl));
	const worstTrade = Math.min(...completedTrades.map((t) => t.pnl));

	const totalProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
	const totalLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
	const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

	// Calculate Sharpe and Sortino ratios
	const returns = completedTrades.map((t) => t.pnlPercentage);
	const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

	// Standard deviation for Sharpe ratio
	const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
	const stdDev = Math.sqrt(variance);
	const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized

	// Downside deviation for Sortino ratio
	const negativeReturns = returns.filter((r) => r < 0);
	const downsideVariance = negativeReturns.length > 0
		? negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length
		: 0;
	const downsideDeviation = Math.sqrt(downsideVariance);
	const sortinoRatio = downsideDeviation > 0 ? (avgReturn / downsideDeviation) * Math.sqrt(252) : 0;

	// Calculate drawdown metrics
	const equityCurve = [initialCapital];
	for (const trade of completedTrades) {
		equityCurve.push(equityCurve[equityCurve.length - 1] + trade.pnl);
	}

	let peak = equityCurve[0];
	let maxDrawdown = 0;
	let maxDrawdownPercentage = 0;
	const drawdowns: number[] = [];

	for (let i = 1; i < equityCurve.length; i++) {
		if (equityCurve[i] > peak) {
			peak = equityCurve[i];
		}
		const drawdown = peak - equityCurve[i];
		const drawdownPercentage = (drawdown / peak) * 100;

		if (drawdown > maxDrawdown) {
			maxDrawdown = drawdown;
			maxDrawdownPercentage = drawdownPercentage;
		}

		if (drawdown > 0) {
			drawdowns.push(drawdown);
		}
	}

	const averageDrawdown = drawdowns.length > 0
		? drawdowns.reduce((sum, d) => sum + d, 0) / drawdowns.length
		: 0;

	// Expectancy (average profit per trade)
	const expectancy = totalPnL / totalTrades;

	return {
		totalTrades,
		winningTrades,
		losingTrades,
		winRate,
		totalPnL,
		totalPnLPercentage,
		averagePnL,
		averageWin,
		averageLoss,
		bestTrade,
		worstTrade,
		profitFactor,
		sharpeRatio,
		sortinoRatio,
		maxDrawdown,
		maxDrawdownPercentage,
		averageDrawdown,
		totalProfit,
		totalLoss,
		expectancy,
	};
}

function getEmptyMetrics(): TradeMetrics {
	return {
		totalTrades: 0,
		winningTrades: 0,
		losingTrades: 0,
		winRate: 0,
		totalPnL: 0,
		totalPnLPercentage: 0,
		averagePnL: 0,
		averageWin: 0,
		averageLoss: 0,
		bestTrade: 0,
		worstTrade: 0,
		profitFactor: 0,
		sharpeRatio: 0,
		sortinoRatio: 0,
		maxDrawdown: 0,
		maxDrawdownPercentage: 0,
		averageDrawdown: 0,
		totalProfit: 0,
		totalLoss: 0,
		expectancy: 0,
	};
}

/**
 * Format a number as currency
 */
export function formatCurrency(value: number, decimals: number = 2): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
	return `${value.toFixed(decimals)}%`;
}
