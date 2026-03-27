import { pgTable, uniqueIndex, index, foreignKey, serial, text, timestamp, numeric, boolean, doublePrecision, jsonb, bigint, integer, unique, primaryKey, pgView } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userFavoriteStrategies = pgTable("user_favorite_strategies", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	ticker: text().notNull(),
	strategy: text().notNull(),
	period: text().notNull(),
	interval: text().notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_unique_favorite").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.ticker.asc().nullsLast().op("text_ops"), table.strategy.asc().nullsLast().op("text_ops"), table.period.asc().nullsLast().op("text_ops"), table.interval.asc().nullsLast().op("text_ops")),
	index("idx_user_favorites").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_favorite_strategies_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const backtestStats = pgTable("backtest_stats", {
	id: serial().primaryKey().notNull(),
	ticker: text(),
	maxDrawdownPercentage: numeric("max_drawdown_percentage"),
	startTime: text("start_time"),
	endTime: text("end_time"),
	duration: text(),
	exposureTimePercentage: numeric("exposure_time_percentage"),
	finalEquity: numeric("final_equity"),
	peakEquity: numeric("peak_equity"),
	returnPercentage: numeric("return_percentage"),
	buyAndHoldReturn: numeric("buy_and_hold_return"),
	returnAnnualized: numeric("return_annualized"),
	volatilityAnnualized: numeric("volatility_annualized"),
	sharpeRatio: numeric("sharpe_ratio"),
	sortinoRatio: numeric("sortino_ratio"),
	calmarRatio: numeric("calmar_ratio"),
	averageDrawdownPercentage: numeric("average_drawdown_percentage"),
	maxDrawdownDuration: text("max_drawdown_duration"),
	averageDrawdownDuration: text("average_drawdown_duration"),
	tradeCount: numeric("trade_count"),
	winRate: numeric("win_rate"),
	bestTrade: numeric("best_trade"),
	worstTrade: numeric("worst_trade"),
	avgTrade: numeric("avg_trade"),
	maxTradeDuration: text("max_trade_duration"),
	averageTradeDuration: text("average_trade_duration"),
	profitFactor: numeric("profit_factor"),
	html: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	strategy: text(),
	period: text(),
	interval: text(),
	refId: text("ref_id"),
	notificationsOn: boolean("notifications_on").default(false),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	tpslRatio: doublePrecision("tpsl_ratio"),
	slCoef: doublePrecision("sl_coef"),
	lastOptimizedAt: timestamp("last_optimized_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`),
	tpCoef: doublePrecision("tp_coef"),
	equityCurve: jsonb("equity_curve"),
}, (table) => [
	index("idx_backtest_stats_dedup").using("btree", table.ticker.asc().nullsLast().op("text_ops"), table.strategy.asc().nullsLast().op("text_ops"), table.period.asc().nullsLast().op("text_ops"), table.interval.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
]);

export const tradeActions = pgTable("trade_actions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "trade_actions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`),
	backtestId: integer("backtest_id"),
	datetime: timestamp({ mode: 'string' }),
	tradeAction: text("trade_action"),
	entryPrice: doublePrecision("entry_price"),
	price: doublePrecision(),
	sl: doublePrecision(),
	tp: doublePrecision(),
	size: doublePrecision(),
}, (table) => [
	index("idx_trade_actions_backtest_id").using("btree", table.backtestId.asc().nullsLast().op("int4_ops")),
	index("idx_trade_actions_datetime").using("btree", table.datetime.asc().nullsLast().op("timestamp_ops")),
	index("idx_trade_actions_datetime_backtest").using("btree", table.datetime.asc().nullsLast().op("int4_ops"), table.backtestId.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.backtestId],
			foreignColumns: [backtestStats.id],
			name: "public_trade_actions_backtest_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.backtestId],
			foreignColumns: [backtestStats.id],
			name: "trade_actions_backtest_id_backtest_stats_id_fk"
		}),
]);

export const userOldBackup = pgTable("user-old-backup", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	role: text(),
});

export const sessionOldBackup = pgTable("session-old-backup", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userOldBackup.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	credits: integer().default(3),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const verificationToken = pgTable("verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verificationToken_identifier_token_pk"}),
]);

export const accountOldBackup = pgTable("account-old-backup", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userOldBackup.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.provider, table.providerAccountId], name: "account_provider_providerAccountId_pk"}),
]);
export const uniqueStrategies = pgView("unique_strategies", {	id: integer(),
	ticker: text(),
	strategy: text(),
	period: text(),
	interval: text(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	lastOptimizedAt: timestamp("last_optimized_at", { withTimezone: true, mode: 'string' }),
	tpslRatio: doublePrecision("tpsl_ratio"),
	tpCoef: doublePrecision("tp_coef"),
	slCoef: doublePrecision("sl_coef"),
	notificationsOn: boolean("notifications_on"),
}).with({"securityInvoker":"on"}).as(sql`SELECT b1.id, b1.ticker, b1.strategy, b1.period, b1."interval", b1.created_at, b1.updated_at, b1.last_optimized_at, b1.tpsl_ratio, b1.tp_coef, b1.sl_coef, b1.notifications_on FROM backtest_stats b1 WHERE ((b1.ticker, b1.strategy, b1.period, b1."interval", b1.created_at) IN ( SELECT b2.ticker, b2.strategy, b2.period, b2."interval", max(b2.created_at) AS max FROM backtest_stats b2 GROUP BY b2.ticker, b2.strategy, b2.period, b2."interval"))`);