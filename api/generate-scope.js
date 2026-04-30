import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pgdydpboryoptefsqxsp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
  
  // SEO Expansion Engine - Retorna array de palavras-chave para busca paralela
  const expandQuery = (q) => {
    const lowerQ = q.toLowerCase();
    if (lowerQ.includes('jardina') || lowerQ.includes('grama') || lowerQ.includes('paisagis')) {
      return ['landscaping', 'lawn care', 'garden service', 'grass cutting', 'yard maintenance', 'tree service'];
    }
    if (lowerQ.includes('limpez') || lowerQ.includes('faxina')) {
      return ['house cleaning', 'maid service', 'residential cleaning', 'deep cleaning service', 'move out cleaning'];
    }
    if (lowerQ.includes('constru') || lowerQ.includes('reforma')) {
      return ['construction company', 'remodeling contractor', 'roofing contractor', 'home builder', 'general contractor'];
    }
    if (lowerQ.includes('pintur')) {
      return ['painting contractor', 'house painter', 'commercial painter'];
    }
    if (lowerQ.includes('piscina')) {
      return ['pool cleaning', 'pool service', 'pool maintenance'];
    }
    if (lowerQ.includes('encanador') || lowerQ.includes('encanamento')) {
      return ['plumber', 'plumbing service'];
    }
    if (lowerQ.includes('eletricista') || lowerQ.includes('eletrica')) {
      return ['electrician', 'electrical contractor'];
    }
    return [q]; // fallback single query
  };

  const queryList = expandQuery(query);
  
  try {
    const googleApiKey = process.env.VITE_GOOGLE_PLACES_API_KEY;
    let businessesToScan = [];

    if (googleApiKey) {
      // 1. Busca Paralela de todos os termos
      const searchPromises = queryList.map(q => {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q + ' in ' + location)}&key=${googleApiKey}`;
        return axios.get(searchUrl).catch(() => ({ data: { results: [] } }));
      });
      
      const responses = await Promise.all(searchPromises);
      
      let allPlaces = [];
      responses.forEach(r => {
        if (r.data && r.data.results) {
          allPlaces = allPlaces.concat(r.data.results);
        }
      });
      
      // 2. Remove duplicatas pelo place_id
      const uniquePlacesMap = new Map();
      allPlaces.forEach(p => {
        if (!uniquePlacesMap.has(p.place_id)) {
          uniquePlacesMap.set(p.place_id, p);
        }
      });
      
      // Limita a 40 para não estourar timeout do Vercel
      const places = Array.from(uniquePlacesMap.values()).slice(0, 40);
      
      // 3. Busca de Detalhes em Paralelo
      const detailsPromises = places.map(async (place) => {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=website,formatted_phone_number,current_opening_hours,price_level,photos&key=${googleApiKey}`;
        const detailsRes = await axios.get(detailsUrl).catch(() => ({ data: { result: {} } }));
        const details = detailsRes.data.result || {};

        return {
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
        };
      });

      businessesToScan = await Promise.all(detailsPromises);
    } else {
      businessesToScan = [
        { name: `${query} Experts`, address: location, rating: 4.8, reviews: 112, phone: '+1 (305) 555-0101', website: `https://www.${query.replace(/\s+/g, '').toLowerCase()}experts.com` }
      ];
    }

    // 4. Escaneamento de Sites em Paralelo
    const scanPromises = businessesToScan.map(async (b) => {
      let websiteData = { email: null, whatsapp: null, phone: null, techStack: null };
      
      if (b.website) {
        websiteData = await scanWebsite(b.website);
      }

      let hotScore = 0;
      if (!b.website) hotScore += 50;
      if (!websiteData.whatsapp) hotScore += 30;
      if (b.rating < 4.0 || b.reviews < 5) hotScore += 20;
      if (websiteData.techStack === 'Wix') hotScore += 15;

      return {
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
    });

    const finalScopes = await Promise.all(scanPromises);
    finalScopes.sort((a, b) => b.hotScore - a.hotScore);

    // Save to Supabase History
    if (supabase && finalScopes.length > 0) {
      try {
        await supabase.from('scopes').insert([{
          raw_data: { query, location, results: finalScopes, type: 'batch_search' }
        }]);
      } catch (e) {
        console.error("Failed to save history to Supabase:", e);
      }
    }

    res.status(200).json(finalScopes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar escopo" });
  }
}
