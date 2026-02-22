import { pgTable, text, numeric, timestamp, serial } from "drizzle-orm/pg-core";
import { backtestStats } from "./backtestStats";

export const tradeActions = pgTable("trade_actions", {
	id: serial("id").primaryKey(),
	created_at: timestamp("created_at").defaultNow(),
	backtest_id: numeric("backtest_id").references(() => backtestStats.id),
	datetime: timestamp("datetime"),
	trade_action: text("trade_action"),
	entry_price: numeric("entry_price"),
	price: numeric("price"),
	sl: numeric("sl"),
	tp: numeric("tp"),
	size: numeric("size"),
});
