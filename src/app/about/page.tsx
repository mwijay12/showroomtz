import { Metadata } from 'next';
import { AboutClient } from './about-client';

export const metadata: Metadata = {
  title: 'Our Story | VoltaShowroom Tanzania',
  description: 'The premium showroom for verified dealers and discerning buyers in Tanzania. Discover handpicked vehicles, trusted dealers, and a transparent marketplace.',
  openGraph: {
    title: 'The Volta Standard | Premium Car Showroom Tanzania',
    description: 'The premium showroom for verified dealers and discerning buyers in the United Republic of Tanzania.',
    images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070&auto=format&fit=crop'],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
