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
      amount: amountInCents,
      currency: 'chf',
      payment_method: paymentMethodId,
      confirm: true,
      description: 'Tatianas Gallery Purchase',
      receipt_email: customerInfo.email,
      metadata: {
        order_id: uuidv4(),
        customer_name: customerInfo.name,
        shipping_address: `${customerInfo.address.line1}, ${customerInfo.address.postal_code} ${customerInfo.address.city}`,
        paintings: req.body.itemSummary || items.map(i => `${i.title} (${i.quantity}x)`).join(', ')
      }
    });
    

    if (paymentIntent.status === 'succeeded') {
      res.status(200).json({
        success: true,
        message: 'Payment successful',
        orderId: paymentIntent.metadata.order_id,
        clientSecret: paymentIntent.client_secret
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
