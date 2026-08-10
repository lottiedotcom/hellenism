import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM petitions ORDER BY created_at DESC;`;
      return res.status(200).json(rows);
    } 
    
    if (req.method === 'POST') {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Text required' });
      const { rows } = await sql`INSERT INTO petitions (text) VALUES (${text}) RETURNING *;`;
      return res.status(201).json(rows[0]);
    } 
    
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID required' });
      
      // If it's a temporary local frontend fallback ID (like a timestamp string), just return success so it doesn't crash Postgres
      if (isNaN(id) || id.includes('T') || id.includes('-')) {
        return res.status(200).json({ success: true, note: 'Local fallback deleted' });
      }

      await sql`DELETE FROM petitions WHERE id = ${id};`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
