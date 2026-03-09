-- Add indexes to trade_actions table for performance
CREATE INDEX IF NOT EXISTS "idx_trade_actions_datetime" ON "trade_actions" USING btree ("datetime");
CREATE INDEX IF NOT EXISTS "idx_trade_actions_backtest_id" ON "trade_actions" USING btree ("backtest_id");
CREATE INDEX IF NOT EXISTS "idx_trade_actions_datetime_backtest" ON "trade_actions" USING btree ("datetime","backtest_id");
