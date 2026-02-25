import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema";

// export const auth = betterAuth({
//   emailAndPassword: {
//     enabled: true,
//     requireEmailVerification: false,
//   },
//   socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_CLIENT_ID ?? '',
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
//       enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
//     },
//     github: {
//       clientId: process.env.GITHUB_ID ?? '',
//       clientSecret: process.env.GITHUB_SECRET ?? '',
//       enabled: !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
//     },
//   },
//   plugins: [tanstackStartCookies()],
// })

export const auth = betterAuth({
	secret:
		process.env.BETTER_AUTH_SECRET ||
		(import.meta as any).env?.VITE_BETTER_AUTH_SECRET ||
		"fallback_secret_for_dev_only",
	baseURL:
		process.env.BETTER_AUTH_URL ||
		(import.meta as any).env?.VITE_BETTER_AUTH_URL,
	trustedOrigins: [
		"https://okane-signals.dhanabordee.com",
		"https://*.dhanabordee.com",
		"https://okane-signals-web.vercel.app",
		"https://okane-signals.vercel.app",
		"https://*.vercel.app",
		"http://localhost:5173",
		"http://localhost:3000",
	],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	onResponse: async (response: Response) => {
		if (response.status >= 400) {
			try {
				const errorClone = response.clone();
				const errorBody = await errorClone.text();
				console.error(
					`[BetterAuth Error] status: ${response.status}, body: ${errorBody}`,
				);
			} catch (e) {
				console.error(
					`[BetterAuth Error] status: ${response.status} (could not read body)`,
				);
			}
		}
		return response;
	},
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: (process.env.GOOGLE_CLIENT_ID ||
				(import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) as string,
			clientSecret: (process.env.GOOGLE_CLIENT_SECRET ||
				(import.meta as any).env?.VITE_GOOGLE_CLIENT_SECRET) as string,
		},
	},
	user: {
		additionalFields: {
			credits: {
				type: "number",
				defaultValue: 3,
			},
		},
	},
});
