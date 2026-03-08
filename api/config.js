module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
    publicationFee: Number(process.env.PUBLICATION_FEE || '4.90'),
    paypalFunctions: {
      createOrder: process.env.PAYPAL_CREATE_ORDER_FUNCTION || 'paypal-create-order',
      captureOrder: process.env.PAYPAL_CAPTURE_ORDER_FUNCTION || 'paypal-capture-order'
    }
  });
};
