import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userInfo, answers, timestamp } = data

    // Forward to backend API
    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/quiz/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userInfo.email,
        name: userInfo.name,
        gender: userInfo.gender,
        age: parseInt(userInfo.age),
        answers,
        timestamp
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save quiz data')
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error saving quiz data:', error)
    return NextResponse.json(
      { error: 'Failed to save quiz data' },
      { status: 500 }
    )
  }
} 