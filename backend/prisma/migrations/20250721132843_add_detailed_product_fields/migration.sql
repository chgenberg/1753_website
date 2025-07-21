-- AlterTable
ALTER TABLE "products" ADD COLUMN     "benefitsDetails" JSONB,
ADD COLUMN     "imagesData" JSONB,
ADD COLUMN     "ingredientsDetails" JSONB,
ADD COLUMN     "longDescription" TEXT;
