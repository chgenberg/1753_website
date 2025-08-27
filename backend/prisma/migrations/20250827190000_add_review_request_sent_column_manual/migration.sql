-- Add reviewRequestSent column to orders if it doesn't exist
ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "reviewRequestSent" BOOLEAN NOT NULL DEFAULT false; 