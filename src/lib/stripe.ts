import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    typescript: true,
});

export function getStripePublishableKey(): string {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}

export function formatAmountForStripe(amount: number): number {
    return Math.round(amount * 100);
}

export function formatAmountFromStripe(amount: number): number {
    return amount / 100;
}
