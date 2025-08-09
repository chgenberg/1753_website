-- CreateTable
CREATE TABLE "educational_content_translations" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "excerpt" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educational_content_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "educational_content_translations_contentId_locale_key" ON "educational_content_translations"("contentId", "locale");

-- AddForeignKey
ALTER TABLE "educational_content_translations" ADD CONSTRAINT "educational_content_translations_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "educational_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
