import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pgdydpboryoptefsqxsp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });

  // GET — Fetch all sent leads
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('scopes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter only sent_lead type entries
      const sentLeads = (data || [])
        .filter(row => row.raw_data && row.raw_data.type === 'sent_lead')
        .map(row => ({
          id: row.id,
          lead: row.raw_data.lead,
          observation: row.raw_data.observation || '',
          sentAt: row.created_at,
        }));

      return res.status(200).json(sentLeads);
    } catch (e) {
      console.error('Failed to fetch sent leads:', e);
      return res.status(500).json({ error: 'Failed to fetch' });
    }
  }

  // POST — Save a new sent lead
  if (req.method === 'POST') {
    const { lead, observation } = req.body;
    try {
      const { error } = await supabase.from('scopes').insert([{
        raw_data: { type: 'sent_lead', lead, observation: observation || '' }
      }]);

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error('Failed to save sent lead:', e);
      return res.status(500).json({ error: 'Failed to save' });
    }
  }

  // PUT — Update observation
  if (req.method === 'PUT') {
    const { id, observation } = req.body;
    try {
      // Fetch current row first
      const { data: existing } = await supabase.from('scopes').select('raw_data').eq('id', id).single();
      if (existing) {
        const updatedRawData = { ...existing.raw_data, observation };
        const { error } = await supabase.from('scopes').update({ raw_data: updatedRawData }).eq('id', id);
        if (error) throw error;
      }
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error('Failed to update observation:', e);
      return res.status(500).json({ error: 'Failed to update' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
