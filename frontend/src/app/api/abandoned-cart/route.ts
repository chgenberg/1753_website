import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, cartItems, cartTotal, userName } = await request.json()

    if (!email || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'E-postadress och varukorg krävs' },
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

    // Prepare cart data for Drip
    const cartData = {
      cart_total: cartTotal,
      cart_items_count: cartItems.length,
      cart_items: cartItems.map((item: any) => ({
        product_name: item.name,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image
      })),
      cart_abandoned_at: new Date().toISOString(),
      cart_recovery_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart?recover=true`
    }

    try {
      // Step 1: Update subscriber with cart data
      const updateResponse = await fetch(`https://api.getdrip.com/v2/${dripAccountId}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(dripApiToken + ':').toString('base64')}`,
        },
        body: JSON.stringify({
          subscribers: [{
            email: cleanEmail,
            tags: ['övergiven-varukorg', 'cart-abandoner'],
            custom_fields: {
              ...cartData,
              name: userName || '',
              last_cart_update: new Date().toISOString()
            },
            status: 'active'
          }]
        }),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.text()
        console.error('Drip update error:', errorData)
        throw new Error('Failed to update subscriber in Drip')
      }

      console.log('Successfully updated cart data in Drip for:', cleanEmail)

      // Step 2: Trigger abandoned cart workflow
      const workflowId = process.env.DRIP_ABANDONED_CART_WORKFLOW_ID
      if (workflowId) {
        const workflowResponse = await fetch(`https://api.getdrip.com/v2/${dripAccountId}/workflows/${workflowId}/subscribers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(dripApiToken + ':').toString('base64')}`,
          },
          body: JSON.stringify({
            subscribers: [{
              email: cleanEmail,
              custom_fields: {
                trigger_source: 'abandoned_cart',
                trigger_date: new Date().toISOString(),
                cart_total: cartTotal
              }
            }]
          }),
        })

        if (workflowResponse.ok) {
          console.log('Successfully triggered abandoned cart workflow for:', cleanEmail)
        } else {
          console.warn('Failed to trigger abandoned cart workflow for:', cleanEmail)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Övergiven varukorg registrerad',
        cart_total: cartTotal,
        items_count: cartItems.length
      })

    } catch (dripError) {
      console.error('Detailed Drip error:', dripError)
      return NextResponse.json(
        { error: 'Ett fel uppstod vid registrering av övergiven varukorg' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Abandoned cart error:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
} 