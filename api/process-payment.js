const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { paymentMethodId, amount, items, customerInfo } = req.body;

  if (!paymentMethodId || !amount || !customerInfo?.email) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      receipt_email: customerInfo.email,
      description: 'Tatianas Gallery Purchase',
      metadata: { order_id: uuidv4() }
    });

    if (paymentIntent.status === 'succeeded') {
      res.status(200).json({
        success: true,
        message: 'Payment successful',
        orderId: paymentIntent.metadata.order_id
      });
    } else {
      res.status(200).json({
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        message: 'Payment requires additional action'
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message || 'Stripe error' });
  }
};
