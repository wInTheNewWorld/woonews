import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data } = await supabase
    .from('topics')
    .select('date')
    .order('date', { ascending: false });

  const dates = [...new Set((data || []).map(r => r.date))];
  return NextResponse.json({ dates });
}
