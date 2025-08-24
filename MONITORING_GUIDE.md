# Monitoring & Health Checks Guide - 1753 Skincare

## 📊 **Comprehensive System Monitoring**

### **🎯 Monitoring Overview**
- **Health Checks**: Multi-layer system health monitoring
- **Performance Tracking**: Real-time API and database performance
- **Error Monitoring**: Structured logging and error tracking
- **Cache Monitoring**: Cache hit rates and memory usage
- **Database Monitoring**: Connection health and query performance

## 🔍 **Health Check Endpoints**

### **Primary Health Endpoints**

```bash
# Comprehensive health check (all systems)
GET /api/health
# Returns: detailed status of all components

# Quick health check (for load balancers)
GET /api/health/quick
# Returns: fast basic health status

# Liveness probe (Kubernetes/Docker)
GET /api/health/live
# Returns: process is running

# Readiness probe (ready to serve traffic)
GET /api/health/ready
# Returns: system ready for requests
```

### **Individual Component Checks**

```bash
# Database connectivity
GET /api/health/database

# Memory usage
GET /api/health/memory

# Cache system
GET /api/health/cache

# API performance
GET /api/health/performance

# External services
GET /api/health/external

# System information
GET /api/health/system
```

### **Health History & Metrics**

```bash
# Health check history
GET /api/health/history

# Trigger manual health check
POST /api/health/check

# Prometheus-style metrics
GET /api/health/metrics
```

## 📈 **Performance Monitoring**

### **Performance Endpoints**

```bash
# Comprehensive performance stats
GET /api/performance/stats

# Memory usage details
GET /api/performance/memory

# Performance health check
GET /api/performance/health

# System information
GET /api/performance/system

# Clear performance metrics
DELETE /api/performance/metrics
```

### **Cache Monitoring**

```bash
# Cache statistics
GET /api/cache/stats

# Cache health check
GET /api/cache/health

# Clear cache
DELETE /api/cache/clear

# Invalidate cache patterns
DELETE /api/cache/invalidate/:pattern
```

### **Database Monitoring**

```bash
# Database health
GET /api/database/health

# Database statistics
GET /api/database/stats

# Connection pool status
GET /api/database/connections

# Performance tests
GET /api/database/performance-test

# Slow query analysis (production)
GET /api/database/slow-queries
```

## 🚨 **Health Status Levels**

### **Status Definitions**
- **🟢 Healthy**: All systems operating normally
- **🟡 Degraded**: Some performance issues, but functional
- **🔴 Unhealthy**: Critical issues requiring immediate attention

### **Health Check Thresholds**

| Component | Healthy | Degraded | Unhealthy |
|-----------|---------|----------|-----------|
| **Database** | < 500ms | 500ms - 1000ms | > 1000ms |
| **Memory** | < 500MB | 500MB - 800MB | > 800MB |
| **Cache** | < 80% full | 80% - 95% full | > 95% full |
| **API Response** | < 1000ms avg | 1000ms - 2000ms | > 2000ms |
| **Slow Requests** | < 10% | 10% - 20% | > 20% |

## 📊 **Monitoring Dashboard**

### **Key Metrics to Monitor**

1. **System Health**
   - Overall health status
   - Component health breakdown
   - Health check duration trends

2. **Performance Metrics**
   - Average response time
   - Request throughput
   - Slow request percentage
   - Memory usage trends

3. **Database Performance**
   - Connection latency
   - Query performance
   - Connection pool usage
   - Slow query frequency

4. **Cache Efficiency**
   - Hit/miss ratios
   - Cache size utilization
   - Cache cleanup frequency

### **Sample Health Response**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "timestamp": "2025-01-30T10:00:00.000Z",
    "checks": [
      {
        "name": "database",
        "status": "healthy",
        "message": "Database is responding normally",
        "duration": 45,
        "details": {
          "latency": 45,
          "isHealthy": true
        }
      },
      {
        "name": "memory",
        "status": "healthy",
        "message": "Memory usage is normal",
        "duration": 2,
        "details": {
          "rss": 256,
          "heapTotal": 128,
          "heapUsed": 89,
          "external": 12,
          "heapUsagePercent": 69
        }
      }
    ],
    "summary": {
      "total": 5,
      "healthy": 5,
      "degraded": 0,
      "unhealthy": 0
    }
  }
}
```

## 🔧 **Monitoring Setup**

### **Environment Configuration**

```env
# Monitoring Settings
LOG_LEVEL=info
NODE_ENV=production

# Health Check Intervals
HEALTH_CHECK_INTERVAL=300000  # 5 minutes

