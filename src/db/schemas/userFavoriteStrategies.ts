import {
	index,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "../schema";

export const userFavoriteStrategies = pgTable(
	"user_favorite_strategies",
	{
		id: serial("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		ticker: text("ticker").notNull(),
		strategy: text("strategy").notNull(),
		period: text("period").notNull(),
		interval: text("interval").notNull(),
		notes: text("notes"), // Reserved for future use
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => [
		index("idx_user_favorites").on(table.userId),
		index("idx_unique_favorite").on(
			table.userId,
			table.ticker,
			table.strategy,
			table.period,
			table.interval,
		),
	],
);
