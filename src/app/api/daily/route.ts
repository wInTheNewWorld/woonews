import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let date = searchParams.get('date');
  const lang = searchParams.get('lang') || 'zh';

  if (!date) {
    const { data } = await supabase
      .from('topics').select('date')
      .order('date', { ascending: false }).limit(1);
    if (!data?.length) return NextResponse.json({ error: 'no data' }, { status: 404 });
    date = data[0].date;
  }

  const { data: topics, error } = await supabase
    .from('topics').select('*').eq('date', date)
    .order('heat', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: comments } = await supabase
    .from('persona_comments').select('*').eq('date', date);

  const topicsOut = (topics || []).map(t => ({
    ...t,
    // 根据语言返回对应字段
    title:       lang === 'en' ? (t.title_en || t.title_zh)  : t.title_zh,
    explanation: lang === 'en' ? (t.explanation_en || t.explanation) : t.explanation,
    cultural_context: lang === 'en' ? (t.cultural_context_en || t.cultural_context) : t.cultural_context,
    links: (() => { try { return JSON.parse(t.links || '[]'); } catch { return []; } })(),
    persona_comments: (comments || [])
      .filter(c => c.topic_id === t.id)
      .map(c => ({
        ...c,
        content: lang === 'en' ? (c.content_en || c.content) : c.content,
      }))
  }));

  return NextResponse.json({ date, lang, topics: topicsOut }, { headers: { "Cache-Control": "no-store" } });
}
