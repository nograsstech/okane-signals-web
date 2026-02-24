// Performance metrics calculation utilities for trade actions

import type { TradeAction } from "@/lib/types/strategy";

// ============================================================================
// NEW INTERFACES FOR EXTENDED METRICS
// ============================================================================

export type CloseReasonType = "tp_hit" | "sl_hit" | "manual" | "open";

export interface CloseReason {
	type: CloseReasonType;
	confidence: "certain" | "likely" | "uncertain";
	description: string;
}

export interface CompletedPosition {
	entryAction: TradeAction;
	closeAction?: TradeAction; // undefined for open positions
	direction: "long" | "short";
	closeReason: CloseReason;
	pnl: number;
	pnlPercentage: number;
	isWin: boolean;
	entryDate: Date;
	exitDate?: Date;
	durationHours?: number;

	// Risk metrics
	entryTp: number;
	entrySl: number;
	potentialProfit: number;
	potentialLoss: number;
	actualRiskReward: number;
}

export interface TradeMetricsConfig {
	initialCapital?: number;
	priceTolerancePercent?: number;
	currentPrice?: number; // For valuing open positions
}

export interface TradeMetricsExtended extends TradeMetrics {
	// TP/SL Analysis
	tpHitRate: number;
	slHitRate: number;
	manualCloseRate: number;
	openPositionsCount: number;
	averageRiskReward: number;

	// Win Rate by Exit Type
	winRateTpHit: number;
	winRateSlHit: number;
	winRateManual: number;

	// Position Type Breakdown
	longPositions: number;
	shortPositions: number;
	longWinRate: number;
	shortWinRate: number;

	// Trade Duration
	averageTradeDurationHours: number;
	averageWinDurationHours: number;
	averageLossDurationHours: number;
}

// ============================================================================
// ORIGINAL INTERFACES (kept for backward compatibility)
// ============================================================================

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

// ============================================================================
// NEW HELPER FUNCTIONS FOR EXTENDED METRICS
// ============================================================================

/**
 * Detect why a position was closed by comparing close price to TP/SL levels
 */
function detectCloseReason(
	closePrice: number,
	entryTp: number | null,
	entrySl: number | null,
	tolerancePercent: number
): CloseReason {
	// Check exact TP match
	if (entryTp !== null && entryTp !== undefined) {
		const tpTolerance = entryTp * tolerancePercent;
		if (Math.abs(closePrice - entryTp) <= tpTolerance) {
			return {
				type: "tp_hit",
				confidence: "certain",
				description: "Take profit hit"
			};
		}
	}

	// Check exact SL match
	if (entrySl !== null && entrySl !== undefined) {
		const slTolerance = entrySl * tolerancePercent;
		if (Math.abs(closePrice - entrySl) <= slTolerance) {
			return {
				type: "sl_hit",
				confidence: "certain",
				description: "Stop loss hit"
			};
		}
	}

	// Check proximity for "likely" determination
	const distances: { type: CloseReasonType; distance: number }[] = [];

	if (entryTp !== null && entryTp !== undefined) {
		distances.push({
			type: "tp_hit",
			distance: Math.abs(closePrice - entryTp)
		});
	}

	if (entrySl !== null && entrySl !== undefined) {
		distances.push({
			type: "sl_hit",
			distance: Math.abs(closePrice - entrySl)
		});
	}

	if (distances.length > 0) {
		distances.sort((a, b) => a.distance - b.distance);
		const nearest = distances[0];
		const percentOff = (nearest.distance / closePrice) * 100;

		if (percentOff < 1.0) {
			return {
				type: nearest.type,
				confidence: "likely",
				description: `Probably ${nearest.type === "tp_hit" ? "take profit" : "stop loss"} (${percentOff.toFixed(2)}% off)`
			};
		}
	}

	// Default to manual close
	return {
		type: "manual",
		confidence: "uncertain",
		description: "Manual close or signal-based exit"
	};
}

/**
 * Calculate PnL for a position (handles both long and short)
 */
