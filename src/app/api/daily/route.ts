import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let date = searchParams.get('date');
  const db = new Database('/Users/aiwoody/Documents/Projects/woonews/db/woonews.db');

  try {
    if (!date) {
      const latest = db.prepare('SELECT date FROM topics ORDER BY date DESC LIMIT 1').get() as any;
      date = latest?.date || new Date().toISOString().split('T')[0];
    }

    const topics = db.prepare('SELECT * FROM topics WHERE date = ? ORDER BY heat DESC').all(date);
    const comments = db.prepare('SELECT * FROM persona_comments WHERE date = ? ORDER BY created_at ASC').all(date);

    const commentsByTopic: Record<string, any[]> = {};
    for (const c of comments as any[]) {
      if (!commentsByTopic[c.topic_id]) commentsByTopic[c.topic_id] = [];
      commentsByTopic[c.topic_id].push(c);
    }

    return NextResponse.json({
      date,
      topics: (topics as any[]).map(t => ({
        ...t,
        sources: JSON.parse(t.sources || '[]'),
        links: JSON.parse(t.links || '[]'),
        persona_comments: commentsByTopic[t.id] || []
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    db.close();
  }
}
