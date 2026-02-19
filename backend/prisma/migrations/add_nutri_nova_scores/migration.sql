-- AlterTable: Add nutriScore and novaScore to Product model
ALTER TABLE "Product" ADD COLUMN "nutriScore" TEXT,
ADD COLUMN "novaScore" INTEGER;

-- CreateIndex: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");
CREATE INDEX IF NOT EXISTS "Product_carbonFootprint_idx" ON "Product"("carbonFootprint");
CREATE INDEX IF NOT EXISTS "Product_ecoScore_idx" ON "Product"("ecoScore");
