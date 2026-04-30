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
  const searchQuery = `${query} ${location || ''}`.trim();

  try {
    console.log(`Buscando por: ${searchQuery}`);
    
    // 1. Search web to find links
    const links = await searchWeb(searchQuery);
    
    // Categorize Links
    let mainWebsite = null;
    const socialLinks = { yelp: null, facebook: null, thumbtack: null };
    
    for (const link of links) {
      if (link.includes('yelp.com/biz/')) socialLinks.yelp = link;
      else if (link.includes('facebook.com/')) socialLinks.facebook = link;
      else if (link.includes('thumbtack.com/')) socialLinks.thumbtack = link;
      else if (!mainWebsite && !link.includes('google.com') && !link.includes('duckduckgo.com') && !link.includes('yelp.com') && !link.includes('facebook.com')) {
        mainWebsite = link;
      }
    }

    // 2. Scan the main website if found
    let websiteData = {};
    if (mainWebsite) {
      websiteData = await scanWebsite(mainWebsite);
    }

    // Assemble final Scope Card
    const scope = {
      id: Date.now(),
      name: query,
      address: location || 'Desconhecido',
      rating: 4.0, // Mocked rating since we aren't using Google Maps API
      reviews: 'N/A',
      phone: websiteData.phone || null,
      email: websiteData.email || null,
      whatsapp: websiteData.whatsapp || null,
      website: mainWebsite ? mainWebsite.replace(/^https?:\/\//, '') : null,
      techStack: websiteData.techStack || null,
      links: socialLinks
    };

    // 3. Save to Supabase (if connected)
    if (supabase) {
      const { error } = await supabase.from('scopes').insert([
        { 
          company_name: scope.name, 
          address: scope.address, 
          website: scope.website,
          email: scope.email,
          whatsapp: scope.whatsapp,
          raw_data: scope 
        }
      ]);
      if (error && error.code !== '42P01') { // Ignore table not found error for now
        console.error("Supabase insert error:", error);
      }
    }

    res.json(scope);

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
