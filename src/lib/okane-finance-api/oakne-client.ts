import { env } from "$env/dynamic/private";
import { Configuration, SignalsApi } from "./generated";

// Helper to ensure HTTPS for production URLs (server-side)
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
	// For production URLs, ensure HTTPS
	return url.replace(/^http:/, 'https:');
}

const config = new Configuration({
	basePath: normalizeApiUrl(env.OKANE_FINANCE_API_URL),
	username: env.OKANE_FINANCE_API_USER,
	password: env.OKANE_FINANCE_API_PASSWORD,
});
export const okaneClient = new SignalsApi(config);
