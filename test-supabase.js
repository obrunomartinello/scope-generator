import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pgdydpboryoptefsqxsp.supabase.co';
const supabaseKey = 'sb_publishable_uNfw8KFELwhqqtX-MSUX1A_AqQ7sxBf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('=== TESTE 1: Inserir dado ===');
  const { data: insertData, error: insertError } = await supabase
    .from('scopes')
    .insert([{ raw_data: { type: 'test', msg: 'Tabela funcionando!' } }])
    .select();
  
  if (insertError) {
    console.log('❌ INSERT FALHOU:', insertError.message);
  } else {
    console.log('✅ INSERT OK:', insertData);
  }

  console.log('\n=== TESTE 2: Ler dados ===');
  const { data: readData, error: readError } = await supabase
    .from('scopes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (readError) {
    console.log('❌ SELECT FALHOU:', readError.message);
  } else {
    console.log('✅ SELECT OK: Encontrou', readData?.length, 'registros');
    readData?.forEach((row, i) => {
      console.log(`  [${i}] ID: ${row.id} | Tipo: ${row.raw_data?.type} | Created: ${row.created_at}`);
    });
  }

  // Limpar registro de teste
  if (!insertError && insertData?.[0]?.id) {
    await supabase.from('scopes').delete().eq('id', insertData[0].id);
    console.log('\n🧹 Registro de teste removido.');
  }
}

test();
