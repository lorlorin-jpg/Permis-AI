import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

// Stripe requires raw body for signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET)
    } catch (err) {
      console.error('[webhooks/stripe] Signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    console.log(`[webhooks/stripe] Processing event: ${event.type}`)

    switch (event.type) {
      // ── checkout.session.completed ─────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== 'subscription') break

        const userId =
          session.metadata?.userId ??
          (session.subscription_data as any)?.metadata?.userId

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id

        if (!userId || !subscriptionId) {
          console.error('[webhooks/stripe] Missing userId or subscriptionId in session metadata')
          break
        }

        // Fetch subscription to get period end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        await prisma.user.updateMany({
          where: { id: userId },
          data: {
            isPremium: true,
            role: 'PREMIUM',
            stripeSubscriptionId: subscriptionId,
            premiumExpiresAt: new Date(
              subscription.current_period_end * 1000
            ),
          },
        })

        console.log(
          `[webhooks/stripe] User ${userId} upgraded to premium. Sub: ${subscriptionId}`
        )
        break
      }

      // ── customer.subscription.updated ─────────────────────────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        const userId =
          subscription.metadata?.userId

        if (!userId) {
          // Try to look up by stripeSubscriptionId
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscription.id },
            select: { id: true },
          })
          if (!user) {
            console.warn(
              `[webhooks/stripe] subscription.updated: No user found for sub ${subscription.id}`
            )
            break
          }

          const isActive =
            subscription.status === 'active' || subscription.status === 'trialing'

          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPremium: isActive,
              role: isActive ? 'PREMIUM' : 'FREE',
              premiumExpiresAt: isActive
                ? new Date(subscription.current_period_end * 1000)
                : null,
            },
          })
          break
        }

        const isActive =
          subscription.status === 'active' || subscription.status === 'trialing'

        await prisma.user.updateMany({
          where: { id: userId },
          data: {
            isPremium: isActive,
            role: isActive ? 'PREMIUM' : 'FREE',
            stripeSubscriptionId: subscription.id,
            premiumExpiresAt: isActive
              ? new Date(subscription.current_period_end * 1000)
              : null,
          },
        })

        console.log(
          `[webhooks/stripe] Subscription ${subscription.id} updated. Status: ${subscription.status}`
        )
        break
      }

      // ── customer.subscription.deleted ─────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const userId = subscription.metadata?.userId

        if (userId) {
          await prisma.user.updateMany({
            where: { id: userId },
            data: {
              isPremium: false,
              role: 'FREE',
              stripeSubscriptionId: null,
              premiumExpiresAt: null,
            },
          })
          console.log(`[webhooks/stripe] User ${userId} downgraded from premium.`)
        } else {
          // Fallback: find by subscription ID
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscription.id },
            select: { id: true },
          })
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                isPremium: false,
                role: 'FREE',
                stripeSubscriptionId: null,
                premiumExpiresAt: null,
              },
            })
            console.log(`[webhooks/stripe] User ${user.id} downgraded (via sub ID lookup).`)
          } else {
            console.warn(
              `[webhooks/stripe] subscription.deleted: No user found for sub ${subscription.id}`
            )
          }
        }
        break
      }

      // ── invoice.payment_failed ─────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId =
          typeof invoice.subscription === 'string' ? invoice.subscription : null

        if (subscriptionId) {
          console.warn(
            `[webhooks/stripe] Payment failed for subscription ${subscriptionId}. Invoice: ${invoice.id}`
          )
          // Do not immediately revoke access — Stripe retries failed payments
          // Access is revoked when subscription status becomes 'unpaid' or 'canceled'
        }
        break
      }

      default:
        // Log unhandled events but don't fail
        console.log(`[webhooks/stripe] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[webhooks/stripe] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
