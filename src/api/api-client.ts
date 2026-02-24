// Base API client with fetch wrapper

const OKANE_FINANCE_API_BASE_URL =
	import.meta.env.PUBLIC_OKANE_FINANCE_API_URL ||
	import.meta.env.OKANE_FINANCE_API_URL ||
	"http://localhost:8000";

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