-- Add performance indexes for frequently queried fields

-- Product indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_isActive_idx" ON "products"("isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_isFeatured_idx" ON "products"("isFeatured");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_category_idx" ON "products"("category");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_price_idx" ON "products"("price");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_createdAt_idx" ON "products"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_name_text_idx" ON "products" USING gin(to_tsvector('english', "name"));
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_description_text_idx" ON "products" USING gin(to_tsvector('english', coalesce("description", '')));

-- Composite indexes for common filter combinations
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_active_featured_idx" ON "products"("isActive", "isFeatured");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_active_category_idx" ON "products"("isActive", "category");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_active_price_idx" ON "products"("isActive", "price");

-- Review indexes for product ratings and filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS "reviews_productId_status_idx" ON "reviews"("productId", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "reviews_status_createdAt_idx" ON "reviews"("status", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "reviews_userId_idx" ON "reviews"("userId");

-- Order indexes for user queries and admin filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_userId_idx" ON "orders"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_email_idx" ON "orders"("email");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_paymentStatus_idx" ON "orders"("paymentStatus");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_status_createdAt_idx" ON "orders"("status", "createdAt");

-- Order items for product analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS "order_items_productId_idx" ON "order_items"("productId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "order_items_orderId_productId_idx" ON "order_items"("orderId", "productId");

-- User indexes for authentication and profile queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_lastLogin_idx" ON "users"("lastLogin");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_skinType_idx" ON "users"("skinType");

-- Address indexes for checkout optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS "addresses_userId_type_idx" ON "addresses"("userId", "type");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "addresses_userId_isDefault_idx" ON "addresses"("userId", "isDefault");

-- Blog indexes for content queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "blog_posts_isPublished_idx" ON "blog_posts"("isPublished");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "blog_posts_publishedAt_idx" ON "blog_posts"("publishedAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "blog_posts_category_idx" ON "blog_posts"("category");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "blog_posts_slug_idx" ON "blog_posts"("slug");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "blog_posts_published_date_idx" ON "blog_posts"("isPublished", "publishedAt");

-- Contact submissions for admin queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "contact_submissions_status_idx" ON "contact_submissions"("status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "contact_submissions_createdAt_idx" ON "contact_submissions"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "contact_submissions_email_idx" ON "contact_submissions"("email");

-- Raw materials for knowledge base
CREATE INDEX CONCURRENTLY IF NOT EXISTS "raw_materials_isActive_idx" ON "raw_materials"("isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "raw_materials_category_idx" ON "raw_materials"("category");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "raw_materials_name_text_idx" ON "raw_materials" USING gin(to_tsvector('english', "name"));

-- Blog images for content management
CREATE INDEX CONCURRENTLY IF NOT EXISTS "blog_images_blogPostId_idx" ON "blog_images"("blogPostId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "blog_images_isActive_idx" ON "blog_images"("isActive");

-- Skin journey entries for user analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS "skin_journey_entries_userId_idx" ON "skin_journey_entries"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "skin_journey_entries_date_idx" ON "skin_journey_entries"("date");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "skin_journey_entries_userId_date_idx" ON "skin_journey_entries"("userId", "date");

-- Progress reports for user tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS "progress_reports_userId_idx" ON "progress_reports"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "progress_reports_createdAt_idx" ON "progress_reports"("createdAt");

-- Learning progress for educational content
CREATE INDEX CONCURRENTLY IF NOT EXISTS "learning_progress_userId_idx" ON "learning_progress"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "learning_progress_contentType_idx" ON "learning_progress"("contentType");

-- Video watch history for content analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS "video_watch_history_userId_idx" ON "video_watch_history"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "video_watch_history_videoId_idx" ON "video_watch_history"("videoId");

-- Expert consultations for user services
CREATE INDEX CONCURRENTLY IF NOT EXISTS "expert_consultations_userId_idx" ON "expert_consultations"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "expert_consultations_status_idx" ON "expert_consultations"("status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "expert_consultations_scheduledAt_idx" ON "expert_consultations"("scheduledAt");

-- Personalized suggestions for recommendations
CREATE INDEX CONCURRENTLY IF NOT EXISTS "personalized_suggestions_userId_idx" ON "personalized_suggestions"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "personalized_suggestions_isActive_idx" ON "personalized_suggestions"("isActive");

-- Translation indexes for multilingual content
CREATE INDEX CONCURRENTLY IF NOT EXISTS "product_translations_productId_locale_idx" ON "product_translations"("productId", "locale");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "blog_translations_blogPostId_locale_idx" ON "blog_translations"("blogPostId", "locale");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "raw_material_translations_rawMaterialId_locale_idx" ON "raw_material_translations"("rawMaterialId", "locale");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "educational_translations_contentId_locale_idx" ON "educational_translations"("contentId", "locale"); 