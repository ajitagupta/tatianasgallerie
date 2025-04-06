const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { paymentMethodId, amount, items, customerInfo, itemSummary } = req.body;

  if (!paymentMethodId || !amount || !customerInfo?.email) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }

  try {
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'chf',
      payment_method: paymentMethodId,
      confirm: false,
      description: 'Tatianas Gallery Purchase',
      receipt_email: customerInfo.email,
      metadata: {
        order_id: uuidv4(),
        customer_name: customerInfo.name,
        shipping_address: `${customerInfo.address.line1}, ${customerInfo.address.postal_code} ${customerInfo.address.city}`,
        paintings: itemSummary || items.map(i => `${i.title} (${i.quantity}x)`).join(', ')
      },
      shipping: {
        name: customerInfo.name,
        address: customerInfo.address
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });

    res.status(200).json({
      success: true,
      message: 'PaymentIntent created',
      orderId: paymentIntent.metadata.order_id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error('Stripe PaymentIntent Error:', err);
    res.status(400).json({ message: err.message || 'Stripe error' });
  }
};
