import type { Metadata } from 'next';
import { CampaignPage } from '@/components/landing/CampaignPage';

export const metadata: Metadata = {
  title: 'Volta Corporate Fleet | Executive & NGO Fleet Leasing Tanzania',
  description:
    'Monthly-leased Land Cruisers, HiAce vans, Hilux and executive sedans for corporates, NGOs and embassies — insured, serviced and EFD-compliant invoicing. Delivered nationwide.',
  openGraph: {
    title: 'Volta Corporate Fleet — Move Teams, Not Excuses',
    description: 'Executive & field fleet leasing across Tanzania with EFD invoicing and full compliance.',
    type: 'website',
  },
};

export default function CorporateLandingPage() {
  return (
    <CampaignPage
      kicker="Volta Corporate Fleet · Nationwide"
      titleA="Move Teams,"
      titleB="Not Excuses."
      intro="Executive sedans, Land Cruisers, HiAce vans and Hilux pickups for corporates, NGOs and diplomatic missions — fully insured, serviced, with TRA EFD-compliant invoicing and monthly reporting."
      badge="Fleet Favourites"
      primaryCta={{ label: 'Get a Fleet Quote', href: '/contact' }}
      whatsappLabel="Fleet Desk"
      whatsappMessage="Habari Volta Fleet Desk! We need a corporate fleet quote (vehicles, count, duration). Please send your rate card."
      shader="liquid"
      featuredIds={['car-toyota-hilux', 'car-hiace-bus', 'car-prado-txl']}
      bullets={[
        { icon: 'truck', title: 'Rapid Deployment', text: 'Standby fleet pool in Dar es Salaam — replacement vehicles within 24–48h if a unit goes down.' },
        { icon: 'file',  title: 'EFD-Compliant Billing', text: 'Monthly VAT invoices with e-fiscal receipts, cost-center tagging and expense-report ready exports.' },
        { icon: 'shield', title: 'Insured & Tracked', text: 'Comprehensive cover, GPS tracking and driver vetting available for every leased unit.' },
        { icon: 'star',  title: 'Dedicated Account Manager', text: 'One WhatsApp thread, one invoice, one throat to choke — your Volta fleet manager, 7 days a week.' },
      ]}
      stats={[
        { value: '50+',  label: 'Fleet Units Managed' },
        { value: '7',    label: 'Cities Covered' },
        { value: '24h',  label: 'Replacement Guarantee' },
        { value: '100%', label: 'EFD Compliant' },
      ]}
      quote={{
        text: 'Twelve units across Dar, Dodoma and Mwanza — one invoice, zero downtime. Volta’s fleet desk is the only vendor we renewed without negotiating.',
        author: 'Operations Director — International NGO, Tanzania',
      }}
    />
  );
}
