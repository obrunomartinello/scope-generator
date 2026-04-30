import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pgdydpboryoptefsqxsp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Helper: Search DuckDuckGo HTML
async function searchWeb(query) {
  try {
    const { data } = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    const results = [];
    
    $('.result__url').each((i, el) => {
      const url = $(el).attr('href');
      if (url) {
        // DDG routes links through their redirector sometimes, extract clean URL
        let cleanUrl = url;
        if (url.includes('uddg=')) {
          cleanUrl = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
        }
        results.push(cleanUrl);
      }
    });
    return results;
  } catch (error) {
    console.error("Error searching web:", error.message);
    return [];
  }
}

// Helper: Scrape Website
async function scanWebsite(url) {
  const result = {
    email: null,
    whatsapp: null,
    phone: null,
    techStack: null
  };

  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    });
    const $ = cheerio.load(data);

    // 1. Find Emails
    const emailMatch = data.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/i);
    if (emailMatch) result.email = emailMatch[0];

    // 2. Find WhatsApp
    $('a[href*="wa.me"], a[href*="api.whatsapp.com"]').each((i, el) => {
      result.whatsapp = $(el).attr('href');
    });

    // 3. Find Phone
    $('a[href^="tel:"]').each((i, el) => {
      if (!result.phone) result.phone = $(el).attr('href').replace('tel:', '');
    });

    // 4. Tech Stack
    if ($('meta[name="generator"]').attr('content')?.toLowerCase().includes('wix')) {
      result.techStack = 'Wix';
    } else if (data.includes('wp-content')) {
      result.techStack = 'WordPress';
    }

  } catch (error) {
    console.error(`Error scanning website ${url}:`, error.message);
  }

  return result;
}

app.post('/api/generate-scope', async (req, res) => {
  const { query, location } = req.body;
  
  try {
    const googleApiKey = process.env.VITE_GOOGLE_PLACES_API_KEY;
    let businessesToScan = [];

    if (googleApiKey) {
      // 1. TEXT SEARCH
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' in ' + location)}&key=${googleApiKey}`;
      const searchRes = await axios.get(searchUrl);
      
      const places = searchRes.data.results.slice(0, 10); // Limit to top 10 to avoid huge wait times
      
      // 2. FETCH DETAILS FOR EACH PLACE
      for (const place of places) {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=website,formatted_phone_number&key=${googleApiKey}`;
        const detailsRes = await axios.get(detailsUrl);
        const details = detailsRes.data.result || {};

        businessesToScan.push({
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address || location,
          rating: place.rating || 0,
          reviews: place.user_ratings_total || 0,
          phone: details.formatted_phone_number || null,
          website: details.website || null
        });
      }
    } else {
      // MOCK DATA FALLBACK
      businessesToScan = [
        { name: `${query} Experts`, address: location, rating: 4.8, reviews: 112, phone: '+1 (305) 555-0101', website: `https://www.${query.replace(/\s+/g, '').toLowerCase()}experts.com` },
        { name: `Affordable ${query}`, address: location, rating: 3.5, reviews: 14, phone: null, website: null },
        { name: `Elite ${query} Services`, address: location, rating: 4.2, reviews: 45, phone: '+1 (305) 555-0103', website: `https://elite${query.replace(/\s+/g, '').toLowerCase()}.wixsite.com/home` }
      ];
    }

    const finalScopes = [];
    
    // 3. SCAN WEBSITES & SCORE
    for (const b of businessesToScan) {
      let websiteData = { email: null, whatsapp: null, phone: null, techStack: null };
      
      if (b.website) {
        websiteData = await scanWebsite(b.website);
      }

      // CALCULATE HOT LEAD SCORE (Higher = Worse Digital Presence = Hotter Lead)
      let hotScore = 0;
      if (!b.website) hotScore += 50; // Huge red flag, needs a site
      if (!websiteData.whatsapp) hotScore += 30; // Conversion killer
      if (b.rating < 4.0 || b.reviews < 5) hotScore += 20; // Reputation issue
      if (websiteData.techStack === 'Wix') hotScore += 15; // Unprofessional site

      const scope = {
        id: b.placeId || (Date.now() + Math.random()),
        name: b.name,
        address: b.address,
        rating: b.rating,
        reviews: b.reviews,
        phone: b.phone || websiteData.phone || null,
        email: websiteData.email || null,
        whatsapp: websiteData.whatsapp || null,
        website: b.website ? b.website.replace(/^https?:\/\//, '').split('/')[0] : null,
        techStack: websiteData.techStack || null,
        hotScore: hotScore,
        links: { yelp: null, facebook: null, thumbtack: null } // We skip scraping socials for speed, focusing on Maps
      };
      
      finalScopes.push(scope);
      
      if (supabase) {
        await supabase.from('scopes').insert([
          { company_name: scope.name, address: scope.address, website: scope.website, email: scope.email, whatsapp: scope.whatsapp, raw_data: scope }
        ]);
      }
    }

    // 4. SORT BY SCORE DESCENDING
    finalScopes.sort((a, b) => b.hotScore - a.hotScore);

    res.json(finalScopes);
  } catch (error) {
    console.error("Internal Error:", error);
    res.status(500).json({ error: "Erro ao gerar escopo" });
  }
});

app.get('/api/history', async (req, res) => {
  if (!supabase) return res.json([]);
  
  try {
    const { data, error } = await supabase
      .from('scopes')
      .select('raw_data, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (error) {
       console.log("Supabase fetch error (maybe table doesn't exist yet):", error.message);
       return res.json([]);
    }
    
    res.json(data.map(d => ({ ...d.raw_data, time: new Date(d.created_at).toLocaleTimeString() })));
  } catch (err) {
    res.json([]);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor (Scraper) rodando na porta ${PORT}`);
});
