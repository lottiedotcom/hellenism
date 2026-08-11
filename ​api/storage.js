import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // 1. Create the database table if it doesn't exist yet
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS hellenic_data (
        key VARCHAR(255) PRIMARY KEY, 
        value JSONB
      );
    `;
  } catch (error) {
    console.error("Table creation error:", error);
    return res.status(500).json({ error: "Failed to initialize database table." });
  }

  // 2. Handle POST requests (Saving data to the cloud)
  if (req.method === 'POST') {
    const { key, value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: "Missing key or value" });
    }

    try {
      // This inserts the data, or updates it if that key already exists
      await sql`
        INSERT INTO hellenic_data (key, value)
        VALUES (${key}, ${JSON.stringify(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 3. Handle GET requests (Loading data from the cloud)
  if (req.method === 'GET') {
    const { key } = req.query;
    
    if (!key) {
      return res.status(400).json({ error: "Missing key parameter" });
    }

    try {
      const { rows } = await sql`SELECT value FROM hellenic_data WHERE key = ${key};`;
      if (rows.length > 0) {
        return res.status(200).json({ value: rows[0].value });
      } else {
        return res.status(404).json({ error: "No data found for this key" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // If the request isn't GET or POST
  res.status(405).json({ error: "Method not allowed" });
}
