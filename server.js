require('dotenv').config();

const express = require('express');
const path = require('path');
const Stripe = require('stripe');
const products = require('./catalog');

const app = express();
const port = Number(process.env.PORT) || 3000;
const siteUrl = (process.env.SITE_URL || `http://localhost:${port}`).replace(/\/$/, '');
const shippingCents = Number(process.env.STANDARD_SHIPPING_CENTS || 500);
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const catalog = new Map(products.map(product => [product.id, product]));
const letterStock = {
  A: 6, B: 4, C: 7, D: 7, E: 5, F: 6, G: 4, H: 6, I: 7, J: 7, K: 6, L: 7, M: 7,
  N: 6, O: 6, P: 7, Q: 6, R: 8, S: 7, T: 6, U: 7, V: 6, W: 6, X: 6, Y: 5, Z: 5
};

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), (request, response) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return response.status(503).send('Stripe webhook is not configured.');

  let event;
  try {
    event = stripe.webhooks.constructEvent(request.body, request.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Paid order received', {
      checkoutSessionId: session.id,
      customerEmail: session.customer_details && session.customer_details.email,
      amountTotal: session.amount_total
    });
  }

  response.json({ received: true });
});

app.use(express.json({ limit: '100kb' }));

app.get('/api/products', (_request, response) => response.json(products));
app.get('/api/health', (_request, response) => response.json({ ok: true }));

app.post('/api/create-checkout-session', async (request, response) => {
  if (!stripe) return response.status(503).json({ error: 'Checkout is not configured yet. Add STRIPE_SECRET_KEY in Render.' });

  try {
    const requestedItems = Array.isArray(request.body.items) ? request.body.items : [];
    if (!requestedItems.length) return response.status(400).json({ error: 'Your cart is empty.' });

    const quantities = new Map();
    const customItems = [];
    for (const item of requestedItems) {
      if (typeof item.id !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return response.status(400).json({ error: 'The cart contains an invalid item.' });
      }
      if (item.id === 'custom-clicker') {
        customItems.push(item);
        continue;
      }
      quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
    }

    const lineItems = [];
    for (const [id, quantity] of quantities) {
      const product = catalog.get(id);
      if (!product) return response.status(400).json({ error: 'A product in your cart is no longer available.' });
      if (quantity > product.stock) return response.status(400).json({ error: `Only ${product.stock} ${product.name} item(s) are available.` });

      lineItems.push({
        quantity,
        price_data: {
          currency: 'usd',
          unit_amount: product.price,
          product_data: { name: product.name, description: product.description }
        }
      });
    }

    const requestedLetters = {};
    for (const item of customItems) {
      const configuration = item.configuration || {};
      const text = String(configuration.text || '').toUpperCase();
      if (!/^[A-Z]{2,12}$/.test(text)) {
        return response.status(400).json({ error: 'Custom clickers can contain 2–12 available letters.' });
      }

      for (const letter of text) requestedLetters[letter] = (requestedLetters[letter] || 0) + item.quantity;
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: text.length * 50,
          product_data: {
            name: `Custom Clicker “${text}”`,
            description: `${configuration.color || 'Selected color'}, ${configuration.layout || 'Selected layout'}`
          }
        }
      });
    }

    for (const [letter, quantity] of Object.entries(requestedLetters)) {
      if (quantity > letterStock[letter]) {
        return response.status(400).json({ error: `Only ${letterStock[letter]} letter ${letter} piece(s) are available.` });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_creation: 'always',
      phone_number_collection: { enabled: true },
      billing_address_collection: 'auto',
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Local pickup'
          }
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingCents, currency: 'usd' },
            display_name: 'Standard shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        }
      ],
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/index.html#cart`,
      allow_promotion_codes: true
    });

    response.json({ url: session.url });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Checkout could not be started. Please try again.' });
  }
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.get(['/', '/index.html'], (_request, response) => response.sendFile(path.join(__dirname, 'index.html')));
app.get('/catalog.js', (_request, response) => response.sendFile(path.join(__dirname, 'catalog.js')));
app.get('/success.html', (_request, response) => response.sendFile(path.join(__dirname, 'success.html')));
app.get('/points-worksheet.html', (_request, response) => response.sendFile(path.join(__dirname, 'points-worksheet.html')));
app.get('/glowing%20cat%20picture.png', (_request, response) => response.sendFile(path.join(__dirname, 'glowing cat picture.png')));

app.listen(port, () => console.log(`GLITCH PRINTS is running at ${siteUrl}`));
