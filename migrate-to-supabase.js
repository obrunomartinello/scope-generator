// Script de migração: Pega dados do localStorage e envia pro Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pgdydpboryoptefsqxsp.supabase.co';
const supabaseKey = 'sb_publishable_uNfw8KFELwhqqtX-MSUX1A_AqQ7sxBf';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cole aqui os dados do localStorage do seu navegador
// Para pegar: abra o site no PC, F12 > Console, e cole:
//   copy(JSON.stringify({ dismissed: JSON.parse(localStorage.dismissedLeads || '[]'), history: JSON.parse(localStorage.searchHistory || '[]'), scope: JSON.parse(localStorage.currentScope || '[]') }))
// Depois cole o resultado aqui embaixo:

const LOCAL_DATA = PASTE_HERE;

async function migrate() {
  const dismissed = LOCAL_DATA.dismissed || [];
  const history = LOCAL_DATA.history || [];
  const currentScope = LOCAL_DATA.scope || [];

  // Collect all leads from history and current scope
  const allLeads = [];
  history.forEach(h => {
    if (h.results && Array.isArray(h.results)) {
      h.results.forEach(lead => allLeads.push(lead));
    }
  });
  if (Array.isArray(currentScope)) {
    currentScope.forEach(lead => allLeads.push(lead));
  }

  // Find dismissed leads
  const dismissedLeads = allLeads.filter(lead => 
    dismissed.includes(lead.id || lead.name)
  );

  // Deduplicate by id/name
  const unique = new Map();
  dismissedLeads.forEach(lead => {
    const key = lead.id || lead.name;
    if (!unique.has(key)) unique.set(key, lead);
  });

  console.log(`Found ${unique.size} dismissed leads to sync.`);

  // Also save search history
  for (const h of history) {
    if (h.type === 'batch_search' && h.results) {
      console.log(`  Saving search: "${h.query}" em ${h.location} (${h.results.length} leads)`);
      await supabase.from('scopes').insert([{
        raw_data: { type: 'batch_search', query: h.query, location: h.location, results: h.results }
      }]);
    }
  }

  // Save dismissed leads
  for (const [key, lead] of unique) {
    console.log(`  Saving sent lead: ${lead.name}`);
    await supabase.from('scopes').insert([{
      raw_data: { type: 'sent_lead', lead, observation: '' }
    }]);
  }

  console.log('✅ Migration complete!');
}

migrate();
