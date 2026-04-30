import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pgdydpboryoptefsqxsp.supabase.co';
const supabaseKey = 'sb_publishable_uNfw8KFELwhqqtX-MSUX1A_AqQ7sxBf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDifferentTables() {
  const tables = ['scopes', 'leads', 'searches', 'history', 'prospects'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ ${table}: ${error.message} (${error.code})`);
    } else {
      console.log(`✅ ${table}: EXISTS! Rows:`, data?.length);
    }
  }

  // Try to create via SQL (probably won't work with anon key but worth trying)
  console.log('\n=== Tentando RPC ===');
  const { data, error } = await supabase.rpc('get_tables', {});
  if (error) console.log('RPC falhou:', error.message);
  else console.log('RPC ok:', data);
}

testDifferentTables();
