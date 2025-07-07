import mongoose from 'mongoose'
import { logger } from '../utils/logger'

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/1753_skincare'
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    })

    logger.info(`MongoDB Connected: ${conn.connection.host}`)

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        logger.info('MongoDB connection closed through app termination')
        process.exit(0)
      } catch (error) {
        logger.error('Error during MongoDB connection closure:', error)
        process.exit(1)
      }
    })

  } catch (error) {
    logger.error('Database connection failed:', error)
    logger.warn('Server will start without database connection. Please check your MongoDB Atlas IP whitelist.')
    logger.warn('Visit: https://www.mongodb.com/docs/atlas/security-whitelist/')
    // Don't exit the process, let the server start without database
  }
}

export default connectDB 