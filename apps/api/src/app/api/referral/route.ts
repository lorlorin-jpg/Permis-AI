import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, Errors } from '@/lib/errors'

// GET — get or create referral code for current user
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return handleError(Errors.UNAUTHORIZED())

    const user = await prisma.user.findUnique({ where: { supabaseId: userId } })
    if (!user) return handleError(Errors.NOT_FOUND('User'))

    // Generate deterministic referral code from userId
    const code = `PA${user.id.slice(-6).toUpperCase()}`

    // Count referrals (users who signed up with this code)
    // For now return mock data since we don't have referral tracking in schema
    return Response.json({
      code,
      referralsCount: 0,
      rewardThreshold: 5,
      rewardDays: 30,
    })
  } catch (error) {
    return handleError(error)
  }
}
