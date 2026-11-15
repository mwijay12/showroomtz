import { Metadata } from 'next';
import { AboutClient } from './about-client';

export const metadata: Metadata = {
  title: 'Our Story | ShowroomTZ Tanzania',
  description: 'The premium showroom for verified dealers and discerning buyers in Tanzania. Discover handpicked vehicles, trusted dealers, and a transparent marketplace.',
  openGraph: {
    title: 'The ShowroomTZ Standard | Premium Car Showroom Tanzania',
    description: 'The premium showroom for verified dealers and discerning buyers in the United Republic of Tanzania.',
    images: ['/images/studio/hero-suv.jpg'],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
