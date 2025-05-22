export interface PricingItem {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  highlight: string;
  features: string[];
  /** Product ID from Stripe */
  priceId: string;
}


export const PRICING: PricingItem[] = [
  {
    id: 'price_1',
    title: 'Starter',
    description: 'Perfect for trying out Webrly',
    price: 'Free',
    duration: '',
    highlight: 'Key features',
    features: ["3 Sub accounts", "2 Team members", "Unlimited pipelines"],
    priceId: '',
  },
  {
    id: 'price_2',
    title: 'Unlimited Saas',
    description: 'The ultimate agency kit',
    price: '199,99€',
    duration: 'month',
    highlight: 'Key features',
    features: ["Everything in Starter and Basic", "Rebilling", "24/7 Support team"],
    priceId: 'price_1RHqglBa1q4VAXiSxrKe3Eqp',
  },
  {
    id: 'price_3',
    title: 'Basic',
    description: 'For serious agency owners',
    price: '49,99€',
    duration: 'month',
    highlight: 'Everything in Starter, plus',
    features: ["Everything in Starter", "Unlimited Sub accounts", "Unlimited Team members"],
    priceId: 'price_1RHqglBa1q4VAXiSHxH98PEw',
  },
]