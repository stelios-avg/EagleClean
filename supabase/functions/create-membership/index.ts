import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.7.0';

const MEMBERSHIP_CENTS = 1499;
const LOOKUP_KEY = 'eagleclean_membership_monthly';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  membership_status: string;
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: cors });
}

function renewsAt(subscription: Stripe.Subscription): string | null {
  const end =
    (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end ??
    subscription.items.data[0]?.current_period_end;
  if (!end) {
    return null;
  }
  return new Date(end * 1000).toISOString();
}

function clientSecretFromInvoice(invoice: Stripe.Invoice): string | null {
  const pi = invoice.payment_intent;
  if (pi && typeof pi === 'object' && pi.client_secret) {
    return pi.client_secret;
  }
  const conf = (
    invoice as Stripe.Invoice & {
      confirmation_secret?: { client_secret?: string | null };
    }
  ).confirmation_secret?.client_secret;
  return conf ?? null;
}

async function membershipPriceId(stripe: Stripe): Promise<string> {
  const fromEnv = Deno.env.get('STRIPE_MEMBERSHIP_PRICE_ID');
  if (fromEnv) {
    return fromEnv;
  }
  const existing = await stripe.prices.list({
    lookup_keys: [LOOKUP_KEY],
    active: true,
    limit: 1,
  });
  if (existing.data[0]) {
    return existing.data[0].id;
  }
  const product = await stripe.products.create({
    name: 'Cleanovox Membership',
    description: 'Monthly Cleanovox membership — €14.99',
  });
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: MEMBERSHIP_CENTS,
    recurring: { interval: 'month' },
    lookup_key: LOOKUP_KEY,
  });
  return price.id;
}

async function invoiceClientSecret(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<string> {
  let invoice = subscription.latest_invoice;
  if (typeof invoice === 'string') {
    invoice = await stripe.invoices.retrieve(invoice, {
      expand: ['payment_intent'],
    });
  }
  if (!invoice || typeof invoice === 'string') {
    throw new Error('Could not start membership payment.');
  }
  const secret = clientSecretFromInvoice(invoice);
  if (!secret) {
    throw new Error('Could not start membership payment.');
  }
  return secret;
}

function paymentIntentIdFromInvoice(invoice: Stripe.Invoice | string | null): string | null {
  if (!invoice || typeof invoice === 'string') {
    return null;
  }
  const pi = invoice.payment_intent;
  if (!pi) {
    return null;
  }
  return typeof pi === 'string' ? pi : pi.id;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!secret || !supabaseUrl || !serviceKey || !anonKey) {
    return json({ error: 'Server is missing Stripe or Supabase keys.' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Not signed in.' }, 401);
  }

  try {
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return json({ error: 'Not signed in.' }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select(
        'id, email, full_name, stripe_customer_id, stripe_subscription_id, membership_status'
      )
      .eq('id', user.id)
      .single();
    if (profileError || !profile) {
      return json({ error: 'Profile not found.' }, 400);
    }
    const row = profile as ProfileRow;

    const stripe = new Stripe(secret);
    const body = (await req.json().catch(() => ({}))) as {
      confirm?: boolean;
      subscriptionId?: string;
    };

    if (body.confirm) {
      const subscriptionId = body.subscriptionId ?? row.stripe_subscription_id;
      if (!subscriptionId) {
        return json({ error: 'No membership to confirm.' }, 400);
      }
      let subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.status === 'incomplete') {
        const invoiceId =
          typeof subscription.latest_invoice === 'string'
            ? subscription.latest_invoice
            : subscription.latest_invoice?.id;
        if (invoiceId) {
          try {
            await stripe.invoices.pay(invoiceId);
          } catch {
            // Already paid by PaymentSheet, or still processing.
          }
        }
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
      }
      if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return json({ error: 'Payment did not complete.' }, 400);
      }
      await admin
        .from('profiles')
        .update({
          stripe_subscription_id: subscription.id,
          membership_status: 'active',
          membership_renews_at: renewsAt(subscription),
        })
        .eq('id', user.id);
      return json({
        status: 'active',
        renewsAt: renewsAt(subscription),
      });
    }

    if (row.stripe_subscription_id) {
      const existing = await stripe.subscriptions.retrieve(row.stripe_subscription_id, {
        expand: ['latest_invoice.payment_intent'],
      });
      if (existing.status === 'active' || existing.status === 'trialing') {
        await admin
          .from('profiles')
          .update({
            membership_status: 'active',
            membership_renews_at: renewsAt(existing),
          })
          .eq('id', user.id);
        return json({ alreadyActive: true, status: 'active', renewsAt: renewsAt(existing) });
      }
      if (existing.status === 'incomplete') {
        const clientSecret = await invoiceClientSecret(stripe, existing);
        return json({
          clientSecret,
          subscriptionId: existing.id,
          paymentIntentId: paymentIntentIdFromInvoice(existing.latest_invoice),
          amount: MEMBERSHIP_CENTS,
        });
      }
    }

    let customerId = row.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: row.email ?? user.email ?? undefined,
        name: row.full_name ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const priceId = await membershipPriceId(stripe);
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { user_id: user.id },
    });

    await admin
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        membership_status: 'incomplete',
      })
      .eq('id', user.id);

    const clientSecret = await invoiceClientSecret(stripe, subscription);
    return json({
      clientSecret,
      subscriptionId: subscription.id,
      paymentIntentId: paymentIntentIdFromInvoice(subscription.latest_invoice),
      amount: MEMBERSHIP_CENTS,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Membership payment failed';
    return json({ error: message }, 400);
  }
});