function calculatePositionPnL(
	entryAction: TradeAction,
	closeAction: TradeAction | undefined,
	currentPrice: number | undefined
): { pnl: number; pnlPercentage: number; isWin: boolean } {
	const entryPrice = entryAction.price;
	const exitPrice = closeAction ? closeAction.price : (currentPrice || entryPrice);
	const size = entryAction.size || 0;
	const isLong = entryAction.trade_action === "buy";

	let pnl: number;
	let pnlPercentage: number;

	if (isLong) {
		// Long position: profit when price goes up
		pnl = (exitPrice - entryPrice) * size;
		pnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;
	} else {
		// Short position: profit when price goes down (inverse formula)
		pnl = (entryPrice - exitPrice) * size;
		pnlPercentage = ((entryPrice - exitPrice) / entryPrice) * 100;
	}

	return {
		pnl,
		pnlPercentage,
		isWin: pnl > 0
	};
}

/**
 * Find matching entry for a close action
 * Uses multiple strategies: exact match, tolerance match, and closest match fallback
 *
 * @param tolerancePercentAsDecimal - Tolerance as decimal (e.g., 0.001 for 0.1%)
 */
function findMatchingEntry(
	closeAction: TradeAction,
	entries: TradeAction[],
	matchedEntryIds: Set<string>,
	tolerancePercentAsDecimal: number
): TradeAction | null {
	const closeEntryPrice = closeAction.entry_price;
	const closeDatetime = new Date(closeAction.datetime).getTime();

	// Filter entries that are already matched or after close time
	const unmatchedEntries = entries.filter(entry => {
		if (matchedEntryIds.has(entry.id)) return false;
		const entryDatetime = new Date(entry.datetime).getTime();
		return entryDatetime < closeDatetime; // Entry must be before close
	});

	if (unmatchedEntries.length === 0) {
		console.warn(`[TradeMetrics] No unmatched entries found before close at ${closeAction.datetime}`);
		return null;
	}

	// Strategy 1: Find exact matches within tolerance
	const tolerancePercent = tolerancePercentAsDecimal * 100; // Convert decimal to percentage (e.g., 0.001 -> 0.1)
	const exactMatches = unmatchedEntries.filter(entry => {
		const entryPrice = entry.price;
		const priceDiff = Math.abs(closeEntryPrice - entryPrice);
		const priceDiffPercent = (priceDiff / entryPrice) * 100;
		return priceDiffPercent <= tolerancePercent;
	});

	if (exactMatches.length > 0) {
		// Return the oldest exact match (FIFO)
		exactMatches.sort((a, b) =>
			new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
		);
		return exactMatches[0];
	}

	// Strategy 2: Find closest match as fallback (within 1% tolerance)
	const CLOSEST_MATCH_TOLERANCE = 1.0; // 1%
	const closestMatches = unmatchedEntries.map(entry => {
		const entryPrice = entry.price;
		const priceDiff = Math.abs(closeEntryPrice - entryPrice);
		const priceDiffPercent = (priceDiff / entryPrice) * 100;
		return {
			entry,
			priceDiffPercent
		};
	}).filter(item => item.priceDiffPercent <= CLOSEST_MATCH_TOLERANCE);

	if (closestMatches.length > 0) {
		// Sort by closest price match, then by oldest (FIFO)
		closestMatches.sort((a, b) => {
			if (a.priceDiffPercent !== b.priceDiffPercent) {
				return a.priceDiffPercent - b.priceDiffPercent;
			}
			return new Date(a.entry.datetime).getTime() - new Date(b.entry.datetime).getTime();
		});

		const bestMatch = closestMatches[0];
		console.info(
			`[TradeMetrics] Using closest match for close at ${closeAction.datetime}: ` +
			`close.entry_price=${closeEntryPrice}, entry.price=${bestMatch.entry.price} ` +
			`(diff=${bestMatch.priceDiffPercent.toFixed(3)}%)`
		);

		return bestMatch.entry;
	}

	// No match found
	console.warn(
		`[TradeMetrics] No matching entry found for close at ${closeAction.datetime} ` +
		`(entry_price=${closeEntryPrice}). Checked ${unmatchedEntries.length} unmatched entries.`
	);

	// Log details for debugging
	const sampleEntries = unmatchedEntries.slice(0, 3).map(e => ({
		id: e.id,
		price: e.price,
		datetime: e.datetime
	}));
	console.debug(`[TradeMetrics] Sample unmatched entries:`, sampleEntries);

	return null;
}

