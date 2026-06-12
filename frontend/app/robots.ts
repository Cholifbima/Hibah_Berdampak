import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*', '/keranjang', '/pesanan', '/pesanan/*', '/profil', '/login', '/signup', '/pemesanan'],
    },
    sitemap: 'https://topkonveksi.com/sitemap.xml',
  };
}
