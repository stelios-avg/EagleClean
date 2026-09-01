import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

/** Duration × hourly rate. Must match the app `SERVICE_PRICES`. */
const SERVICE_PRICES: Record<string, number> = {
  Studio: 2600,
  '1 Bedroom': 2600,
  '2 Bedroom': 2600,
  '3 Bedroom': 2600,
  'Deep Cleaning': 5400,
  Events: 6400,
};

const INCLUDED_SQM = 40;
const HOME_HOUR_CENTS = 1300;
const DEEP_HOUR_CENTS = 1800;
const EVENTS_HOUR_CENTS = 1600;
const SQM_OVERAGE_CENTS = 50;
const SERVICE_FEE_CENTS = 145;
const IRONING_PACK_SIZE = 10;
const IRONING_FIRST_PACK_CENTS = 1600;
const IRONING_PACK_DISCOUNT_CENTS = 200;
const IRONING_PIECE_CENTS = IRONING_FIRST_PACK_CENTS / IRONING_PACK_SIZE;

const EXTRA_PRICES: Record<string, number> = {
  ironing: 1500,
  hoover: 300,
  oven: 500,
  fireplace: 500,
};

function hourCents(option: string): number {
  if (option === 'Events') {
    return EVENTS_HOUR_CENTS;
  }
  if (option === 'Deep Cleaning') {
    return DEEP_HOUR_CENTS;
  }
  return HOME_HOUR_CENTS;
}

function allowedExtraIds(option: string): Set<string> {
  if (option === 'Deep Cleaning') {
    return new Set(['ironing', 'oven', 'fireplace']);
  }
  if (option === 'Ironing') {
    return new Set(['hoover']);
  }
  return new Set(['ironing', 'hoover']);
}

function ironingPriceCents(pieces: number): number {
  const n = Number.isFinite(pieces) ? Math.max(0, Math.floor(pieces)) : 0;
  if (n <= 0) {
    return 0;
  }
  const packs = Math.floor(n / IRONING_PACK_SIZE);
  const remainder = n % IRONING_PACK_SIZE;
  let cents = 0;
  if (packs >= 1) {
    cents +=
      IRONING_FIRST_PACK_CENTS +
      (packs - 1) * (IRONING_FIRST_PACK_CENTS - IRONING_PACK_DISCOUNT_CENTS);
  }
  return cents + remainder * IRONING_PIECE_CENTS;
}

function extrasCents(option: string, ids: unknown): number {
  if (!Array.isArray(ids)) {
    return 0;
  }
  const allowed = allowedExtraIds(option);
  return ids.reduce((sum: number, id) => {
    if (typeof id !== 'string' || !allowed.has(id)) {
      return sum;
    }
    return sum + (EXTRA_PRICES[id] ?? 0);
  }, 0);
}

type Supply = { unitPriceCents?: number; quantity?: number };

function amountCents(body: {
  option?: string;
  extraHours?: number;
  squareMeters?: number;
  pieces?: number;
  supplies?: Supply[];
  extras?: unknown;
}): number {
  const option = body.option ?? '';
  const extraHours = Math.max(0, Number(body.extraHours) || 0);
  const supplies = (body.supplies ?? []).reduce((sum, item) => {
    const price = Math.max(0, Number(item.unitPriceCents) || 0);
    const qty = Math.max(0, Number(item.quantity) || 0);
    return sum + price * qty;
  }, 0);
  const extras = extrasCents(option, body.extras);
  const rate = hourCents(option);
  if (option === 'Ironing') {
    const pieces = Math.max(0, Math.floor(Number(body.pieces) || 0));
    return ironingPriceCents(pieces) + extraHours * rate + supplies + extras + SERVICE_FEE_CENTS;
  }
  const base = SERVICE_PRICES[option];
  if (base == null) {
    throw new Error('Unknown service');
  }
  const sqm = Number(body.squareMeters) > 0 ? Number(body.squareMeters) : 0;
  const extraSqm = Math.max(0, sqm - INCLUDED_SQM);
  return base + extraSqm * SQM_OVERAGE_CENTS + extraHours * rate + supplies + extras + SERVICE_FEE_CENTS;
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
      pieces?: number;
      supplies?: Supply[];
      extras?: unknown;
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
    const extrasMeta = Array.isArray(body.extras)
      ? body.extras.filter((id): id is string => typeof id === 'string').join(',')
      : '';
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
        extras: extrasMeta,
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
