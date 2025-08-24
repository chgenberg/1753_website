# Database Optimization Guide - 1753 Skincare

## 🗄️ **Database Performance Optimization**

### **📊 Current Setup**
- **Database**: PostgreSQL on Railway
- **ORM**: Prisma Client
- **Connection Pooling**: Built-in Prisma pooling
- **Indexes**: Comprehensive indexing strategy implemented

## 🚀 **Performance Optimizations Implemented**

### **1. Database Indexes**
Comprehensive indexing strategy for all frequently queried fields:

```sql
-- Product indexes
CREATE INDEX "products_isActive_idx" ON "products"("isActive");
CREATE INDEX "products_isFeatured_idx" ON "products"("isFeatured");
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_price_idx" ON "products"("price");

-- Composite indexes for complex queries
CREATE INDEX "products_active_featured_idx" ON "products"("isActive", "isFeatured");
CREATE INDEX "products_active_category_idx" ON "products"("isActive", "category");

-- Full-text search indexes
CREATE INDEX "products_name_text_idx" ON "products" USING gin(to_tsvector('english', "name"));
```

### **2. Query Optimization**
- **Selective includes**: Only fetch related data when needed
- **Pagination**: Proper LIMIT/OFFSET for large datasets
- **Minimal selects**: Only fetch required fields
- **Efficient joins**: Optimized relationship loading

### **3. Connection Management**
- **Connection pooling**: Prisma's built-in connection pooling
- **Connection limits**: Configured for Railway's PostgreSQL limits
- **Health monitoring**: Regular connection health checks

## 📈 **Monitoring & Analytics**

### **API Endpoints for Monitoring**

```bash
# Database health check
GET /api/database/health

# Performance statistics
GET /api/database/stats

# Connection pool status
GET /api/database/connections

# Run performance tests
GET /api/database/performance-test

# Analyze slow queries (production only)
GET /api/database/slow-queries
```

### **Maintenance Operations**

```bash
# Clean up old data
POST /api/database/maintenance/cleanup

# Update database statistics
POST /api/database/maintenance/analyze
```

## 🔧 **Optimized Service Classes**

### **OptimizedProductService**
```typescript
// Efficient product queries with minimal includes
const products = await OptimizedProductService.findMany({
  where: { category: 'skincare' },
  take: 12,
  includeReviews: true,
  locale: 'sv'
})
```

### **OptimizedReviewService**
```typescript
// Optimized review queries with aggregation
const stats = await OptimizedReviewService.getProductStats(productId)
```

### **OptimizedOrderService**
```typescript
// Efficient order queries with selective includes
const orders = await OptimizedOrderService.findUserOrders(userId, {
  take: 10,
  status: 'COMPLETED'
})
```

## 📊 **Performance Metrics**

### **Query Performance Targets**
- **Simple queries**: < 50ms
- **Complex queries**: < 200ms
- **Aggregation queries**: < 500ms
- **Full-text search**: < 300ms

### **Connection Pool Targets**
- **Active connections**: < 80% of limit
- **Connection acquisition**: < 10ms
- **Query queue**: < 5 pending queries

## 🛠️ **Database Maintenance**

### **Automated Maintenance**
- **Old data cleanup**: Removes unverified users and pending reviews after 30 days
- **Statistics updates**: Regular ANALYZE commands for query optimization
- **Index maintenance**: Automatic index usage monitoring

### **Manual Maintenance Tasks**

```bash
# Run database migration
npx prisma migrate deploy

# Generate new Prisma client
npx prisma generate

# Reset database (development only)
npx prisma migrate reset

# View database schema
npx prisma studio
```

## 🔍 **Query Optimization Tips**

### **1. Use Indexes Effectively**
```typescript
// Good: Uses index on isActive + category
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    category: 'skincare'
  }
})

// Bad: Full table scan
const products = await prisma.product.findMany({
  where: {
    name: { contains: 'serum' } // Without text index
  }
})
```

### **2. Limit Related Data**
```typescript
// Good: Limited includes
const product = await prisma.product.findUnique({
  where: { slug },
  include: {
    reviews: {
      take: 10,
      where: { status: 'APPROVED' }
    }
  }
})

// Bad: Unlimited includes
const product = await prisma.product.findUnique({
  where: { slug },
  include: {
    reviews: true // Could load thousands of reviews
  }
})
```

### **3. Use Aggregations**
```typescript
// Good: Database-level aggregation
const stats = await prisma.review.groupBy({
  by: ['rating'],
  where: { productId },
  _count: { rating: true }
})

// Bad: Application-level aggregation
const reviews = await prisma.review.findMany({ where: { productId } })
const stats = reviews.reduce(/* complex logic */)
```

## 🚨 **Performance Alerts**

### **Slow Query Detection**
- Queries > 500ms logged as warnings
- Queries > 2000ms logged as errors
- Automatic performance tracking for all database operations

### **Connection Pool Monitoring**
- High connection usage alerts
- Connection acquisition timeout warnings
- Query queue depth monitoring

## 📋 **Production Checklist**

### **Before Deployment**
- [ ] Run database migrations
- [ ] Verify all indexes are created
- [ ] Test query performance
- [ ] Check connection pool configuration
- [ ] Validate environment variables

### **After Deployment**
- [ ] Monitor database health endpoint
- [ ] Check slow query logs
- [ ] Verify connection pool metrics
- [ ] Run performance tests
- [ ] Set up monitoring alerts

## 🔧 **Environment Variables**

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database"
DATABASE_MAX_CONNECTIONS=10

# Performance Settings
PRISMA_QUERY_ENGINE_LIBRARY=true
PRISMA_CLIENT_ENGINE_TYPE=library

# Monitoring
LOG_LEVEL=info
NODE_ENV=production
```

## 📈 **Performance Monitoring Dashboard**

Access real-time database metrics:

1. **Health Status**: `/api/database/health`
2. **Performance Stats**: `/api/database/stats`
3. **Query Analysis**: `/api/database/performance-test`
4. **Connection Pool**: `/api/database/connections`

## 🔄 **Backup & Recovery**

### **Automated Backups**
Railway provides automatic daily backups for PostgreSQL databases.

### **Manual Backup**
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Import database
psql $DATABASE_URL < backup.sql
```

## 📚 **Additional Resources**

- [Prisma Performance Guide](https://www.prisma.io/docs/guides/performance-and-optimization)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Railway Database Docs](https://docs.railway.app/databases/postgresql)

---

**🎯 Result**: Optimized database with comprehensive monitoring, efficient queries, and automated maintenance for production-ready performance. 