# Performance Thresholds
SLOW_QUERY_THRESHOLD=500      # 500ms
MEMORY_WARNING_THRESHOLD=500  # 500MB
CACHE_WARNING_THRESHOLD=80    # 80%
```

### **Railway Deployment Monitoring**

```bash
# Railway health check configuration
railway up --health-check-path=/api/health/ready
```

### **Docker Health Checks**

```dockerfile
# Dockerfile health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5002/api/health/ready || exit 1
```

## 📱 **Alerting & Notifications**

### **Critical Alerts**
- Database connection failures
- Memory usage > 800MB
- API response time > 2000ms
- Cache at critical capacity (>95%)
- Multiple unhealthy components

### **Warning Alerts**
- Database latency > 500ms
- Memory usage > 500MB
- Slow request percentage > 10%
- Cache usage > 80%
- Individual component degraded

### **Alert Integration Examples**

```javascript
// Webhook alert example
const sendAlert = async (healthStatus) => {
  if (healthStatus.status === 'unhealthy') {
    await fetch('https://hooks.slack.com/your-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 System Health Alert: ${healthStatus.status}`,
        attachments: [{
          color: 'danger',
          fields: healthStatus.checks
            .filter(c => c.status === 'unhealthy')
            .map(c => ({
              title: c.name,
              value: c.message,
              short: true
            }))
        }]
      })
    })
  }
}
```

## 📊 **Prometheus Metrics**

### **Available Metrics**

```prometheus
# System health status (0=unhealthy, 1=degraded, 2=healthy)
system_health_status{instance="api"} 2

# System uptime in seconds
system_uptime_seconds{instance="api"} 3600

# Health check counts
health_checks_total{instance="api"} 5
health_checks_healthy{instance="api"} 5
health_checks_degraded{instance="api"} 0
health_checks_unhealthy{instance="api"} 0

# Individual component metrics
health_check_database_status{instance="api"} 2
health_check_database_duration_ms{instance="api"} 45
health_check_memory_status{instance="api"} 2
health_check_memory_duration_ms{instance="api"} 2
```

### **Grafana Dashboard Queries**

```promql
# Overall system health
system_health_status

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Memory usage trend
health_check_memory_duration_ms

# Database latency
health_check_database_duration_ms
```

## 🛠️ **Troubleshooting Guide**

### **Common Issues**

1. **Database Connection Issues**
   ```bash
   # Check database health
   curl https://your-api.railway.app/api/health/database
   
   # Check connection pool
   curl https://your-api.railway.app/api/database/connections
   ```

2. **High Memory Usage**
   ```bash
   # Check memory details
   curl https://your-api.railway.app/api/health/memory
   
   # Check performance stats
   curl https://your-api.railway.app/api/performance/memory
   ```

3. **Slow API Performance**
   ```bash
   # Check performance metrics
   curl https://your-api.railway.app/api/performance/stats
   
   # Run performance test
   curl https://your-api.railway.app/api/database/performance-test
   ```

4. **Cache Issues**
   ```bash
   # Check cache health
   curl https://your-api.railway.app/api/cache/stats
   
   # Clear cache if needed
   curl -X DELETE https://your-api.railway.app/api/cache/clear
   ```

## 📋 **Monitoring Checklist**

### **Daily Monitoring**
- [ ] Check overall system health status
- [ ] Review performance metrics
- [ ] Monitor memory usage trends
- [ ] Check database performance
- [ ] Review error logs

### **Weekly Monitoring**
- [ ] Analyze slow query reports
- [ ] Review cache efficiency
- [ ] Check health check history
- [ ] Monitor uptime statistics
- [ ] Review alert frequency

### **Monthly Monitoring**
- [ ] Performance trend analysis
- [ ] Capacity planning review
- [ ] Alert threshold optimization
- [ ] Monitoring system updates
- [ ] Documentation updates

## 🚀 **Production Monitoring Best Practices**

1. **Set up automated alerts** for critical thresholds
2. **Monitor trends**, not just current values
3. **Use multiple monitoring layers** (health checks + external monitoring)
4. **Keep monitoring lightweight** to avoid performance impact
5. **Document alert procedures** and escalation paths
6. **Regular monitoring system maintenance**
7. **Test monitoring during deployments**

## 📚 **Integration Examples**

### **Load Balancer Health Checks**
```nginx
# Nginx upstream health check
upstream api_backend {
    server api1.example.com;
    server api2.example.com;
    
    # Health check configuration
    health_check uri=/api/health/ready;
}
```

### **Kubernetes Probes**
```yaml
# Kubernetes deployment with health checks
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: api
        livenessProbe:
          httpGet:
            path: /api/health/live
            port: 5002
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 5002
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

**🎯 Result**: Comprehensive monitoring system with health checks, performance tracking, and alerting for production-ready observability. 