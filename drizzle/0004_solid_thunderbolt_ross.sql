DROP INDEX "idx_unique_favorite";--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_favorite" ON "user_favorite_strategies" USING btree ("user_id","ticker","strategy","period","interval");