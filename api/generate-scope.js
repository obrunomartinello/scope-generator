import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pgdydpboryoptefsqxsp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const yelpApiKey = process.env.YELP_API_KEY;

// Original fallback scraper
async function searchWeb(query) {
  try {
    const { data } = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const results = [];
    $('.result__url').each((i, el) => {
      const url = $(el).attr('href');
      if (url) {
        let cleanUrl = url;
        if (url.includes('uddg=')) cleanUrl = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
        results.push(cleanUrl);
      }
    });
    return results;
  } catch (error) { return []; }
}

async function scanWebsite(url) {
  const result = { email: null, whatsapp: null, phone: null, techStack: null };
  try {
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
    const $ = cheerio.load(data);
    const emailMatch = data.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/i);
    if (emailMatch) result.email = emailMatch[0];
    $('a[href*="wa.me"], a[href*="api.whatsapp.com"]').each((i, el) => { result.whatsapp = $(el).attr('href'); });
    $('a[href^="tel:"]').each((i, el) => { if (!result.phone) result.phone = $(el).attr('href').replace('tel:', ''); });
    if ($('meta[name="generator"]').attr('content')?.toLowerCase().includes('wix')) result.techStack = 'Wix';
    else if (data.includes('wp-content')) result.techStack = 'WordPress';
  } catch (error) {}
  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { query, location } = req.body;
  let businessesToScan = [];

  try {
    // 1. Get List of Businesses
    if (yelpApiKey) {
      // YELP API PATH (Bulk)
      const { data } = await axios.get(`https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(query)}&location=${encodeURIComponent(location || 'Orlando, FL')}&limit=3`, {
        headers: { Authorization: `Bearer ${yelpApiKey}` }
      });
      businessesToScan = data.businesses.map(b => ({
        name: b.name,
        address: b.location?.address1 || location,
        rating: b.rating,
        reviews: b.review_count,
        phone: b.display_phone,
        yelpLink: b.url,
        searchQuery: `${b.name} ${b.location?.address1 || ''} official website`
      }));
    } else {
      // MOCK PATH (To demonstrate bulk search without Yelp Key)
      businessesToScan = [
        { name: `${query} Pro`, address: location || 'Miami, FL', rating: 4.8, reviews: 112, phone: '+1 (305) 555-0101', yelpLink: 'https://yelp.com', searchQuery: `${query} Pro Miami` },
        { name: `Affordable ${query}`, address: location || 'Miami, FL', rating: 3.5, reviews: 14, phone: '+1 (305) 555-0102', yelpLink: 'https://yelp.com', searchQuery: `Affordable ${query} Miami` },
        { name: `Elite ${query} Services`, address: location || 'Miami, FL', rating: 4.2, reviews: 45, phone: '+1 (305) 555-0103', yelpLink: 'https://yelp.com', searchQuery: `Elite ${query} Services Miami` }
      ];
    }

    // 2. Scan each business
    const finalScopes = [];
    for (const b of businessesToScan) {
      const links = await searchWeb(b.searchQuery);
      let mainWebsite = null;
      const socialLinks = { yelp: b.yelpLink, facebook: null, thumbtack: null };
      
      for (const link of links) {
        if (link.includes('facebook.com/')) socialLinks.facebook = link;
        else if (link.includes('thumbtack.com/')) socialLinks.thumbtack = link;
        else if (!mainWebsite && !link.includes('google.com') && !link.includes('duckduckgo.com') && !link.includes('yelp.com')) {
          mainWebsite = link;
        }
      }

      let websiteData = {};
      if (mainWebsite) websiteData = await scanWebsite(mainWebsite);

      const scope = {
        id: Date.now() + Math.random(),
        name: b.name,
        address: b.address,
        rating: b.rating,
        reviews: b.reviews,
        phone: b.phone || websiteData.phone || null,
        email: websiteData.email || null,
        whatsapp: websiteData.whatsapp || null,
        website: mainWebsite ? mainWebsite.replace(/^https?:\/\//, '').split('/')[0] : null,
        techStack: websiteData.techStack || null,
        links: socialLinks
      };
      
      finalScopes.push(scope);
      
      if (supabase) {
        await supabase.from('scopes').insert([
          { company_name: scope.name, address: scope.address, website: scope.website, email: scope.email, whatsapp: scope.whatsapp, raw_data: scope }
        ]);
      }
    }

    // Return array of results
    res.status(200).json(finalScopes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar escopo" });
  }
}
