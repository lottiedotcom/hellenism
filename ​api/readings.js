import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM tarot_readings ORDER BY created_at DESC;`;
      return res.status(200).json(rows);
    } 
    
    if (req.method === 'POST') {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Text required' });
      const { rows } = await sql`INSERT INTO tarot_readings (text) VALUES (${text}) RETURNING *;`;
      return res.status(201).json(rows[0]);
    } 
    
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID required' });
      await sql`DELETE FROM tarot_readings WHERE id = ${id};`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

