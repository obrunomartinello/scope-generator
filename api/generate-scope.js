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
  
  try {
    const googleApiKey = process.env.VITE_GOOGLE_PLACES_API_KEY;
    let businessesToScan = [];

    if (googleApiKey) {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' in ' + location)}&key=${googleApiKey}`;
      const searchRes = await axios.get(searchUrl);
      const places = searchRes.data.results.slice(0, 10);
      
      for (const place of places) {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=website,formatted_phone_number,current_opening_hours,price_level,photos&key=${googleApiKey}`;
        const detailsRes = await axios.get(detailsUrl);
        const details = detailsRes.data.result || {};

        businessesToScan.push({
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address || location,
          rating: place.rating || 0,
          reviews: place.user_ratings_total || 0,
          phone: details.formatted_phone_number || null,
          website: details.website || null,
          priceLevel: details.price_level || null,
          openNow: details.current_opening_hours ? details.current_opening_hours.open_now : null,
          photoCount: details.photos ? details.photos.length : 0,
        });
      }
    } else {
      businessesToScan = [
        { name: `${query} Experts`, address: location, rating: 4.8, reviews: 112, phone: '+1 (305) 555-0101', website: `https://www.${query.replace(/\s+/g, '').toLowerCase()}experts.com` },
        { name: `Affordable ${query}`, address: location, rating: 3.5, reviews: 14, phone: null, website: null },
        { name: `Elite ${query} Services`, address: location, rating: 4.2, reviews: 45, phone: '+1 (305) 555-0103', website: `https://elite${query.replace(/\s+/g, '').toLowerCase()}.wixsite.com/home` }
      ];
    }

    const finalScopes = [];
    
    for (const b of businessesToScan) {
      let websiteData = { email: null, whatsapp: null, phone: null, techStack: null };
      
      if (b.website) {
        websiteData = await scanWebsite(b.website);
      }

      let hotScore = 0;
      if (!b.website) hotScore += 50;
      if (!websiteData.whatsapp) hotScore += 30;
      if (b.rating < 4.0 || b.reviews < 5) hotScore += 20;
      if (websiteData.techStack === 'Wix') hotScore += 15;

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
        priceLevel: b.priceLevel,
        openNow: b.openNow,
        photoCount: b.photoCount,
        hotScore: hotScore,
        links: { yelp: null, facebook: null, thumbtack: null }
      };
      
      finalScopes.push(scope);
      
      if (supabase) {
        await supabase.from('scopes').insert([
          { company_name: scope.name, address: scope.address, website: scope.website, email: scope.email, whatsapp: scope.whatsapp, raw_data: scope }
        ]);
      }
    }

    finalScopes.sort((a, b) => b.hotScore - a.hotScore);

    res.status(200).json(finalScopes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar escopo" });
  }
}
