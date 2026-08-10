import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { key, value } = body;
      
      await sql`
        CREATE TABLE IF NOT EXISTS app_storage (
          key VARCHAR(255) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await sql`
        INSERT INTO app_storage (key, value, updated_at)
        VALUES (${key || 'journal'}, ${JSON.stringify(value)}, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
      `;

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const { key } = req.query;
      
      await sql`
        CREATE TABLE IF NOT EXISTS app_storage (
          key VARCHAR(255) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const result = await sql`SELECT value FROM app_storage WHERE key = ${key || 'journal'};`;
      if (result.rows.length > 0) {
        return res.status(200).json({ success: true, value: JSON.parse(result.rows[0].value) });
      }
      return res.status(404).json({ error: 'Not found' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
