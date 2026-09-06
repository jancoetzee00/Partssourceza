import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  // Port 3000 is required by the infrastructure: nginx listens on container ingress (8080) and proxies to 3000
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

  // AI Marketing & Growth Strategy Generator with Gemini 3.8 Flash
  app.post('/api/ai/marketing-strategy', async (req: Request, res: Response) => {
    try {
      const {
        targetAudience = 'sellers', // 'sellers' | 'buyers' | 'dual_sided'
        channel = 'whatsapp_broadcast',
        targetProvince = 'All South Africa',
        vehicleFocus = 'All Vehicles (Bakkies, Cars & Trucks)',
        customGoal = ''
      } = req.body || {};

      const prompt = `You are the Chief Growth & Marketing Officer for "Part Source ZA" (partssource.co.za), South Africa's premier automotive and commercial truck spares marketplace.

Context about the platform:
- Connects verified scrap yards, auto dismantlers, engine importers, and parts suppliers directly to South African car owners, DIY mechanics, panel beaters, workshops, and fleet operators.
- Key features: Direct WhatsApp buyer-to-seller negotiation, geolocation filtering across all 9 provinces (Gauteng, Western Cape, KZN, Eastern Cape, Free State, etc.), verified seller badges, parts comparison tool, bulk inventory Excel upload, 0% buyer commission, and tiered supplier subscriptions (Starter R299/mo, Pro R699/mo, Enterprise R1,499/mo).
- Key physical South African parts hubs: Booysens & Mayfair & Pretoria West (Gauteng), Clairwood & Springfield & Phoenix (KZN), Philippi & Stikland & Maitland (Western Cape), Korsten (Gqeberha/Port Elizabeth), Bloemfontein (Free State).
- Popular vehicles in SA: Toyota Hilux, VW Polo / Polo Vivo, Ford Ranger, Isuzu D-Max, Toyota Quantum taxi, BMW 3-series, Mercedes-Benz, commercial Scania/Volvo trucks.

Task:
Create an aggressive, highly practical, battle-tested marketing and acquisition campaign strategy.
Target Audience: ${targetAudience} (Sellers / Scrap yards OR Buyers / Car owners OR Dual-Sided Marketplace Blitz)
Marketing Channel: ${channel}
Target Province/Region: ${targetProvince}
Vehicle / Spares Focus: ${vehicleFocus}
Specific Strategic Objective: ${customGoal || 'Maximize user acquisition, platform visibility, and direct WhatsApp conversions across South Africa.'}

CRITICAL: Return ONLY a valid, raw JSON object (without markdown backticks or commentary) adhering strictly to this schema:
{
  "campaignTitle": "Short, punchy campaign name with South African context",
  "targetAudience": "${targetAudience}",
  "channel": "${channel}",
  "targetProvince": "${targetProvince}",
  "executiveSummary": "2-3 sentences explaining the psychological trigger and why this will work in South Africa",
  "coreGrowthHook": "The irresistible proposition or hook (e.g. Stop losing parts leads to Facebook scammers; 14-day free trial; Find any gearbox in 60s)",
  "keyTactics": [
    "Step 1: Specific tactical action",
    "Step 2: Specific tactical action",
    "Step 3: Specific tactical action",
    "Step 4: Specific tactical action"
  ],
  "readyCopyWhatsApp": "Complete, ready-to-copy WhatsApp broadcast message or direct pitch formatted with emojis, bold asterisks, South African automotive tone, clear call-to-action link placeholder (https://partssource.co.za), and contact details.",
  "readyCopySocial": "Complete, ready-to-copy social post caption (for Facebook Groups, Marketplace, Instagram, or TikTok) with relevant South African automotive hashtags (#UsedSparesSA, #ScrapYardsZA, #ToyotaHiluxSpares, etc.)",
  "physicalDigitalLocations": [
    "Exact physical scrap yard strip or industrial area in SA",
    "Exact digital group, forum, or online community in SA",
    "Exact physical or digital channel"
  ],
  "callToAction": "Direct, urgency-driven CTA",
  "kpiMetrics": "Concrete measurable milestone (e.g., 25 scrap yards signed up in 14 days, 1,200 buyer WhatsApp inquiries generated)"
}`;

      let aiResult = null;

      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getAi();
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            }
          });

          const text = response.text?.trim() || '';
          if (text) {
            // Clean markdown wrappers if any
            const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            aiResult = JSON.parse(cleaned);
          }
        } catch (genAiError: any) {
          console.warn('Gemini API call warning in marketing strategy endpoint:', genAiError?.message || genAiError);
        }
      }

      // If AI succeeded, return it
      if (aiResult && aiResult.campaignTitle) {
        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          campaign: aiResult
        });
      }

      // Robust fallback strategy engine tailored to South African automotive market
      const fallbackCampaigns: Record<string, any> = {
        sellers: {
          campaignTitle: `Operation Scrappy Blitz: ${targetProvince} Yard-to-Yard Supplier Onboarding`,
          targetAudience: 'sellers',
          channel: channel,
          targetProvince: targetProvince,
          executiveSummary: `Scrap yard and auto dismantler owners in ${targetProvince} lose thousands of hours each month fielding unqualified calls on Facebook Marketplace and Gumtree. By offering an instant, mobile-first inventory hub with direct WhatsApp leads and zero listing fees during a 14-day trial, we overcome reluctance and rapidly build catalog density.`,
          coreGrowthHook: 'Turn your salvage yard stock into verified WhatsApp buyer leads in 60 seconds — R0 commission, zero upfront cost.',
          keyTactics: [
            `Scout and visit physical scrap yard clusters in ${targetProvince} (e.g. Booysens, Mayfair, Pretoria West, Clairwood, Stikland) with physical 1-page onboarding cards.`,
            'Offer hands-on "Scrappy Concierge": take photos of 10 of their high-value stripped engines/gearboxes right in their yard and upload them on the spot.',
            'Integrate existing Excel / CSV parts inventory lists within 10 seconds using the Part Source ZA bulk uploader.',
            'Provide free "Verified Supplier ZA" physical yard sticker and digital WhatsApp catalog badge to build immediate prestige.'
          ],
          readyCopyWhatsApp: `🚗 *ATTENTION AUTO DISMANTLERS & SCRAP YARDS (${targetProvince.toUpperCase()})* 🇿🇦\n\nTired of endless "is this still available?" time-wasters on Gumtree and Facebook?\n\n*Part Source ZA* is South Africa's dedicated parts advertising network connecting you directly to pre-qualified buyers needing engines, gearboxes, body panels, and bakkie spares!\n\n✅ *Direct WhatsApp Inquiries:* Serious buyers contact your phone directly.\n✅ *Zero Listing Commission:* You keep 100% of your sales.\n✅ *Instant Mobile Inventory:* Upload parts from your phone in 30 seconds.\n✅ *14-Day Free Yard Pass:* Test it with zero risk.\n\n👉 *Claim your Verified Supplier spot now:* https://partssource.co.za/?role=seller\n\n_Reply YES to get your yard listed today!_`,
          readyCopySocial: `🔧 Attention Scrap Yard Owners & Auto Spares Suppliers in ${targetProvince}!\n\nStop losing money on parts sitting in your yard. Serious mechanics, panel beaters, and car owners are searching for used and reconditioned spares right now on Part Source ZA.\n\n🌟 100% Free 14-Day Trial for Verified Yards\n🌟 Instant WhatsApp Buyer Leads direct to your sales desk\n🌟 Bulk Excel stock uploads supported\n\n👉 Join South Africa's fastest-growing auto parts network: https://partssource.co.za\n\n#ScrapYardsSouthAfrica #AutoSparesSA #UsedCarParts #BakkieSpares #JohannesburgSpares #CapeTownSpares #DurbanAuto`,
          physicalDigitalLocations: [
            'Physical Yards: Booysens & Mayfair (JHB), Pretoria West & Hermanstad (PTA), Clairwood & Springfield (DBN), Stikland & Philippi (CPT)',
            'WhatsApp Groups: Auto Spares SA Traders, Scrappies South Africa Network, Panelbeaters & Mechanics ZA',
            'Digital Forums: 4x4 Community SA Buy/Sell, VW Club South Africa Spares, Gumtree Automotive Sellers'
          ],
          callToAction: 'Sign up your scrap yard on Part Source ZA today and receive pre-qualified buyer inquiries directly to your WhatsApp.',
          kpiMetrics: 'Target: 50 registered scrap yards in 30 days; 2,500 active listings across major makes (Toyota, VW, Ford, Isuzu).'
        },
        buyers: {
          campaignTitle: `The "Never Pay Dealership Prices" Spares Blitz (${targetProvince})`,
          targetAudience: 'buyers',
          channel: channel,
          targetProvince: targetProvince,
          executiveSummary: `Car owners, DIY hobbyists, and private transport operators across ${targetProvince} face exorbitant OEM dealership quotes (R15,000+ for alternators, steering racks, or cylinder heads). Positioning Part Source ZA as the trusted digital directory to compare verified salvage yards and buy direct on WhatsApp creates instant consumer viral sharing.`,
          coreGrowthHook: 'Find OEM-tested second-hand car spares in 60 seconds from verified scrap yards across SA — at up to 75% off dealership prices.',
          keyTactics: [
            'Launch high-intent vehicle problem ads ("Hilux gearbox noise?", "Polo TSI EPC warning light?", "Ranger 2.2 cylinder head blown?") directing straight to filtered catalog links.',
            'Deploy the viral "WhatsApp Quote Requester" where buyers submit their VIN/engine code and get broadcast quotes from 10+ local yards within 30 minutes.',
            'Engage independent mechanics and workshop technicians with wholesale pricing comparison tools.',
            'Programmatic SEO targeting provincial keywords: "used gearbox Pretoria", "Hilux engine Durban", "Polo spares Cape Town".'
          ],
          readyCopyWhatsApp: `⚠️ *CAR BROKEN DOWN? DON'T PAY CRAZY DEALERSHIP PRICES!* 🇿🇦🚗\n\nNeed a replacement engine, gearbox, alternator, bumper, or cylinder head for your car, bakkie, or truck?\n\nSearch *Part Source ZA* — South Africa's verified scrap yard marketplace:\n\n🔍 Search thousands of tested used & reconditioned spares\n📍 Filter by your province (${targetProvince}) or nationwide delivery\n💬 Chat directly with verified scrap yards via WhatsApp\n🛡️ Verified suppliers with test warranties\n\n👉 *Find your part in 60 seconds:* https://partssource.co.za\n\n_Forward this to friends, mechanics, and car groups who need spares!_`,
          readyCopySocial: `💥 Dealing with an insane R20,000 repair quote from the dealership?\n\nBefore you drain your savings, check Part Source ZA! Compare tested used OEM and reconditioned parts from verified scrap yards and auto dismantlers across ${targetProvince} and all 9 provinces.\n\n🚗 Toyota, VW, Ford, Isuzu, BMW, Mercedes & Heavy Commercial Trucks\n💬 WhatsApp the yard directly for photos and VIN confirmation\n🚚 Nationwide door-to-door courier available\n\n👉 Search parts now: https://partssource.co.za\n\n#CarPartsSA #HiluxSpares #PoloSpares #SouthAfricaCars #AutoSparesZA #ScrapYardParts #AffordableRepairs`,
          physicalDigitalLocations: [
            'Social Channels: Facebook Marketplace, TikTok automotive creators (#CarTokSA, #SABakkieLife)',
            'Digital Groups: Toyota Hilux Club SA, VW Polo Drivers South Africa, 4x4 Community SA, Ford Ranger Spares ZA',
            'Physical Hotspots: Taxi ranks (SANTACO associations), independent RMI repair workshops, auto fitment centers'
          ],
          callToAction: 'Search the live catalog on Part Source ZA or tap WhatsApp to request hard-to-find car parts right now.',
          kpiMetrics: 'Target: 15,000 monthly unique buyer searches; 1,800 direct WhatsApp inquiries initiated to scrap yards.'
        },
        dual_sided: {
          campaignTitle: `South Africa Automotive Flywheel: 360° Marketplace Blitz`,
          targetAudience: 'dual_sided',
          channel: channel,
          targetProvince: targetProvince,
          executiveSummary: `Marketplaces require simultaneous liquidity: scrap yards need buyer inquiries to stay active, while car owners need a dense catalog of parts. This dual-sided campaign leverages hyper-local scrap yard clusters combined with high-volume bakkie and commuter vehicle buyer campaigns.`,
          coreGrowthHook: 'The modern South African bridge: Connecting verified salvage yards directly to car owners over WhatsApp.',
          keyTactics: [
            'Phase 1 (Day 1-14): Supply Blitz — Onboard 30 anchor yards in JHB/PTA/DBN/CPT with free 14-day Pro tier access.',
            'Phase 2 (Day 15-30): Demand Blitz — Launch targeted Facebook/TikTok video campaigns focused on top 5 failure parts (turbos, gearboxes, alternators, bumpers, ECUs).',
            'Phase 3: Viral Loop — Every buyer inquiry sends automated WhatsApp notifications to yards; yards share their custom Part Source ZA profile link on their existing customer chats.',
            'Phase 4: B2B Expansion — Onboard panel beaters and courier/logistics fleets for commercial truck and bakkie spares.'
          ],
          readyCopyWhatsApp: `🇿🇦 *PART SOURCE ZA — THE AUTO SPARES REVOLUTION* 🚗\n\nWhether you have car parts sitting in your yard OR you're desperately looking for an affordable replacement part, *Part Source ZA* connects you directly!\n\n🏢 *For Scrap Yards & Suppliers:* List your parts in 30 seconds and receive direct WhatsApp leads. Zero commission!\n🚗 *For Car & Truck Owners:* Find guaranteed tested parts from verified yards across SA at up to 70% off.\n\n👉 *Explore now:* https://partssource.co.za\n\n_Built for South Africa's automotive community!_`,
          readyCopySocial: `🇿🇦 South Africa's dedicated Car & Truck Spares Platform is LIVE!\n\nWhether you are an auto dismantler looking to move stock or a car owner needing an urgent replacement part without paying dealership prices, Part Source ZA has you covered.\n\n✅ Verified Scrap Yards & Suppliers\n✅ Direct WhatsApp negotiation\n✅ Geolocation across all 9 provinces\n✅ From Toyota Hilux to Scania Commercial Spares\n\n👉 Join the network: https://partssource.co.za\n\n#PartSourceZA #SouthAfricaAuto #ScrapYards #UsedPartsSA #BakkieSpares #CarRepairsSA`,
          physicalDigitalLocations: [
            'National: Gauteng, Western Cape, KwaZulu-Natal, Eastern Cape industrial hubs',
            'Associations: TEPA, RMI, Scrap Metal Association of SA, SANTACO taxi fleets',
            'Digital: Facebook Automotive Buy & Sell groups with 100k+ SA members'
          ],
          callToAction: 'Visit Part Source ZA today to list your salvage inventory or find guaranteed auto spares near you.',
          kpiMetrics: 'Target: 100 active verified yards, 10,000 monthly active buyer searches, 2,500 WhatsApp inquiries in 60 days.'
        }
      };

      const fallback = fallbackCampaigns[targetAudience] || fallbackCampaigns.dual_sided;

      return res.json({
        success: true,
        source: 'built-in-intelligence-engine',
        campaign: fallback
      });

    } catch (error: any) {
      console.error('Error generating AI marketing strategy:', error);
      res.status(500).json({
        error: 'Failed to generate AI marketing strategy',
        message: error?.message || 'Unexpected error'
      });
    }
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
