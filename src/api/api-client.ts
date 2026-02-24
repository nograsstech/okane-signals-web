// Base API client with fetch wrapper

// Helper to ensure HTTPS protocol when on HTTPS origin (prevents mixed-content errors)
function normalizeApiUrl(url: string): string {
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

const OKANE_FINANCE_API_BASE_URL = normalizeApiUrl(
	import.meta.env.PUBLIC_OKANE_FINANCE_API_URL ||
	import.meta.env.OKANE_FINANCE_API_URL ||
	"http://localhost:8000"
);

export interface ApiError {
	message: string;
	status: number;
}

export class APIError extends Error implements ApiError {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "APIError";
		this.status = status;
	}
}

export async function apiFetchOkaneFinanceAPI<T>(
	endpoint: string,
	options?: RequestInit,
): Promise<T> {
	const url = `${OKANE_FINANCE_API_BASE_URL}${endpoint}`;

	const response = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	if (!response.ok) {
		throw new APIError(`API Error: ${response.statusText}`, response.status);
	}

	return response.json() as Promise<T>;
}

export async function apiFetchOkaneSignals<T>(
	endpoint: string,
	options?: RequestInit,
): Promise<T> {
	const url = `${endpoint}`;

	const response = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	if (!response.ok) {
		throw new APIError(`API Error: ${response.statusText}`, response.status);
	}

	return response.json() as Promise<T>;
}