import type { Metadata } from 'next';
import { CampaignPage } from '@/components/landing/CampaignPage';

export const metadata: Metadata = {
  title: 'The Volta Collection | Tanzania’s Unmistakable Marques — VoltaShowroom',
  description:
    'Duty-cleared, fully verified Land Cruiser, S-Class, Range Rover and Lexus imports — inspected, documented and delivered anywhere in Tanzania. Talk to a Volta car concierge today.',
  openGraph: {
    title: 'The Volta Collection — Drive the Unmistakable',
    description: 'Verified imports, clear paperwork, white-glove delivery across Tanzania.',
    type: 'website',
  },
};

export default function LuxuryLandingPage() {
  return (
    <CampaignPage
      kicker="The Volta Collection · 2026"
      titleA="Drive the"
      titleB="Unmistakable."
      intro="Duty-cleared, auction-graded imports — Land Cruiser 300, S-Class, Range Rover, LX 600 — inspected at source, documented end-to-end, and delivered to your doorstep anywhere in Tanzania."
      badge="Featured This Month"
      primaryCta={{ label: 'Explore The Collection', href: '/cars' }}
      whatsappLabel="Car Concierge"
      whatsappMessage="Habari Volta! I’m interested in The Volta Collection (luxury imports). Please send me the current list."
      shader="aurora"
      featuredIds={['car-landcruiser-300', 'car-mercedes-s500', 'car-lexus-lx600']}
      bullets={[
        { icon: 'shield', title: 'Verified Provenance', text: 'Japanese auction sheets, chassis verification and accident-history reports on every unit we import.' },
        { icon: 'file',   title: 'Duty Properly Cleared', text: 'TRA-assessed, EFD-receipted, fully duty-paid imports. No shortcuts, no surprises at the port or roadblocks.' },
        { icon: 'badge',  title: '12-Month Dealer Warranty', text: 'Every collection vehicle ships with documented dealer warranty and pre-delivery inspection certificate.' },
        { icon: 'zap',    title: 'Concierge Delivery', text: 'We arrange inspection, shipping, clearing, registration and delivery — you just choose the keys.' },
      ]}
      stats={[
        { value: '500+', label: 'Vehicles Placed' },
        { value: '4.9★', label: 'Avg. Deal Rating' },
        { value: '12mo', label: 'Dealer Warranty' },
        { value: '48h',  label: 'Delivery Setup' },
      ]}
      quote={{
        text: 'I bought a Cruiser 300 without leaving my office. Auction sheet, customs entry, EFD receipt, keys — everything handled by Volta in 21 days.',
        author: 'A. Mwangi — Managing Director, Dar es Salaam',
      }}
    />
  );
}
