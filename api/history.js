import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pgdydpboryoptefsqxsp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!supabase) return res.status(200).json([]);
  
  try {
    const { data, error } = await supabase
      .from('scopes')
      .select('raw_data, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (error) return res.status(200).json([]);
    res.status(200).json(data.map(d => ({ ...d.raw_data, time: new Date(d.created_at).toLocaleTimeString() })));
  } catch (err) {
    res.status(200).json([]);
  }
}
