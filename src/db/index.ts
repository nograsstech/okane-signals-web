import { drizzle } from "drizzle-orm/node-postgres";

import * as authSchema from "./schema.ts";
import * as backtestSchema from "./schemas/schema.ts";

// Merge all schemas with unique namespaces to avoid conflicts
const schema = {
	...authSchema,
	...backtestSchema,
};

export const db = drizzle(process.env.DATABASE_URL!, { schema });

// Re-export auth schemas
export { user, session, account, verification } from "./schema.ts";

// Re-export backtest schemas
export { backtestStats, tradeActions } from "./schemas/schema.ts";
