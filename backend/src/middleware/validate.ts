import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { AppError } from './errorHandler'

export const validate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : error.type,
      message: error.msg,
    }))
    
    throw new AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400)
  }
  
  next()
} 