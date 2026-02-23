// Lightweight-charts compatible types for trading chart component

import type { Time } from "lightweight-charts";
import type { Signal, TradeAction } from "@/lib/types/strategy";

/**
 * Candlestick data point for lightweight-charts
 * Each point represents a single time period's OHLC data
 */
export interface ChartDataPoint {
	time: Time; // Business day timestamp
	open: number;
	high: number;
	low: number;
	close: number;
}

/**
 * Volume data point for volume bars
 */
export interface VolumeDataPoint {
	time: Time; // Business day timestamp
	value: number;
	color: string; // Color based on candle direction
}

/**
 * Trade marker for showing buy/sell/exit points on chart
 */
export interface TradeMarker {
	time: Time; // Business day timestamp
	position: "aboveBar" | "belowBar" | "inBar";
	color: string;
	shape: "circle" | "square" | "arrowUp" | "arrowDown";
	text: string;
	size?: number;
}

/**
 * Price line for TP/SL levels
 */
export interface PriceLine {
	price: number;
	color: string;
	lineWidth: 1 | 2 | 3 | 4;
	lineStyle: 0 | 1 | 2 | 3 | 4;
	axisLabelVisible?: boolean;
	title?: string;
}

/**
 * Props for the TradingChart component
 */
export interface TradingChartProps {
	/** Ticker symbol for the chart */
	ticker: string;
	/** Signals data with OHLC information */
	signals: Signal[];
	/** Optional trade actions for markers */
	tradeActions?: TradeAction[];
	/** Chart height in pixels or CSS string */
	height?: number | string;
	/** Whether to show volume bars */
	showVolume?: boolean;
	/** Whether to show trade markers */
	showMarkers?: boolean;
	/** Days back from the latest record to plot */
	daysBack?: number | null;
	/** Current interval for the chart data */
	interval?: string;
	/** Callback when interval changes */
	onIntervalChange?: (interval: string) => void;
	/** Available interval options */
	intervalOptions?: string[];
	/** Additional CSS classes */
	className?: string;
}

/**
 * Transformed data ready for lightweight-charts
 */
export interface TransformedChartData {
	candlestickData: ChartDataPoint[];
	volumeData: VolumeDataPoint[];
	tradeMarkers: TradeMarker[];
	priceLines: PriceLine[];
}
