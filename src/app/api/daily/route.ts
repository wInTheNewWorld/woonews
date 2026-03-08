import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let date = searchParams.get('date');

  if (!date) {
    // 取最新有数据的日期
    const { data } = await supabase
      .from('topics')
      .select('date')
      .order('date', { ascending: false })
      .limit(1);
    if (!data?.length) return NextResponse.json({ error: 'no data' }, { status: 404 });
    date = data[0].date;
  }

  const { data: topics, error } = await supabase
    .from('topics')
    .select('*')
    .eq('date', date)
    .order('heat', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: comments } = await supabase
    .from('persona_comments')
    .select('*')
    .eq('date', date);

  const topicsWithComments = (topics || []).map(t => ({
    ...t,
    links: (() => { try { return JSON.parse(t.links || '[]'); } catch { return []; } })(),
    persona_comments: (comments || []).filter(c => c.topic_id === t.id)
  }));

  return NextResponse.json({ date, topics: topicsWithComments });
}
