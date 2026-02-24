import { Configuration, SignalsApi } from "./generated";

// Helper function to get env vars that works in both browser and Node.js
function getEnvVar(name: string): string {
	// Client-side (browser with Vite)
	if (typeof import.meta !== "undefined" && import.meta.env) {
		return import.meta.env[name] || "";
	}
	// Server-side (Node.js)
	return process.env[name] || "";
}

// Helper to ensure HTTPS protocol when on HTTPS origin (prevents mixed-content errors)
function normalizeApiUrl(url: string): string {
	if (!url) return "";
	// Protocol-relative URLs (//example.com) are handled by the browser automatically
	if (url.startsWith('//')) {
		return url;
	}
	// For localhost or IP addresses, keep as-is
	if (url.includes('localhost') || /^\d+\.\d+\.\d+\.\d+/.test(url)) {
		return url;
	}
	// For production URLs, ensure HTTPS when the page is HTTPS
	if (typeof window !== 'undefined' && window.location?.protocol === 'https:') {
		return url.replace(/^http:/, 'https:');
	}
	return url;
}

// Factory function to create the API client with proper config
export function createOkaneClient() {
	const config = new Configuration({
		basePath: normalizeApiUrl(getEnvVar("VITE_OKANE_FINANCE_API_URL")),
		username: getEnvVar("VITE_OKANE_FINANCE_API_USER"),
		password: getEnvVar("VITE_OKANE_FINANCE_API_PASSWORD"),
	});
	return new SignalsApi(config);
}

// Singleton instance for convenience
let okaneClientInstance: SignalsApi | null = null;

export function getOkaneClient(): SignalsApi {
	if (!okaneClientInstance) {
		okaneClientInstance = createOkaneClient();
	}
	return okaneClientInstance;
}
