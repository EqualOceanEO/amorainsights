$env:PGPASSWORD = "nERCb24AMq2VAMZ4"

$query = "SELECT id, name, slug FROM companies WHERE slug = 'catl' ORDER BY id;"

psql postgresql://postgres:nERCb24AMq2VAMZ4@db.jqppcuccqkxhhrvndsil.supabase.co:5432/postgres -c $query
