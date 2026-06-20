console.log('step 1');
async function sql(label, query) {
  console.log('running: ' + label);
}
await sql('test', 'SELECT 1;');
console.log('done');
