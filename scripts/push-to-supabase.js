#!/usr/bin/env node
// 把当天 SQLite 数据推送到 Supabase（每日 cron 调用）
const Database = require('better-sqlite3');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wolktxrncwskkimgouwc.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const db = new Database(path.join(__dirname, '../db/woonews.db'));

const TODAY = new Date().toISOString().slice(0, 10);

async function req(method, endpoint, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method,
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function run() {
  const date = process.argv[2] || TODAY;
  console.log(`📤 推送 ${date} 数据到 Supabase...`);

  // 删除当天旧数据
  const existing = await req('GET', `topics?date=eq.${date}&select=id`);
  if (Array.isArray(existing) && existing.length > 0) {
    for (const t of existing) {
      await req('DELETE', `persona_comments?topic_id=eq.${t.id}`);
    }
    // 逐条删除避免批量删除失败
    for (const t of existing) {
      await req('DELETE', `topics?id=eq.${t.id}`);
    }
    console.log(`🗑️  清除旧数据 ${existing.length} 条`);
  }

  const topics = db.prepare('SELECT * FROM topics WHERE date = ?').all(date);
  const topicIdMap = {};

  for (const t of topics) {
    const res = await req('POST', 'topics', {
      date: t.date, title_es: t.title_es, title_zh: t.title_zh,
      title_en: t.title_en,
      explanation: t.explanation, explanation_en: t.explanation_en,
      heat: t.heat, mood: t.mood,
      marketing: t.marketing, business_impact: t.business_impact,
      cultural_context: t.cultural_context,
      cultural_context_en: t.cultural_context_en,
      sources: t.sources, links: t.links,
      personas_triggered: t.personas_triggered,
      personas_done: t.personas_done
    });
    if (Array.isArray(res) && res[0]?.id) topicIdMap[t.id] = res[0].id;
  }
  console.log(`✅ topics: ${topics.length} 条`);

  const comments = db.prepare('SELECT * FROM persona_comments WHERE date = ?').all(date);
  for (const c of comments) {
    await req('POST', 'persona_comments', {
      topic_id: topicIdMap[c.topic_id],
      date: c.date, persona: c.persona,
      content: c.content, content_en: c.content_en || null,
      reply_to: c.reply_to || null
    });
  }
  console.log(`✅ comments: ${comments.length} 条`);
  console.log('🎉 推送完成！');
}
run().catch(e => { console.error('❌', e.message); process.exit(1); });
