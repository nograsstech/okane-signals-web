CREATE TABLE "user_favorite_strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"ticker" text NOT NULL,
	"strategy" text NOT NULL,
	"period" text NOT NULL,
	"interval" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_favorite_strategies" ADD CONSTRAINT "user_favorite_strategies_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_favorites" ON "user_favorite_strategies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_unique_favorite" ON "user_favorite_strategies" USING btree ("user_id","ticker","strategy","period","interval");