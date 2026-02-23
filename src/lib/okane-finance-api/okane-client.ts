import { Configuration, SignalsApi } from "./generated";

// Factory function to create the API client with proper config
export function createOkaneClient() {
	const config = new Configuration({
		basePath: process.env.OKANE_FINANCE_API_URL,
		username: process.env.OKANE_FINANCE_API_USER,
		password: process.env.OKANE_FINANCE_API_PASSWORD,
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
