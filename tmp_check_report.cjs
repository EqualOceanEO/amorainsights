const {createClient} = require('@supabase/supabase-js');
const sb = createClient('https://jqppcuccqkxhhrvndsil.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc');
sb.from('reports').select('id,title,chapters_json,updated_at').eq('id',44).single().then(({data,error})=>{
  if(error){console.log('ERR:',error.message);return;}
  if(!data){console.log('No data');return;}
  const cj = data.chapters_json||{};
  const keys = Object.keys(cj);
  keys.forEach(k=>{
    const v = cj[k]||'';
    console.log(k+': '+(typeof v)+' len='+v.length);
  });
  console.log('updated_at:',data.updated_at);
});
