import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

/** Duration × €13/hour. Must match the app `SERVICE_PRICES`. */
const SERVICE_PRICES: Record<string, number> = {
  Studio: 2600,
  '1 Bedroom': 2600,
  '2 Bedroom': 2600,
  '3 Bedroom': 2600,
  'Deep Cleaning': 3900,
  Events: 5200,
};

const INCLUDED_SQM = 40;
const EXTRA_HOUR_CENTS = 1300;
const SQM_OVERAGE_CENTS = 50;

type Supply = { unitPriceCents?: number; quantity?: number };

function amountCents(body: {
  option?: string;
  extraHours?: number;
  squareMeters?: number;
  supplies?: Supply[];
}): number {
  const option = body.option ?? '';
  const base = SERVICE_PRICES[option];
  if (base == null) {
    throw new Error('Unknown service');
  }
  const sqm = Number(body.squareMeters) > 0 ? Number(body.squareMeters) : 0;
  const extraSqm = Math.max(0, sqm - INCLUDED_SQM);
  const extraHours = Math.max(0, Number(body.extraHours) || 0);
  const supplies = (body.supplies ?? []).reduce((sum, item) => {
    const price = Math.max(0, Number(item.unitPriceCents) || 0);
    const qty = Math.max(0, Number(item.quantity) || 0);
    return sum + price * qty;
  }, 0);
  return base + extraSqm * SQM_OVERAGE_CENTS + extraHours * EXTRA_HOUR_CENTS + supplies;
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secret) {
    return Response.json(
      { error: 'STRIPE_SECRET_KEY is not set on the Edge Function.' },
      { status: 500, headers: cors }
    );
  }

  try {
    const body = (await req.json()) as {
      option?: string;
      extraHours?: number;
      squareMeters?: number;
      supplies?: Supply[];
      date?: string;
      timeSlot?: string;
      contactName?: string;
      contactEmail?: string;
    };

    const amount = amountCents(body);
    if (amount < 50) {
      return Response.json({ error: 'Amount too small' }, { status: 400, headers: cors });
    }

    const stripe = new Stripe(secret);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      receipt_email: body.contactEmail || undefined,
      metadata: {
        option: body.option ?? '',
        date: body.date ?? '',
        timeSlot: body.timeSlot ?? '',
        contactName: body.contactName ?? '',
      },
    });

    return Response.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
      },
      { headers: cors }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Payment setup failed';
    return Response.json({ error: message }, { status: 400, headers: cors });
  }
});
