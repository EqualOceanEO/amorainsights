import Stripe from 'stripe';
console.log(Stripe.LATEST_API_VERSION);
// Also check what types are available
const s = new Stripe('sk_test_dummy');
console.log(typeof s.checkout);
