module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  const paypalClientId =
    process.env.PAYPAL_CLIENT_ID ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    '';

  res.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
    paypalClientId,
    publicationFee: Number(process.env.PUBLICATION_FEE || '4.90'),
    paypalFunctions: {
      createOrder: process.env.PAYPAL_CREATE_ORDER_FUNCTION || '/api/paypal-create-order',
      captureOrder: process.env.PAYPAL_CAPTURE_ORDER_FUNCTION || '/api/paypal-capture-order'
    }
  });
};
