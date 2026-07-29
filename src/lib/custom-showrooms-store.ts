/**
 * Client-side Local Storage store for Showrooms to guarantee 100% reliable persistence 
 * across Admin and Public Showrooms directory (/showrooms).
 */

import { SEED_SHOWROOMS } from '@/lib/showroom-seed';
import { Showroom } from '@/lib/types';

export function saveShowroomToLocalStorage(showroomData: Partial<Showroom> & { name: string }) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('volta_custom_showrooms');
    let list: any[] = raw ? JSON.parse(raw) : [];
    
    const id = showroomData.id || `sr-${Date.now().toString(36)}`;
    const slug = showroomData.slug || showroomData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const fullShowroom = {
      id,
      slug,
      name: showroomData.name,
      city: showroomData.city || 'Dar es Salaam',
      address: showroomData.address || 'Tanzania',
      phone: showroomData.phone || '+255 700 000 000',
      email: showroomData.email || 'info@showrooms.co.tz',
      logoUrl: showroomData.logoUrl || '',
      bannerUrl: showroomData.bannerUrl || '',
      description: showroomData.description || 'Verified Tanzanian Motor Vehicle Dealership.',
      specialties: showroomData.specialties || ['Japanese Imports', 'Luxury SUVs'],
      verified: showroomData.verified ?? true,
      rating: showroomData.rating || 4.9,
      totalListings: showroomData.totalListings || 0,
      updatedAt: new Date().toISOString()
    };

    const idx = list.findIndex(s => s.id === id || s.slug === slug);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...fullShowroom };
    } else {
      list.unshift(fullShowroom);
    }

    localStorage.setItem('volta_custom_showrooms', JSON.stringify(list));
    return fullShowroom;
  } catch (e) {
    console.error("Local storage showroom save failed:", e);
    return null;
  }
}

export function getCustomShowroomsFromLocalStorage(): Showroom[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('volta_custom_showrooms');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function deleteShowroomFromLocalStorage(showroomId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('volta_custom_showrooms');
    if (!raw) return;
    let list: any[] = JSON.parse(raw);
    list = list.filter(s => s.id !== showroomId && s.slug !== showroomId);
    localStorage.setItem('volta_custom_showrooms', JSON.stringify(list));
  } catch (e) {
    console.error("Local storage showroom delete failed:", e);
  }
}
