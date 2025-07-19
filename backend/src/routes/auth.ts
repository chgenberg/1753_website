// TEMPORARILY DISABLED - Auth middleware and controller removed
// TODO: Implement authentication routes with Prisma when needed

import express from 'express'

const router = express.Router()

// Return 501 for all auth routes (not implemented)
router.post('/register', (req, res) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
})

router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
})

router.post('/logout', (req, res) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
})

router.get('/me', (req, res) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
})

router.post('/verify-email', (req, res) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
})

router.post('/forgot-password', (req, res) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
})

router.post('/reset-password', (req, res) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
})

router.post('/refresh-token', (req, res) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
})

export default router 