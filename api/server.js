/**
 * Tatiana's Gallerie - Backend Server
 * Payment processing and order management
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'https://tatianasgallerie.ch', 
    'http://tatianasgallerie.ch', 
    'https://www.tatianasgallerie.ch'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static('public')); 

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  next();
});

// In-memory order storage (would be a database in production)
const orders = [];

/**
 * Process payment endpoint
 * Handles credit card payment via Stripe
 */
app.post('/api/process-payment', async (req, res) => {
  try {
    // Validate input
    const { paymentMethodId, amount, items, customerInfo } = req.body;
    
    // Input validation
    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method ID is required'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    if (!customerInfo || !customerInfo.email) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required'
      });
    }
    
    // Convert amount to cents (Stripe uses cents)
    const amountInCents = Math.round(amount * 100);
    
    try {
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true, // Confirm the payment immediately
        description: 'Tatianas Gallery Purchase',
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
    } catch (stripeError) {
      console.error('Stripe Error:', {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message
      });

      res.status(400).json({
        success: false,
        message: stripeError.message || 'Payment processing failed',
        errorType: stripeError.type
      });
    }
  } catch (error) {
    console.error('Unexpected server error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Unexpected server error'
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;