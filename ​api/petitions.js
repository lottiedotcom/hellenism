import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { petitions } = body;
      
      await sql`
        CREATE TABLE IF NOT EXISTS app_petitions (
          id SERIAL PRIMARY KEY,
          data TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await sql`
        INSERT INTO app_petitions (id, data, updated_at)
        VALUES (1, ${JSON.stringify(petitions)}, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP;
      `;

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS app_petitions (
          id SERIAL PRIMARY KEY,
          data TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const result = await sql`SELECT data FROM app_petitions WHERE id = 1;`;
      if (result.rows.length > 0) {
        return res.status(200).json({ success: true, petitions: JSON.parse(result.rows[0].data) });
      }
      return res.status(200).json({ success: true, petitions: [] });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
