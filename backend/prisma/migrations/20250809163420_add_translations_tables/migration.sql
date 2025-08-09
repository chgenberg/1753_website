-- CreateTable
CREATE TABLE "product_translations" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "longDescription" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "howToUse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_translations" (
    "id" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "displayName" TEXT,
    "description" TEXT,
    "benefits" TEXT[],
    "suitableFor" TEXT[],
    "notSuitableFor" TEXT[],
    "concentration" TEXT,
    "pHRange" TEXT,
    "timeOfDay" TEXT,
    "frequency" TEXT,
    "worksWellWith" TEXT[],
    "avoidWith" TEXT[],
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredient_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_productId_locale_key" ON "product_translations"("productId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_translations_ingredientId_locale_key" ON "ingredient_translations"("ingredientId", "locale");

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_translations" ADD CONSTRAINT "ingredient_translations_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredient_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;
