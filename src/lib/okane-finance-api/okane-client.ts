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

// Custom fetch that upgrades http:// to https:// on HTTPS pages (prevents mixed-content)
function protocolAwareFetch(url: string, init?: RequestInit): Promise<Response> {
	return fetch(url, init);
}

// Factory function to create the API client with proper config
export function createOkaneClient() {
	const config = new Configuration({
		basePath: getEnvVar("VITE_OKANE_FINANCE_API_URL"),
		username: getEnvVar("VITE_OKANE_FINANCE_API_USER"),
		password: getEnvVar("VITE_OKANE_FINANCE_API_PASSWORD"),
		fetchApi: protocolAwareFetch,
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
