import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get component
    const component = await prisma.marketplaceComponent.findUnique({
      where: {
        id: params.id,
        published: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Check if it's a free component
    if (!component.premium || component.price === 0) {
      return NextResponse.json(
        { error: 'Component is free' },
        { status: 400 }
      );
    }

    // Check if already purchased
    const existingPurchase = await prisma.componentPurchase.findUnique({
      where: {
        userId_componentId: {
          userId: session.user.id,
          componentId: params.id
        }
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Already purchased' },
        { status: 409 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: component.name,
              description: component.description,
              metadata: {
                componentId: component.id,
                authorId: component.authorId
              }
            },
            unit_amount: Math.round(component.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/marketplace/component/${component.id}`,
      metadata: {
        userId: session.user.id,
        componentId: component.id,
        authorId: component.authorId
      },
      payment_intent_data: {
        application_fee_amount: Math.round(component.price * 100 * 0.3), // 30% platform fee
        transfer_data: {
          destination: component.author.id, // This should be a Stripe Connect account ID
        },
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url
    });
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Webhook endpoint to handle successful payments
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sig = request.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Record the purchase
      await prisma.componentPurchase.create({
        data: {
          componentId: session.metadata!.componentId,
          userId: session.metadata!.userId,
          amount: session.amount_total! / 100, // Convert from cents
          currency: session.currency!
        }
      });

      // Increment download count
      await prisma.marketplaceComponent.update({
        where: { id: session.metadata!.componentId },
        data: {
          downloads: {
            increment: 1
          }
        }
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }
}