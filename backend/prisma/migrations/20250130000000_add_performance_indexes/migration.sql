-- Add performance indexes for core tables that exist

-- Product indexes for common queries
CREATE INDEX IF NOT EXISTS "products_isActive_idx" ON "products"("isActive");
CREATE INDEX IF NOT EXISTS "products_isFeatured_idx" ON "products"("isFeatured");
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products"("category");
CREATE INDEX IF NOT EXISTS "products_price_idx" ON "products"("price");
CREATE INDEX IF NOT EXISTS "products_createdAt_idx" ON "products"("createdAt");

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS "products_active_featured_idx" ON "products"("isActive", "isFeatured");
CREATE INDEX IF NOT EXISTS "products_active_category_idx" ON "products"("isActive", "category");
CREATE INDEX IF NOT EXISTS "products_active_price_idx" ON "products"("isActive", "price");

-- Review indexes for product ratings and filtering
CREATE INDEX IF NOT EXISTS "reviews_productId_status_idx" ON "reviews"("productId", "status");
CREATE INDEX IF NOT EXISTS "reviews_status_createdAt_idx" ON "reviews"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX IF NOT EXISTS "reviews_userId_idx" ON "reviews"("userId");

-- Order indexes for user queries and admin filtering
CREATE INDEX IF NOT EXISTS "orders_userId_idx" ON "orders"("userId");
CREATE INDEX IF NOT EXISTS "orders_email_idx" ON "orders"("email");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_paymentStatus_idx" ON "orders"("paymentStatus");
CREATE INDEX IF NOT EXISTS "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX IF NOT EXISTS "orders_status_createdAt_idx" ON "orders"("status", "createdAt");

-- Order items for product analytics
CREATE INDEX IF NOT EXISTS "order_items_productId_idx" ON "order_items"("productId");
CREATE INDEX IF NOT EXISTS "order_items_orderId_productId_idx" ON "order_items"("orderId", "productId");

-- User indexes for authentication and profile queries
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_lastLogin_idx" ON "users"("lastLogin");
CREATE INDEX IF NOT EXISTS "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX IF NOT EXISTS "users_skinType_idx" ON "users"("skinType");

-- Address indexes for checkout optimization
CREATE INDEX IF NOT EXISTS "addresses_userId_type_idx" ON "addresses"("userId", "type");
CREATE INDEX IF NOT EXISTS "addresses_userId_isDefault_idx" ON "addresses"("userId", "isDefault");

-- Quiz submissions for analytics
CREATE INDEX IF NOT EXISTS "quiz_submissions_email_idx" ON "quiz_submissions"("email");
CREATE INDEX IF NOT EXISTS "quiz_submissions_createdAt_idx" ON "quiz_submissions"("createdAt"); 