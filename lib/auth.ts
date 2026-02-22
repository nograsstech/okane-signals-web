import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema";
// export const auth = betterAuth({
//     database: drizzleAdapter(db, {
//         provider: "pg", // or "mysql", "sqlite"
//     }),
// });


export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || (import.meta as any).env?.VITE_BETTER_AUTH_SECRET || "fallback_secret_for_dev_only", 
    baseURL: process.env.BETTER_AUTH_URL || (import.meta as any).env?.VITE_BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    onResponse: async (response: Response) => {
        if (response.status >= 400) {
            try {
                const errorClone = response.clone();
                const errorBody = await errorClone.text();
                console.error(`[BetterAuth Error] status: ${response.status}, body: ${errorBody}`);
            } catch (e) {
                console.error(`[BetterAuth Error] status: ${response.status} (could not read body)`);
            }
        }
        return response;
    },
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: (process.env.GOOGLE_CLIENT_ID || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) as string,
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || (import.meta as any).env?.VITE_GOOGLE_CLIENT_SECRET) as string,
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
