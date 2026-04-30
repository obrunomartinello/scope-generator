import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pgdydpboryoptefsqxsp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
        let cleanUrl = url;
        if (url.includes('uddg=')) {
          cleanUrl = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
        }
        results.push(cleanUrl);
      }
    });
    return results;
  } catch (error) {
    return [];
  }
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
  const searchQuery = `${query} ${location || ''}`.trim();

  try {
    const links = await searchWeb(searchQuery);
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

    let websiteData = {};
    if (mainWebsite) websiteData = await scanWebsite(mainWebsite);

    const scope = {
      id: Date.now(),
      name: query,
      address: location || 'Desconhecido',
      rating: 4.0,
      reviews: 'N/A',
      phone: websiteData.phone || null,
      email: websiteData.email || null,
      whatsapp: websiteData.whatsapp || null,
      website: mainWebsite ? mainWebsite.replace(/^https?:\/\//, '') : null,
      techStack: websiteData.techStack || null,
      links: socialLinks
    };

    if (supabase) {
      await supabase.from('scopes').insert([
        { company_name: scope.name, address: scope.address, website: scope.website, email: scope.email, whatsapp: scope.whatsapp, raw_data: scope }
      ]);
    }

    res.status(200).json(scope);
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar escopo" });
  }
}
