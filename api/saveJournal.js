import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed (x_x)' });
  }

  try {
    const { entry } = JSON.parse(req.body);
    
    await sql`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        entry TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`INSERT INTO journal_entries (entry) VALUES (${entry});`;

    return res.status(200).json({ success: true, message: 'Saved to cloud (^_^)' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save (>_<)' });
  }
}
