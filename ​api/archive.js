import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { deity, records } = body;
      
      if (!deity) {
         return res.status(400).json({ error: 'Missing deity name (x_x)' });
      }

      await sql`
        CREATE TABLE IF NOT EXISTS deity_archives (
          deity VARCHAR(255) PRIMARY KEY,
          records TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await sql`
        INSERT INTO deity_archives (deity, records, updated_at)
        VALUES (${deity}, ${JSON.stringify(records)}, CURRENT_TIMESTAMP)
        ON CONFLICT (deity) DO UPDATE SET records = EXCLUDED.records, updated_at = CURRENT_TIMESTAMP;
      `;

      return res.status(200).json({ success: true, message: 'Archive saved securely (^_^)' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const { deity } = req.query;

      await sql`
        CREATE TABLE IF NOT EXISTS deity_archives (
          deity VARCHAR(255) PRIMARY KEY,
          records TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      if (deity) {
          const result = await sql`SELECT records FROM deity_archives WHERE deity = ${deity};`;
          if (result.rows.length > 0) {
            return res.status(200).json({ success: true, records: JSON.parse(result.rows[0].records) });
          }
          return res.status(200).json({ success: true, records: [] });
      } else {
          return res.status(400).json({ error: 'Please specify a deity to retrieve (o_o)' });
      }
      
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
