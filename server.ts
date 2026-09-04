import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsing middleware with error-safe limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Handle JSON parse errors safely
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
      return res.status(400).json({ error: 'Malformed JSON payload' });
    }
    next(err);
  });

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      app: 'Part Source ZA',
      version: '1.0.0',
      database: 'Firebase Firestore',
      databaseId: 'ai-studio-partsourceza-0798c94a-3733-45c0-b790-a3dbc431cd3c',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/system/status', (req: Request, res: Response) => {
    res.json({
      status: 'operational',
      uptime: process.uptime(),
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    });
  });

  // Dynamic robots.txt for search engines (Googlebot, Bingbot, Social bots)
  app.get('/robots.txt', (req: Request, res: Response) => {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const sitemapUrl = `${protocol}://${host}/sitemap.xml`;

    const robotsTxt = `# Part Source ZA - Search Engine Directives
User-agent: *
Allow: /
Allow: /catalog
Allow: /parts/
Allow: /sellers/
Allow: /categories/
Allow: /provinces/
Disallow: /admin-restricted
Disallow: /api/system/

# WhatsApp, Google, Facebook & Social Preview Crawlers
User-agent: Googlebot
Allow: /
User-agent: Bingbot
Allow: /
User-agent: Applebot
Allow: /
User-agent: WhatsApp
Allow: /
User-agent: Twitterbot
Allow: /
User-agent: facebookexternalhit
Allow: /

Sitemap: ${sitemapUrl}
`;
    res.setHeader('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // Dynamic XML Sitemap for Google Search Console & Bing Webmaster Tools
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    const makes = ['toyota', 'volkswagen', 'ford', 'isuzu', 'bmw', 'mercedes-benz', 'nissan', 'hyundai', 'audi', 'scania', 'volvo'];
    const categories = ['engines-motor-spares', 'gearboxes-transmissions', 'body-panels-exterior', 'braking-systems', 'suspension-steering', 'commercial-truck-spares'];
    const provinces = ['gauteng', 'western-cape', 'kwazulu-natal', 'eastern-cape', 'free-state', 'mpumalanga', 'limpopo'];

    let urlsXml = `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?role=buyer</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    // Add Vehicle Makes URLs
    makes.forEach(make => {
      urlsXml += `
  <url>
    <loc>${baseUrl}/?make=${make}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`;
    });

    // Add Parts Categories URLs
    categories.forEach(cat => {
      urlsXml += `
  <url>
    <loc>${baseUrl}/?category=${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`;
    });

    // Add Provinces Scrap Yards URLs
    provinces.forEach(prov => {
      urlsXml += `
  <url>
    <loc>${baseUrl}/?province=${prov}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsXml}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // SEO & Web Exposure Analytics and Keyword Intelligence API
  app.get('/api/seo/data', (req: Request, res: Response) => {
    res.json({
      meta: {
        siteName: 'Part Source ZA',
        tagline: 'South Africa Car & Truck Parts Marketplace',
        region: 'ZA',
        primaryLanguage: 'en-ZA'
      },
      searchEngineReadiness: {
        googleSitelinksEnabled: true,
        sitemapXmlUrl: '/sitemap.xml',
        robotsTxtUrl: '/robots.txt',
        jsonLdSchemaConfigured: true,
        mobilePwaIndexable: true,
        openGraphWhatsAppCards: true
      },
      topSouthAfricaKeywords: [
        { term: 'used car spares south africa', monthlyVolumeZA: 18500, intent: 'High Commercial', difficulty: 'Medium' },
        { term: 'scrap yards johannesburg parts', monthlyVolumeZA: 14200, intent: 'Local Transactional', difficulty: 'Medium' },
        { term: 'toyota hilux engine spares za', monthlyVolumeZA: 9800, intent: 'Direct Purchase', difficulty: 'Low' },
        { term: 'vw polo tsi gearbox pretoria', monthlyVolumeZA: 7400, intent: 'Direct Purchase', difficulty: 'Low' },
        { term: 'ford ranger 2.2 cylinder head durban', monthlyVolumeZA: 6100, intent: 'Direct Purchase', difficulty: 'Low' },
        { term: 'isuzu kb bakkie body parts cape town', monthlyVolumeZA: 5200, intent: 'Direct Purchase', difficulty: 'Low' },
        { term: 'truck spares commercial scrap yards gauteng', monthlyVolumeZA: 4300, intent: 'B2B Fleet', difficulty: 'Low' }
      ]
    });
  });

  // Catch-all for undefined /api/* endpoints so they return structured JSON errors
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
  });

  // Vite middleware for development vs Static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || 'An unexpected error occurred'
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Part Source ZA server running on http://0.0.0.0:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
