/**
 * Brushstrokes Gallery - Backend Server
 * Payment processing and order management
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY'); // Replace with your Stripe secret key
const { v4: uuidv4 } = require('uuid');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// In-memory order storage (would be a database in production)
const orders = [];

/**
 * Process payment endpoint
 * Handles credit card payment via Stripe
 */
app.post('/api/process-payment', async (req, res) => {
  try {
    const { paymentMethodId, amount, items, customerInfo } = req.body;
    
    // Convert amount to cents (Stripe uses cents)
    const amountInCents = Math.round(amount * 100);
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, // Confirm the payment immediately
      description: 'Brushstrokes Gallery Purchase',
      receipt_email: customerInfo.email,
      metadata: {
        order_id: uuidv4() // Generate a unique order ID
      }
    });
    
    // Check if payment was successful
    if (paymentIntent.status === 'succeeded') {
      // Create order record
      const order = {
        id: paymentIntent.metadata.order_id,
        date: new Date(),
        customer: customerInfo,
        items: items,
        total: amount,
        paymentId: paymentIntent.id,
        status: 'confirmed'
      };
      
      // Save order (to database in production)
      orders.push(order);
      
      // Return success response with order details
      res.json({
        success: true,
        orderId: order.id,
        message: 'Payment successful'
      });
      
      // In a real app, you would send confirmation emails here
      sendOrderConfirmationEmail(order);
      
    } else {
      // Payment requires additional action
      res.json({
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        message: 'Payment requires additional action'
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    
    // Return error response
    res.status(400).json({
      success: false,
      message: error.message || 'Payment failed'
    });
  }
});

/**
 * Get order details endpoint
 */
app.get('/api/orders/:orderId', (req, res) => {
  const order = orders.find(o => o.id === req.params.orderId);
  
  if (order) {
    res.json({
      success: true,
      order: order
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }
});

/**
 * Mock function for sending confirmation emails
 * In production, use a proper email service like SendGrid or Mailgun
 */
function sendOrderConfirmationEmail(order) {
  console.log(`Sending confirmation email for order ${order.id} to ${order.customer.email}`);
  // In production, integrate with an email service here
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});