// Trading chart component exports

export { TradingChart } from "./trading-chart";

// Export types for external use
export type {
	ChartDataPoint,
	VolumeDataPoint,
	TradeMarker,
	PriceLine,
	TradingChartProps,
	TransformedChartData,
} from "./types/chart.types";

// Export data transformers for external use
export {
	transformSignalsToCandlestickData,
	transformTradesToMarkers,
	createPriceLines,
	transformVolumeData,
	transformChartData,
} from "./utils/data-transformers";

// Export hooks for external use
export { useChartData } from "./hooks/use-chart-data";
export { useChartResize } from "./hooks/use-chart-resize";
