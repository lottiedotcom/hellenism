import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // 1. Automatically create the text database table if it doesn't exist yet
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS hellenic_data (
        key VARCHAR(255) PRIMARY KEY, 
        value JSONB
      );
    `;
  } catch (error) {
    return res.status(500).json({ error: "TABLE_CREATION_FAILED", details: error.message });
  }

  // 2. Handle saving text data to the cloud (POST)
  if (req.method === 'POST') {
    const { key, value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: "MISSING_DATA", details: "Key or value is missing" });
    }

    try {
      await sql`
        INSERT INTO hellenic_data (key, value)
        VALUES (${key}, ${JSON.stringify(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "INSERT_FAILED", details: error.message });
    }
  }

  // 3. Handle loading text data from the cloud (GET)
  if (req.method === 'GET') {
    const { key } = req.query;
    
    if (!key) {
      return res.status(400).json({ error: "MISSING_KEY", details: "No key provided" });
    }

    try {
      const { rows } = await sql`SELECT value FROM hellenic_data WHERE key = ${key};`;
      if (rows.length > 0) {
        return res.status(200).json({ value: rows[0].value });
      } else {
        return res.status(404).json({ error: "NOT_FOUND", details: "No data found for this key" });
      }
    } catch (error) {
      return res.status(500).json({ error: "SELECT_FAILED", details: error.message });
    }
  }

  return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
}