/**
 * Create a completed position object from entry and close actions
 */
function createCompletedPosition(
	entryAction: TradeAction,
	closeAction: TradeAction,
	tolerancePercent: number
): CompletedPosition {
	const direction: "long" | "short" = entryAction.trade_action === "buy" ? "long" : "short";
	const { pnl, pnlPercentage, isWin } = calculatePositionPnL(entryAction, closeAction, undefined);

	const entryDate = new Date(entryAction.datetime);
	const exitDate = new Date(closeAction.datetime);
	const durationMs = exitDate.getTime() - entryDate.getTime();
	const durationHours = durationMs / (1000 * 60 * 60);

	const entryTp = entryAction.tp || 0;
	const entrySl = entryAction.sl || 0;
	const entryPrice = entryAction.price;
	const size = entryAction.size || 0;

	// Calculate potential profit/loss
	let potentialProfit: number;
	let potentialLoss: number;

	if (direction === "long") {
		potentialProfit = (entryTp - entryPrice) * size;
		potentialLoss = Math.abs((entrySl - entryPrice) * size);
	} else {
		// For short positions
		potentialProfit = (entryPrice - entryTp) * size;
		potentialLoss = Math.abs((entryPrice - entrySl) * size);
	}

	// Risk-reward ratio
	const riskRewardRatio = potentialLoss > 0 ? potentialProfit / potentialLoss : 0;

	const closeReason = detectCloseReason(
		closeAction.price,
		entryAction.tp,
		entryAction.sl,
		tolerancePercent
	);

	return {
		entryAction,
		closeAction,
		direction,
		closeReason,
		pnl,
		pnlPercentage,
		isWin,
		entryDate,
		exitDate,
		durationHours,
		entryTp,
		entrySl,
		potentialProfit,
		potentialLoss,
		actualRiskReward: riskRewardRatio
	};
}

/**
 * Create an open position object (no close action yet)
 */
function createOpenPosition(
	entryAction: TradeAction,
	currentPrice: number | undefined
): CompletedPosition {
	const direction: "long" | "short" = entryAction.trade_action === "buy" ? "long" : "short";
	const { pnl, pnlPercentage, isWin } = calculatePositionPnL(entryAction, undefined, currentPrice);

	const entryDate = new Date(entryAction.datetime);

	const entryTp = entryAction.tp || 0;
	const entrySl = entryAction.sl || 0;
	const entryPrice = entryAction.price;
	const size = entryAction.size || 0;

	// Calculate potential profit/loss
	let potentialProfit: number;
	let potentialLoss: number;

	if (direction === "long") {
		potentialProfit = (entryTp - entryPrice) * size;
		potentialLoss = Math.abs((entrySl - entryPrice) * size);
	} else {
		potentialProfit = (entryPrice - entryTp) * size;
		potentialLoss = Math.abs((entryPrice - entrySl) * size);
	}

	// Risk-reward ratio
	const riskRewardRatio = potentialLoss > 0 ? potentialProfit / potentialLoss : 0;

	return {
		entryAction,
		closeAction: undefined,
		direction,
		closeReason: {
			type: "open",
			confidence: "certain",
			description: currentPrice ? `Open position (valued at ${currentPrice})` : "Open position"
		},
		pnl,
		pnlPercentage,
		isWin,
		entryDate,
		exitDate: undefined,
		durationHours: undefined,
		entryTp,
		entrySl,
		potentialProfit,
		potentialLoss,
		actualRiskReward: riskRewardRatio
	};
}

/**
 * Match close actions to their corresponding entry actions
 */
