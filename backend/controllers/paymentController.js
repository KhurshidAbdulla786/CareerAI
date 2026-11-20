const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// ─── Plan pricing config ───────────────────────────────────────────────────────
const PLANS = {
  pro_monthly: {
    label: 'Pro Monthly',
    usdCents: 999,          // $9.99 / month
    nprPaisa: 130000,       // NPR 1,300 / month  (1 USD ≈ 135 NPR)
    durationDays: 30,
    stripePriceId: process.env.STRIPE_PRICE_ID_MONTHLY || null,
  },
  pro_yearly: {
    label: 'Pro Yearly',
    usdCents: 7999,         // $79.99 / year
    nprPaisa: 1060000,      // NPR 10,600 / year
    durationDays: 365,
    stripePriceId: process.env.STRIPE_PRICE_ID_YEARLY || null,
  },
};

// Helper: upgrade user plan in DB
async function activateProPlan(userId, durationDays, subscriptionDoc) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + durationDays);
  await User.findByIdAndUpdate(userId, { plan: 'pro', planExpiresAt: expiry });
  subscriptionDoc.status = 'active';
  subscriptionDoc.startDate = new Date();
  subscriptionDoc.endDate = expiry;
  await subscriptionDoc.save();
}

// ─── GET /api/payment/plans ────────────────────────────────────────────────────
exports.getPlans = (req, res) => {
  res.json({
    success: true,
    plans: {
      free: {
        name: 'Free',
        price: { usd: 0, npr: 0 },
        features: [
          '5 CV analyses / month',
          '10 job matches / month',
          '3 skill gap reports / month',
          '5 AI chat messages / day',
          '2 interview practice sessions / month',
          'Basic career roadmap',
        ],
      },
      pro_monthly: {
        name: 'Pro Monthly',
        price: { usd: 9.99, npr: 1300 },
        billingCycle: 'monthly',
        features: [
          'Unlimited CV analyses',
          'Unlimited job matches',
          'Unlimited skill gap reports',
          'Unlimited AI chat messages',
          'Unlimited interview practice',
          'Advanced career roadmap',
          'Priority AI processing',
          'Export reports as PDF',
          'Email support',
        ],
      },
      pro_yearly: {
        name: 'Pro Yearly',
        price: { usd: 79.99, npr: 10600 },
        billingCycle: 'yearly',
        savings: '33%',
        features: [
          'Everything in Pro Monthly',
          '2 months free',
          'Priority support',
          'Early access to new features',
        ],
      },
    },
  });
};

