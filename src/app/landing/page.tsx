import type { Metadata } from 'next';
import { LandingIndex } from '@/components/landing/LandingIndex';

export const metadata: Metadata = {
  title: 'ShowroomTZ Campaigns | Curated Experiences — ShowroomTZ Tanzania',
  description:
    'The ShowroomTZ Collection luxury import edit and the ShowroomTZ Corporate Fleet programme — Tanzania’s most disciplined vehicle partner, in two acts.',
};

export default function LandingIndexPage() {
  return <LandingIndex />;
}
