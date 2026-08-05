import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Support both POST (saving data) and GET (retrieving data) for full app sync
  if (req.method === 'POST') {
    try {
      // Handle payload whether sent as JSON body or parsed string
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { key, value } = body;
      
      if (!key) {
        return res.status(400).json({ error: 'Missing key parameter (x_x)' });
      }

      const stringValue = JSON.stringify(value);

      await sql`
        CREATE TABLE IF NOT EXISTS app_storage (
          key VARCHAR(255) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await sql`
        INSERT INTO app_storage (key, value, updated_at)
        VALUES (${key}, ${stringValue}, CURRENT_TIMESTAMP)
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
      `;

      return res.status(200).json({ success: true, message: 'Saved to cloud (^_^)' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save to database (>_<)' });
    }
  } 
  
  if (req.method === 'GET') {
    try {
      const { key } = req.query;
      if (!key) {
        return res.status(400).json({ error: 'Missing key query parameter (x_x)' });
      }

      await sql`
        CREATE TABLE IF NOT EXISTS app_storage (
          key VARCHAR(255) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const result = await sql`SELECT value FROM app_storage WHERE key = ${key};`;

      if (result.rows.length > 0) {
        return res.status(200).json({ success: true, value: JSON.parse(result.rows[0].value) });
      } else {
        return res.status(404).json({ error: 'Key not found (o_o)' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve from database (>_<)' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed (x_x)' });
}
