import { MetadataRoute } from 'next';

// Static, build-safe sitemap. No network dependencies — works identically
// in the sandbox, CI and Vercel. Add new routes here when they ship.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://voltashowroom.co.tz';
  const now = new Date();

  const staticPaths: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }> = [
    { path: '',                priority: 1.0, changeFrequency: 'daily' },
    { path: '/cars',           priority: 0.9, changeFrequency: 'daily' },
    { path: '/showrooms',      priority: 0.8, changeFrequency: 'weekly' },
    { path: '/fleet',          priority: 0.7, changeFrequency: 'weekly' },
    { path: '/find-my-car',    priority: 0.7, changeFrequency: 'weekly' },
    { path: '/compare',        priority: 0.6, changeFrequency: 'weekly' },
    { path: '/book',           priority: 0.8, changeFrequency: 'monthly' },
    { path: '/about',          priority: 0.5, changeFrequency: 'monthly' },
    { path: '/contact',        priority: 0.5, changeFrequency: 'monthly' },
    { path: '/faq',            priority: 0.5, changeFrequency: 'monthly' },
    { path: '/landing',        priority: 0.7, changeFrequency: 'weekly' },
    { path: '/landing/luxury', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/landing/corporate', priority: 0.8, changeFrequency: 'weekly' },
  ];

  return staticPaths.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
