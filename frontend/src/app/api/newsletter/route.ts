import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, tags = [], source = 'website', workflow = 'nyhetsbrev' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-postadress krävs' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ogiltig e-postadress' },
        { status: 400 }
      )
    }

    // Drip API configuration
    const dripAccountId = process.env.DRIP_ACCOUNT_ID
    const dripApiToken = process.env.DRIP_API_TOKEN

    if (!dripAccountId || !dripApiToken) {
      console.error('Drip credentials not configured')
      return NextResponse.json(
        { error: 'Konfigurationsfel' },
        { status: 500 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    
    try {
      // Step 1: Subscribe to Drip with proper audience handling
      const subscribeResponse = await fetch(`https://api.getdrip.com/v2/${dripAccountId}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(dripApiToken + ':').toString('base64')}`,
        },
        body: JSON.stringify({
          subscribers: [{
            email: cleanEmail,
            tags: [...tags, workflow], // Add workflow as tag
            custom_fields: {
              source: source,
              subscription_date: new Date().toISOString(),
              workflow_triggered: workflow,
              signup_page: source === 'ebook-page' ? 'E-book Download' : 'Newsletter Signup'
            },
            status: 'active' // Ensure they're active subscribers
          }]
        }),
      })

      if (!subscribeResponse.ok) {
        const errorData = await subscribeResponse.text()
        console.error('Drip subscribe error:', errorData)
        throw new Error('Failed to subscribe to Drip')
      }

      const subscribeData = await subscribeResponse.json()
      console.log('Successfully subscribed to Drip:', cleanEmail, 'workflow:', workflow)

      // Step 2: Trigger specific workflow based on type
      const workflowResponse = await fetch(`https://api.getdrip.com/v2/${dripAccountId}/workflows/${getWorkflowId(workflow)}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(dripApiToken + ':').toString('base64')}`,
        },
        body: JSON.stringify({
          subscribers: [{
            email: cleanEmail,
            custom_fields: {
              trigger_source: source,
              trigger_date: new Date().toISOString()
            }
          }]
        }),
      })

      if (workflowResponse.ok) {
        console.log(`Successfully triggered ${workflow} workflow for:`, cleanEmail)
      } else {
        // Don't fail the whole request if workflow trigger fails
        console.warn(`Failed to trigger ${workflow} workflow for:`, cleanEmail)
      }

      return NextResponse.json({
        success: true,
        message: 'Prenumeration lyckades',
        subscriber: subscribeData.subscribers?.[0],
        workflow_triggered: workflow
      })

    } catch (dripError) {
      console.error('Detailed Drip error:', dripError)
      return NextResponse.json(
        { error: 'Ett fel uppstod vid prenumeration till nyhetsbrevet' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}

// Helper function to map workflow names to Drip workflow IDs
function getWorkflowId(workflowName: string): string {
  const workflowMap: Record<string, string> = {
    'nyhetsbrev': process.env.DRIP_NEWSLETTER_WORKFLOW_ID || '',
    'overgiven-varukorg': process.env.DRIP_ABANDONED_CART_WORKFLOW_ID || '',
    'quiz-resultat': process.env.DRIP_NEWSLETTER_WORKFLOW_ID || '', // Använder samma som nyhetsbrev
    'ebook-download': process.env.DRIP_NEWSLETTER_WORKFLOW_ID || '' // Använder samma som nyhetsbrev
  }
  
  return workflowMap[workflowName] || workflowMap['nyhetsbrev']
} 