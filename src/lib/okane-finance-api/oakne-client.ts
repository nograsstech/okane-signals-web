import { env } from "$env/dynamic/private";
import { Configuration, SignalsApi } from "./generated";

const config = new Configuration({
	basePath: env.OKANE_FINANCE_API_URL,
	username: env.OKANE_FINANCE_API_USER,
	password: env.OKANE_FINANCE_API_PASSWORD,
});
export const okaneClient = new SignalsApi(config);
