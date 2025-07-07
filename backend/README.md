# 1753 Skincare Backend API

This is the backend API for the 1753 Skincare platform.

## Environment Variables

Required environment variables for deployment:

- `NODE_ENV=production`
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Allowed CORS origins (frontend URL)

## Deployment

This backend is designed to be deployed on Railway with the following configuration:

- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/health` 