// Data transformation utilities for converting API data to lightweight-charts format

import type { Time } from "lightweight-charts";
import type { Signal, TradeAction } from "@/lib/types/strategy";
import type {
	ChartDataPoint,
	VolumeDataPoint,
	TradeMarker,
	PriceLine,
} from "../types/chart.types";

/**
 * Transform Signal API response to lightweight-charts candlestick data
 * @param signals - Array of Signal objects from the API
 * @returns Array of candlestick data points
 */
export function transformSignalsToCandlestickData(signals: Signal[]): ChartDataPoint[] {
	return signals
		.map((signal: any) => {
			// Convert gmtTime string to Unix timestamp in seconds
			const time = new Date(signal.gmtTime || signal.gmt_time).getTime() / 1000;

			return {
				time: Math.floor(time) as Time,
				open: signal.open ?? signal.Open ?? 0,
				high: signal.high ?? signal.High ?? 0,
				low: signal.low ?? signal.Low ?? 0,
				close: signal.close ?? signal.Close ?? 0,
			};
		})
		.filter((point) => point.open > 0 && point.high > 0 && point.low > 0 && point.close > 0) // Filter invalid data
		.sort((a, b) => (a.time as number) - (b.time as number)); // Ensure chronological order
}

/**
 * Transform trade actions to chart markers
 * @param tradeActions - Array of TradeAction objects from the API
 * @returns Array of trade markers for the chart
 */
export function transformTradesToMarkers(tradeActions: TradeAction[]): TradeMarker[] {
	return tradeActions
		.filter((trade) => trade.datetime && trade.trade_action && trade.price !== null)
		.map((trade) => {
			// Convert datetime to Unix timestamp in seconds
			const time = new Date(trade.datetime).getTime() / 1000;

			const isBuy = trade.trade_action === "buy";
			const isSell = trade.trade_action === "sell";

			// Determine marker color and position based on trade type
			let color = "#94a3b8"; // Default gray
			let shape: "arrowUp" | "arrowDown" | "circle" = "circle";
			let position: "aboveBar" | "belowBar" | "inBar" = "inBar";

			if (isBuy) {
				color = "#10b981"; // emerald-500
				shape = "arrowUp";
				position = "belowBar"; // Buy markers appear below candles
			} else if (isSell) {
				color = "#ef4444"; // red-500
				shape = "arrowDown";
				position = "aboveBar"; // Sell markers appear above candles
			}

			return {
				time: Math.floor(time) as Time,
				position,
				color,
				shape,
				text: `${trade.trade_action.toUpperCase()} @ ${trade.price}`,
				size: 1.5, // Slightly larger markers
			};
		})
		.sort((a, b) => (a.time as number) - (b.time as number)); // Ensure chronological order
}

/**
 * Create price lines for TP (take profit) and SL (stop loss) levels
 * @param tradeActions - Array of TradeAction objects from the API
 * @returns Array of price lines for the chart
 */
export function createPriceLines(tradeActions: TradeAction[]): PriceLine[] {
	const lines: PriceLine[] = [];

	tradeActions.forEach((trade) => {
		// Take Profit line (green dashed)
		if (trade.tp && trade.tp > 0) {
			lines.push({
				price: Number(trade.tp),
				color: "#10b981", // emerald-500
				lineWidth: 1,
				lineStyle: 2, // Dashed line
				title: `TP ${trade.tp}`,
			});
		}

		// Stop Loss line (red dashed)
		if (trade.sl && trade.sl > 0) {
			lines.push({
				price: Number(trade.sl),
				color: "#ef4444", // red-500
				lineWidth: 1,
				lineStyle: 2, // Dashed line
				title: `SL ${trade.sl}`,
			});
		}
	});

	return lines;
}

/**
 * Transform signals to volume data
 * @param signals - Array of Signal objects from the API
 * @returns Array of volume data points
 */
export function transformVolumeData(signals: Signal[]): VolumeDataPoint[] {
	return signals
		.map((signal: any) => {
			// Convert gmtTime to Unix timestamp in seconds
			const time = new Date(signal.gmtTime || signal.gmt_time).getTime() / 1000;

			// Determine if the candle is up (close >= open) or down
			const isGreen = (signal.close ?? signal.Close ?? 0) >= (signal.open ?? signal.Open ?? 0);

			return {
				time: Math.floor(time) as Time,
				value: signal.volume ?? signal.Volume ?? 0,
				color: isGreen ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)", // Semi-transparent
			};
		})
		.filter((point) => point.value > 0) // Filter zero volume
		.sort((a, b) => (a.time as number) - (b.time as number)); // Ensure chronological order
}

/**
 * Filter data by the given cutoff time
 */
function filterDataByCutoff<T extends { time: Time }>(data: T[], cutoffTime: number): T[] {
	if (data.length === 0) return data;
	return data.filter(item => (item.time as number) >= cutoffTime);
}

/**
 * Transform all data needed for the trading chart
 * @param signals - Array of Signal objects from the API
 * @param tradeActions - Optional array of TradeAction objects from the API
 * @param daysBack - Optional number of days back to filter the chart
 * @returns Object containing all transformed chart data
 */
export function transformChartData(
	signals: Signal[],
	tradeActions?: TradeAction[],
	daysBack: number | null = null
) {
	let candlestickData = transformSignalsToCandlestickData(signals);
	let volumeData = transformVolumeData(signals);
	let tradeMarkers = tradeActions ? transformTradesToMarkers(tradeActions) : [];

	if (daysBack !== null && candlestickData.length > 0) {
		const latestTime = candlestickData[candlestickData.length - 1].time as number;
		const cutoffTime = latestTime - (daysBack * 24 * 60 * 60);

		candlestickData = filterDataByCutoff(candlestickData, cutoffTime);
		volumeData = filterDataByCutoff(volumeData, cutoffTime);
		tradeMarkers = filterDataByCutoff(tradeMarkers, cutoffTime);
	}

	// Never plot trade actions that are older than the earliest plotted candlestick
	if (candlestickData.length > 0) {
		const earliestAvailableTime = candlestickData[0].time as number;
		tradeMarkers = tradeMarkers.filter((item) => (item.time as number) >= earliestAvailableTime);
	}

	return {
		candlestickData,
		volumeData,
		tradeMarkers,
		priceLines: tradeActions ? createPriceLines(tradeActions) : [],
	};
}