// ─── GET /api/payment/status ───────────────────────────────────────────────────
exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+planExpiresAt');
    const isPro = user.plan === 'pro' && (!user.planExpiresAt || user.planExpiresAt > new Date());
    res.json({
      success: true,
      plan: user.plan,
      isPro,
      planExpiresAt: user.planExpiresAt,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  STRIPE
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/payment/stripe/create-checkout-session
exports.stripeCreateSession = async (req, res) => {
  try {
    const { billingCycle = 'monthly' } = req.body;
    const planKey = billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly';
    const plan = PLANS[planKey];
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Create or retrieve Stripe customer
    const user = await User.findById(req.user.id).select('+stripeCustomerId');
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: String(user._id) },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    // Build line items — use price ID if configured, else ad-hoc price
    let lineItems;
    if (plan.stripePriceId) {
      lineItems = [{ price: plan.stripePriceId, quantity: 1 }];
    } else {
      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `CareerAI ${plan.label}`,
              description: 'Unlimited AI-powered career tools',
            },
            unit_amount: plan.usdCents,
            ...(billingCycle === 'monthly'
              ? { recurring: { interval: 'month' } }
              : { recurring: { interval: 'year' } }),
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&gateway=stripe`,
      cancel_url: `${frontendUrl}/pricing`,
      metadata: {
        userId: String(user._id),
        billingCycle,
        planKey,
      },
    });

    // Record pending subscription
    await Subscription.create({
      user: user._id,
      gateway: 'stripe',
      status: 'pending',
      stripeSessionId: session.id,
      amount: plan.usdCents,
      currency: 'usd',
      billingCycle,
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payment/stripe/webhook  (raw body required)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const sub = await Subscription.findOne({ stripeSessionId: session.id });
      if (sub) {
        sub.stripePaymentIntentId = session.payment_intent;
        sub.stripeSubscriptionId = session.subscription;
        const plan = PLANS[sub.billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly'];
        await activateProPlan(sub.user, plan.durationDays, sub);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const stripeSub = event.data.object;
      const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
      if (sub) {
        sub.status = 'cancelled';
        await sub.save();
        await User.findByIdAndUpdate(sub.user, { plan: 'free', planExpiresAt: null });
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  res.json({ received: true });
};

// POST /api/payment/stripe/verify  — called after redirect from Stripe checkout
exports.stripeVerify = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    let sub = await Subscription.findOne({ stripeSessionId: sessionId });
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription record not found' });
    }

    if (sub.status !== 'active') {
      const planKey = sub.billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly';
      sub.stripeSubscriptionId = session.subscription;
      await activateProPlan(sub.user, PLANS[planKey].durationDays, sub);
    }

    const user = await User.findById(sub.user);
    res.json({
      success: true,
      message: 'Pro plan activated!',
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
    });
  } catch (err) {
    console.error('Stripe verify error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ESEWA  (eSewa Nepal — form-POST based gateway)
// ═══════════════════════════════════════════════════════════════════════════════

const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
const ESEWA_SECRET      = process.env.ESEWA_SECRET || '8gBm/:&EnhH.1/q';  // test secret
const ESEWA_BASE_URL    = process.env.ESEWA_BASE_URL || 'https://rc-epay.esewa.com.np'; // sandbox

function esewaSign(message, secret) {
  return crypto.createHmac('sha256', secret).update(message).digest('base64');
}

// POST /api/payment/esewa/initiate
exports.esewaInitiate = async (req, res) => {
  try {
    const { billingCycle = 'monthly' } = req.body;
    const planKey = billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly';
    const plan = PLANS[planKey];
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const txnId = `CAI-${uuidv4().slice(0, 8).toUpperCase()}`;
    const amountNpr = (plan.nprPaisa / 100).toFixed(2);   // e.g. 1300.00
    const taxAmount = '0';
    const serviceCharge = '0';
    const deliveryCharge = '0';

    // eSewa v2 signature: "total_amount=<X>,transaction_uuid=<Y>,product_code=<Z>"
    const signatureMessage = `total_amount=${amountNpr},transaction_uuid=${txnId},product_code=${ESEWA_MERCHANT_ID}`;
    const signature = esewaSign(signatureMessage, ESEWA_SECRET);

    // Persist pending record
    await Subscription.create({
      user: req.user.id,
      gateway: 'esewa',
      status: 'pending',
      esewaTransactionId: txnId,
      amount: plan.nprPaisa,
      currency: 'npr',
      billingCycle,
    });

    // Return the form params — frontend will POST them to eSewa
    res.json({
      success: true,
      gateway: 'esewa',
      formAction: `${ESEWA_BASE_URL}/api/epay/main/v2/form`,
      fields: {
        amount: amountNpr,
        tax_amount: taxAmount,
        service_charge: serviceCharge,
        delivery_charge: deliveryCharge,
        total_amount: amountNpr,
        transaction_uuid: txnId,
        product_code: ESEWA_MERCHANT_ID,
        product_service_charge: serviceCharge,
        product_delivery_charge: deliveryCharge,
        // NOTE: eSewa v2 appends "?data=<base64>" to success_url on redirect.
        // If we pre-append our own query string (e.g. "?gateway=esewa"), the
        // final URL becomes "...?gateway=esewa?data=..." and the "data" param
        // can no longer be parsed by the frontend. Keep the path clean; the
        // PaymentSuccess page detects eSewa by the presence of "data".
        success_url: `${frontendUrl}/payment/success`,
        failure_url: `${frontendUrl}/payment/failed`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
    });
  } catch (err) {
    console.error('eSewa initiate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payment/esewa/verify  — called by frontend after eSewa redirect with encoded data
exports.esewaVerify = async (req, res) => {
  try {
    const { data } = req.body;   // base64 encoded JSON from eSewa success redirect query param
    if (!data) return res.status(400).json({ success: false, message: 'Missing eSewa data' });

    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    const {
      transaction_uuid,
      transaction_code,
      status,
      total_amount,
      signed_field_names,
      signature: esewaSignature,
    } = decoded;

    // Verify signature
    const signFields = signed_field_names.split(',');
    const signMessage = signFields
      .map((f) => `${f}=${decoded[f]}`)
      .join(',');
    const expectedSig = esewaSign(signMessage, ESEWA_SECRET);

    if (expectedSig !== esewaSignature) {
      return res.status(400).json({ success: false, message: 'Signature mismatch — possible tampering' });
    }

    if (status !== 'COMPLETE') {
      return res.status(400).json({ success: false, message: `Payment status: ${status}` });
    }

    const sub = await Subscription.findOne({ esewaTransactionId: transaction_uuid });
    if (!sub) return res.status(404).json({ success: false, message: 'Transaction not found' });

    if (sub.status !== 'active') {
      sub.esewaRefId = transaction_code;
      const planKey = sub.billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly';
      await activateProPlan(sub.user, PLANS[planKey].durationDays, sub);
    }

    const user = await User.findById(sub.user);
    res.json({
      success: true,
      message: 'Pro plan activated via eSewa!',
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
    });
  } catch (err) {
    console.error('eSewa verify error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
