const { Client } = require('pg');

const client = new Client({
  host: 'db.wvjyvjlmelvrtgqnyuig.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'h6FgQr1iK0T@aw)KEYuGhp0j2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const query = `
-- Create the Folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the Snippets table
CREATE TABLE IF NOT EXISTS snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  "folderId" UUID REFERENCES folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
`;

client.connect()
  .then(() => client.query(query))
  .then(() => console.log('Database initialized successfully'))
  .catch(e => console.error('Error initializing database:', e))
  .finally(() => client.end());
