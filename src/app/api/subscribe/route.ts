import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('pixsee_landing')
    const collection = db.collection('subscribers')

    // Check if email already exists
    const existingSubscriber = await collection.findOne({ email })
    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      )
    }

    // Insert new subscriber
    const result = await collection.insertOne({
      email,
      subscribedAt: new Date(),
      source: 'landing_page'
    })

    if (result.insertedId) {
      return NextResponse.json(
        { message: 'Successfully subscribed!', id: result.insertedId },
        { status: 201 }
      )
    } else {
      throw new Error('Failed to insert subscriber')
    }

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
