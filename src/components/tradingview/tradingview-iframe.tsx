// TradingView events widget iframe
import { useEffect, useRef } from "react";

export function TradingviewIframe({ app = "stock" }: { app?: string }) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const widgetConfig = {
			colorTheme: "dark",
			isTransparent: false,
			width: "100%",
			height: "550",
			locale: "en",
			importanceFilter: "-1,0,1",
			countryFilter:
				"ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu",
		};

		containerRef.current.innerHTML = `
			<div class="tradingview-widget-container">
				<div class="tradingview-widget-container__widget"></div>
				<script type="text/javascript"
					src="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
					async>
				${JSON.stringify(widgetConfig)}
				<\/script>
			</div>
		`;
	}, [app]);

	return (
		<div className="my-4">
			<div ref={containerRef} className="tradingview-widget-container" />
			<iframe className="w-full h-[1000px]" title="TradingView Events" />
		</div>
	);
}
