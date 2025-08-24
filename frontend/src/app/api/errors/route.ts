import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()
    
    // Basic validation
    if (!errorData.message) {
      return NextResponse.json(
        { error: 'Error message is required' },
        { status: 400 }
      )
    }

    // Enhanced error data with request context
    const enhancedErrorData = {
      ...errorData,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || 'unknown',
      source: 'frontend'
    }

    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Frontend Error:', enhancedErrorData)
      return NextResponse.json({ success: true, logged: 'console' })
    }

    // In production, forward to backend logging service
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL
      
      if (backendUrl) {
        const response = await fetch(`${backendUrl}/api/errors/frontend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(enhancedErrorData),
        })

        if (response.ok) {
          return NextResponse.json({ success: true, logged: 'backend' })
        } else {
          console.error('Failed to forward error to backend:', response.status)
        }
      }
    } catch (backendError) {
      console.error('Error forwarding to backend:', backendError)
    }

    // Fallback: log to console if backend forwarding fails
    console.error('🚨 Frontend Error (fallback):', enhancedErrorData)
    
    return NextResponse.json({ success: true, logged: 'fallback' })

  } catch (error) {
    console.error('Error in error logging endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    )
  }
} 