import { env } from "$env/dynamic/private";
import { Configuration, SignalsApi } from "./generated";

// Custom fetch that ensures https:// for production URLs on server-side
function protocolAwareFetch(url: string, init?: RequestInit): Promise<Response> {
	return fetch(url, init);
}

const config = new Configuration({
	basePath: env.OKANE_FINANCE_API_URL,
	username: env.OKANE_FINANCE_API_USER,
	password: env.OKANE_FINANCE_API_PASSWORD,
	fetchApi: protocolAwareFetch,
});
export const okaneClient = new SignalsApi(config);