function matchPositions(
	tradeActions: TradeAction[],
	currentPrice: number | undefined,
	tolerancePercent: number
): CompletedPosition[] {
	// Sort by datetime
	const sorted = [...tradeActions].sort(
		(a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
	);

	// Separate entries and closes
	const entries: TradeAction[] = [];
	const closes: TradeAction[] = [];

	for (const action of sorted) {
		if (action.trade_action === "buy" || action.trade_action === "sell") {
			entries.push(action);
		} else if (action.trade_action === "close") {
			closes.push(action);
		}
	}

	// Match closes to entries
	const completedPositions: CompletedPosition[] = [];
	const matchedEntryIds = new Set<string>();

	for (const closeAction of closes) {
		const entryAction = findMatchingEntry(closeAction, entries, matchedEntryIds, tolerancePercent);

		if (entryAction) {
			const position = createCompletedPosition(entryAction, closeAction, tolerancePercent);
			completedPositions.push(position);
			matchedEntryIds.add(entryAction.id);
		} else {
			console.warn(`[TradeMetrics] Unmatched close action at ${closeAction.datetime} (entry_price: ${closeAction.entry_price})`);
		}
	}

	// Add unmatched entries as open positions
	const unmatchedEntries = entries.filter(e => !matchedEntryIds.has(e.id));
	if (unmatchedEntries.length > 0) {
		console.info(`[TradeMetrics] ${unmatchedEntries.length} positions still open, valued at ${currentPrice || 'entry price'}`);
		for (const entry of unmatchedEntries) {
			completedPositions.push(createOpenPosition(entry, currentPrice));
		}
	}

	return completedPositions;
}

/**
 * Calculate performance metrics from trade actions (EXTENDED VERSION)
 * Supports independent long/short positions with TP/SL analysis
 */
export function calculateTradeMetricsExtended(
	tradeActions: TradeAction[],
	config: TradeMetricsConfig = {}
): TradeMetricsExtended {
	const {
		initialCapital = 10000,
		priceTolerancePercent = 0.1, // 0.1%
		currentPrice
	} = config;

	const tolerancePercent = priceTolerancePercent / 100; // Convert to decimal

	// Match positions
	const positions = matchPositions(tradeActions, currentPrice, tolerancePercent);

	// Filter to only completed positions for most metrics
	const completedPositions = positions.filter(p => p.closeAction !== undefined);

	// If no completed trades, return empty metrics
	if (completedPositions.length === 0) {
		return {
			...getEmptyMetrics(),
			tpHitRate: 0,
			slHitRate: 0,
			manualCloseRate: 0,
			openPositionsCount: positions.length,
			averageRiskReward: 0,
			winRateTpHit: 0,
			winRateSlHit: 0,
			winRateManual: 0,
			longPositions: 0,
			shortPositions: 0,
			longWinRate: 0,
			shortWinRate: 0,
			averageTradeDurationHours: 0,
			averageWinDurationHours: 0,
			averageLossDurationHours: 0
		};
	}

	// ============================================================================
	// BASIC STATISTICS
	// ============================================================================
	const totalTrades = completedPositions.length;
	const winningTrades = completedPositions.filter((t) => t.isWin).length;
	const losingTrades = totalTrades - winningTrades;
	const winRate = (winningTrades / totalTrades) * 100;

	// ============================================================================
	// PNL METRICS
	// ============================================================================
	const totalPnL = completedPositions.reduce((sum, t) => sum + t.pnl, 0);
	const totalPnLPercentage = (totalPnL / initialCapital) * 100;
	const averagePnL = totalPnL / totalTrades;

	const wins = completedPositions.filter((t) => t.isWin);
	const losses = completedPositions.filter((t) => !t.isWin);

	const averageWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
	const averageLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length : 0;

	const bestTrade = Math.max(...completedPositions.map((t) => t.pnl));
	const worstTrade = Math.min(...completedPositions.map((t) => t.pnl));

	const totalProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
	const totalLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
	const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

	// ============================================================================
	// SHARPE AND SORTINO RATIOS
	// ============================================================================
	const returns = completedPositions.map((t) => t.pnlPercentage);
	const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

	// Standard deviation for Sharpe ratio
	const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
	const stdDev = Math.sqrt(variance);
	const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

	// Downside deviation for Sortino ratio
	const negativeReturns = returns.filter((r) => r < 0);
	const downsideVariance = negativeReturns.length > 0
		? negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length
		: 0;
	const downsideDeviation = Math.sqrt(downsideVariance);
	const sortinoRatio = downsideDeviation > 0 ? (avgReturn / downsideDeviation) * Math.sqrt(252) : 0;

	// ============================================================================
	// DRAWDOWN METRICS
	// ============================================================================
	const equityCurve = [initialCapital];
	for (const position of completedPositions) {
		equityCurve.push(equityCurve[equityCurve.length - 1] + position.pnl);
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

	// ============================================================================
	// TP/SL HIT RATES
	// ============================================================================
	const tpHits = completedPositions.filter(p => p.closeReason.type === "tp_hit");
	const slHits = completedPositions.filter(p => p.closeReason.type === "sl_hit");
	const manualCloses = completedPositions.filter(p => p.closeReason.type === "manual");
	const openPositionsCount = positions.length - completedPositions.length;

	const tpHitRate = (tpHits.length / totalTrades) * 100;
	const slHitRate = (slHits.length / totalTrades) * 100;
	const manualCloseRate = (manualCloses.length / totalTrades) * 100;

	// Win rate by exit type
	const winRateTpHit = tpHits.length > 0
		? (tpHits.filter(p => p.isWin).length / tpHits.length) * 100
		: 0;
	const winRateSlHit = slHits.length > 0
		? (slHits.filter(p => p.isWin).length / slHits.length) * 100
		: 0;
	const winRateManual = manualCloses.length > 0
		? (manualCloses.filter(p => p.isWin).length / manualCloses.length) * 100
		: 0;

	// ============================================================================
	// POSITION TYPE BREAKDOWN
	// ============================================================================
	const longPositions = completedPositions.filter(p => p.direction === "long");
	const shortPositions = completedPositions.filter(p => p.direction === "short");

	const longWinRate = longPositions.length > 0
		? (longPositions.filter(p => p.isWin).length / longPositions.length) * 100
		: 0;
	const shortWinRate = shortPositions.length > 0
		? (shortPositions.filter(p => p.isWin).length / shortPositions.length) * 100
		: 0;

	// ============================================================================
	// RISK/REWARD ANALYSIS
	// ============================================================================
	const averageRiskReward = completedPositions.length > 0
		? completedPositions.reduce((sum, p) => sum + p.actualRiskReward, 0) / completedPositions.length
		: 0;

	// ============================================================================
	// DURATION METRICS
	// ============================================================================
	const positionsWithDuration = completedPositions.filter(p => p.durationHours !== undefined);
	const averageTradeDurationHours = positionsWithDuration.length > 0
		? positionsWithDuration.reduce((sum, p) => sum + (p.durationHours || 0), 0) / positionsWithDuration.length
		: 0;

	const winsWithDuration = wins.filter(p => p.durationHours !== undefined);
	const averageWinDurationHours = winsWithDuration.length > 0
		? winsWithDuration.reduce((sum, p) => sum + (p.durationHours || 0), 0) / winsWithDuration.length
		: 0;

	const lossesWithDuration = losses.filter(p => p.durationHours !== undefined);
	const averageLossDurationHours = lossesWithDuration.length > 0
		? lossesWithDuration.reduce((sum, p) => sum + (p.durationHours || 0), 0) / lossesWithDuration.length
		: 0;

	// ============================================================================
	// EXPECTANCY
	// ============================================================================
	const expectancy = totalPnL / totalTrades;

	return {
		// Original metrics
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

		// New extended metrics
		tpHitRate,
		slHitRate,
		manualCloseRate,
		openPositionsCount,
		averageRiskReward,
		winRateTpHit,
		winRateSlHit,
		winRateManual,
		longPositions: longPositions.length,
		shortPositions: shortPositions.length,
		longWinRate,
		shortWinRate,
		averageTradeDurationHours,
		averageWinDurationHours,
		averageLossDurationHours
	};
}

/**
 * Calculate performance metrics from trade actions
 * Pairs buy and sell trades to calculate round-trip performance
 * @deprecated Use calculateTradeMetricsExtended() for better accuracy with TP/SL analysis
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
