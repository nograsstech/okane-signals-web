// Chart configuration matching the terminal aesthetic

import type { ColorType } from "lightweight-charts";

/**
 * Theme colors for the trading chart
 * Matches the dark terminal aesthetic used in the app
 */
export const CHART_COLORS = {
	// Background colors
	background: "#121212", // Dark background matching card
	grid: "#1e1e1e", // Subtle grid lines

	// Text colors
	text: "#d4d4d4", // Lighter text for better visibility
	textSecondary: "#666666", // Secondary text

	// Crosshair colors
	crosshair: "#505050",
	crosshairLabelBg: "#121212",

	// Candlestick colors
	candleUp: "#10b981", // emerald-500 for buy/up candles
	candleDown: "#ef4444", // red-500 for sell/down candles

	// Candlestick borders
	borderUp: "#10b981",
	borderDown: "#ef4444",

	// Wick colors
	wickUp: "#10b981",
	wickDown: "#ef4444",

	// Volume colors
	volumeUp: "rgba(16, 185, 129, 0.5)", // Semi-transparent emerald
	volumeDown: "rgba(239, 68, 68, 0.5)", // Semi-transparent red

	// Trade marker colors
	markerBuy: "#10b981", // Green for buy markers
	markerSell: "#ef4444", // Red for sell markers
	markerClose: "#94a3b8", // Gray for close markers

	// Price line colors
	lineTp: "#10b981", // Green for take profit lines
	lineSl: "#ef4444", // Red for stop loss lines

	// Border colors
	border: "#2a2a2a", // Subtle border for price scales
} as const;

/**
 * Get default chart options for lightweight-charts
 * Configures the chart layout, grid, crosshair, and scales
 */
export function getChartOptions(container: HTMLElement) {
	return {
		width: container.clientWidth,
		height: container.clientHeight,
		layout: {
			background: { type: "solid" as ColorType, color: CHART_COLORS.background },
			textColor: CHART_COLORS.text,
		},
		grid: {
			vertLines: {
				color: CHART_COLORS.grid,
				style: 0, // Solid line
				visible: true,
			},
			horzLines: {
				color: CHART_COLORS.grid,
				style: 0, // Solid line
				visible: true,
			},
		},
		crosshair: {
			mode: 1, // Magnet mode - snaps to data points
			vertLine: {
				color: CHART_COLORS.crosshair,
				width: 1,
				style: 3, // Dashed line
				labelBackgroundColor: CHART_COLORS.crosshairLabelBg,
			},
			horzLine: {
				color: CHART_COLORS.crosshair,
				width: 1,
				style: 3, // Dashed line
				labelBackgroundColor: CHART_COLORS.crosshairLabelBg,
			},
		},
		rightPriceScale: {
			borderColor: CHART_COLORS.border,
		},
		timeScale: {
			borderColor: CHART_COLORS.border,
			timeVisible: true,
			secondsVisible: false,
			rightOffset: 5,
			barSpacing: 10, // Default bar spacing
			minBarSpacing: 3, // Minimum bar spacing to prevent overcrowding
			maxBarSpacing: 50, // Maximum bar spacing
			fixLeftEdge: true, // Ensure left edge is aligned
			fixRightEdge: false, // Allow right edge to extend
			lockVisibleTimeRangeOnResize: true, // Maintain visible range on resize
		},
	} as const;
}

/**
 * Get chart options with height adjustment for time scale labels
 * Ensures proper space is allocated for the x-axis time labels
 */
export function getChartOptionsWithTimeScale(container: HTMLElement) {
	const options = getChartOptions(container);
	return {
		...options,
		// Ensure minimum height for time scale visibility
		height: Math.max(container.clientHeight, 300),
	};
}

/**
 * Candlestick series options
 * Controls the appearance of candlesticks
 */
export const CANDLESTICK_OPTIONS = {
	upColor: CHART_COLORS.candleUp,
	downColor: CHART_COLORS.candleDown,
	borderUpColor: CHART_COLORS.borderUp,
	borderDownColor: CHART_COLORS.borderDown,
	wickUpColor: CHART_COLORS.wickUp,
	wickDownColor: CHART_COLORS.wickDown,
} as const;

/**
 * Volume series options
 * Controls the appearance of volume bars
 */
export const VOLUME_OPTIONS = {
	color: CHART_COLORS.volumeUp,
	priceFormat: {
		type: "volume" as const,
	},
	priceScaleId: "", // Use separate scale for volume
} as const;
