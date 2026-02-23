// Custom hook for handling chart resize

import { useEffect, useRef } from "react";

/**
 * Hook for handling responsive chart resizing
 * Automatically resizes the chart when the container size changes
 *
 * @param chart - The lightweight-charts IChartApi instance
 * @param containerRef - React ref to the container element
 */
export function useChartResize(
	chart: any, // IChartApi from lightweight-charts (using any to avoid import issues)
	containerRef: React.RefObject<HTMLElement>,
) {
	const resizeTimeoutRef = useRef<NodeJS.Timeout>(null);

	useEffect(() => {
		if (!chart || !containerRef.current) return;

		const handleResize = () => {
			// Debounce resize for performance
			if (resizeTimeoutRef.current) {
				clearTimeout(resizeTimeoutRef.current);
			}

			resizeTimeoutRef.current = setTimeout(() => {
				if (containerRef.current) {
					chart.applyOptions({
						width: containerRef.current.clientWidth,
					});
				}
			}, 100);
		};

		// Set initial size
		const container = containerRef.current;
		if (container) {
			chart.applyOptions({
				width: container.clientWidth,
				height: container.clientHeight,
			});
		}

		// Listen to window resize
		window.addEventListener("resize", handleResize);

		// Cleanup
		return () => {
			window.removeEventListener("resize", handleResize);
			if (resizeTimeoutRef.current) {
				clearTimeout(resizeTimeoutRef.current);
			}
		};
	}, [chart, containerRef]);
}
