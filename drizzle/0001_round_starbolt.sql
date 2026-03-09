CREATE TABLE "trade_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"backtest_id" numeric,
	"datetime" timestamp,
	"trade_action" text,
	"entry_price" numeric,
	"price" numeric,
	"sl" numeric,
	"tp" numeric,
	"size" numeric
);
--> statement-breakpoint
ALTER TABLE "trade_actions" ADD CONSTRAINT "trade_actions_backtest_id_backtest_stats_id_fk" FOREIGN KEY ("backtest_id") REFERENCES "public"."backtest_stats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_trade_actions_datetime" ON "trade_actions" USING btree ("datetime");--> statement-breakpoint
CREATE INDEX "idx_trade_actions_backtest_id" ON "trade_actions" USING btree ("backtest_id");--> statement-breakpoint
CREATE INDEX "idx_trade_actions_datetime_backtest" ON "trade_actions" USING btree ("datetime","backtest_id");