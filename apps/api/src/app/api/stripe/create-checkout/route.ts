import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const supabaseId = request.headers.get('x-user-supabase-id')
    if (!supabaseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        stripeCustomerId: true,
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isPremium) {
      return NextResponse.json(
        { error: 'User is already a premium subscriber' },
        { status: 409 }
      )
    }

    let body: { successUrl?: string; cancelUrl?: string } = {}
    try {
      body = await request.json()
    } catch {
      // Body is optional
    }

    // Validate custom redirect URLs against the allowed origin (open-redirect prevention)
    const defaultSuccessUrl = `${APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`
    const defaultCancelUrl = `${APP_URL}/premium/cancel`

    let successUrl = defaultSuccessUrl
    let cancelUrl = defaultCancelUrl

    if (body.successUrl) {
      try {
        const u = new URL(body.successUrl)
        const allowed = new URL(APP_URL)
        if (u.origin !== allowed.origin) {
          return NextResponse.json(
            { error: 'successUrl must point to the application origin' },
            { status: 400 }
          )
        }
        successUrl = body.successUrl
      } catch {
        return NextResponse.json({ error: 'successUrl is not a valid URL' }, { status: 400 })
      }
    }

    if (body.cancelUrl) {
      try {
        const u = new URL(body.cancelUrl)
        const allowed = new URL(APP_URL)
        if (u.origin !== allowed.origin) {
          return NextResponse.json(
            { error: 'cancelUrl must point to the application origin' },
            { status: 400 }
          )
        }
        cancelUrl = body.cancelUrl
      } catch {
        return NextResponse.json({ error: 'cancelUrl is not a valid URL' }, { status: 400 })
      }
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: {
          userId: user.id,
          supabaseId,
        },
      })
      stripeCustomerId = customer.id

      // Persist Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        supabaseId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          supabaseId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      locale: 'fr',
    })

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('[stripe/create-checkout] POST error:', error)
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
