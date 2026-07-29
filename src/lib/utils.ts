import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Currency } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a price for display in the showroom UI.
 * - TZS → "TSh 285,000,000" (no decimals, big numbers)
 * - USD → "$ 25,000.00" (decimals, smaller numbers)
 */
export function formatTSh(value: number, currency: Currency = 'TZS'): string {
  if (value == null || Number.isNaN(value)) return '—';
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  // TZS — no decimals
  return `TSh ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
}

/**
 * Compact number for big stats: 12500 → "12.5K", 2_300_000 → "2.3M"
 */
export function formatCompact(value: number): string {
  if (value == null || Number.isNaN(value)) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return value.toString();
}

/**
 * Generates a slug from a free-text showroom name.
 * "XYZ Motors & Sons" → "xyz-motors-sons"
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generates an official VoltaShowroom booking code.
 * Format: VLT-[4 chars]-[current year]
 */
export function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'VLT-'
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  code += '-' + new Date().getFullYear()
  return code
}

/**
 * Sanitizes data for Firestore by removing undefined values.
 */
export function sanitizeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) => 
    value === undefined ? null : value
  ));
}

/**
 * Optimizes external image URLs or maps legacy placeholders to local HD vehicle photos.
 */
export function optimizeImageUrl(url: string | null | undefined, width: number = 1200, quality: number = 80): string | null {
  if (!url) return '/images/cars/land_cruiser.jpg';
  
  const keyMap: Record<string, string> = {
    'model-s': '/images/cars/land_cruiser.jpg',
    'rivian-r1s': '/images/cars/prado.jpg',
    'cyber-truck': '/images/cars/s_class.jpg',
    'lucid-air': '/images/cars/bmw_7.jpg',
    'porsche-taycan': '/images/cars/range_rover.jpg',
    'audi-gt': '/images/cars/alphard.jpg',
    'hummer-ev': '/images/cars/lexus_lx.jpg',
    'eqs-sedan': '/images/cars/mercedes_gle.jpg',
    'suv': '/images/cars/suv_hero.jpg',
    'sedan': '/images/cars/sedan_hero.jpg',
    'van': '/images/cars/van_hero.jpg',
    'luxury': '/images/cars/luxury_hero.jpg',
  };

  if (keyMap[url.toLowerCase()]) {
    return keyMap[url.toLowerCase()];
  }

  // If it's already a valid relative path, return as is
  if (url.startsWith('/')) return url;

  try {
    // Cloudinary Optimization
    if (url.includes('cloudinary.com')) {
      if (url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/f_auto,q_${quality === 80 ? 'auto' : quality},w_${width}/`);
      }
    }
    
    // Unsplash Optimization
    if (url.includes('unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?';
      const cleanUrl = url.split('&w=')[0].split('?w=')[0];
      return `${cleanUrl}${separator}auto=format&fit=crop&q=${quality}&w=${width}`;
    }
  } catch (e) {
    console.warn("Image optimization failed for URL:", url);
  }

  return url;
}
