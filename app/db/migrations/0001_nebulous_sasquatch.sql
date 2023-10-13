CREATE TABLE IF NOT EXISTS "cell" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"row" integer NOT NULL,
	"col" integer NOT NULL,
	"room_id" uuid NOT NULL,
	"value" char(1) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cell_row_col_room_id_unique" UNIQUE("row","col","room_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cell" ADD CONSTRAINT "cell_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
