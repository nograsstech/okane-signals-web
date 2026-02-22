// TradingView technical analysis widget
import { useEffect, useRef } from "react";

interface TradingViewAnalysisWidgetProps {
	symbol: string;
}

export function TradingViewAnalysisWidget({
	symbol,
}: TradingViewAnalysisWidgetProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current || !symbol) return;

		const config = {
			interval: "30m",
			width: "100%",
			isTransparent: false,
			height: 450,
			symbol: symbol,
			showIntervalTabs: true,
			displayMode: "single",
			locale: "en",
			colorTheme: "dark",
		};

		// Clear and recreate
		containerRef.current.innerHTML = `
			<div class="tradingview-widget-container">
				<div class="tradingview-widget-container__widget"></div>
			</div>
		`;

		const script = document.createElement("script");
		script.type = "text/javascript";
		script.src =
			"https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
		script.async = true;
		script.innerHTML = JSON.stringify(config);
		containerRef.current.appendChild(script);

		return () => {
			if (containerRef.current) {
				containerRef.current.innerHTML = "";
			}
		};
	}, [symbol]);

	return (
		<div className="my-4">
			<div ref={containerRef} className="tradingview-widget-container" />
		</div>
	);
}
