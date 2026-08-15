import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/config';

// Tells search engines what to crawl. Public marketing/legal pages are open;
// the in-app and auth routes are kept out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/auth/', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
