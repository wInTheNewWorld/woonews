#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

const SUPABASE_URL = 'https://wolktxrncwskkimgouwc.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const sqlite = new Database(path.join(__dirname, '../db/woonews.db'));

async function req(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
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
  // 测试连接
  const test = await req('GET', '/rest/v1/topics?limit=1');
  if (test?.code) {
    console.log('表不存在，请先在 Supabase SQL Editor 建表');
    console.log('错误:', test.message);
    process.exit(1);
  }
  console.log('✅ 连接正常，开始迁移...');

  // 清空旧数据
  await req('DELETE', '/rest/v1/persona_comments?id=gt.0');
  await req('DELETE', '/rest/v1/topics?id=gt.0');

  // 迁移 topics
  const topics = sqlite.prepare('SELECT * FROM topics').all();
  const topicIdMap = {};

  for (const t of topics) {
    const res = await req('POST', '/rest/v1/topics', {
      date: t.date, title_es: t.title_es, title_zh: t.title_zh,
      explanation: t.explanation, heat: t.heat, mood: t.mood,
      marketing: t.marketing, business_impact: t.business_impact,
      cultural_context: t.cultural_context, sources: t.sources,
      links: t.links, personas_triggered: t.personas_triggered,
      personas_done: t.personas_done
    });
    if (Array.isArray(res) && res[0]?.id) topicIdMap[t.id] = res[0].id;
    else console.log('topic 插入失败:', res);
  }
  console.log(`✅ 迁移 ${topics.length} 条 topics`);

  // 迁移 persona_comments
  const comments = sqlite.prepare('SELECT * FROM persona_comments').all();
  for (const c of comments) {
    await req('POST', '/rest/v1/persona_comments', {
      topic_id: topicIdMap[c.topic_id],
      date: c.date, persona: c.persona,
      content: c.content, reply_to: c.reply_to || null
    });
  }
  console.log(`✅ 迁移 ${comments.length} 条 comments`);
  console.log('🎉 迁移完成！');
}
run().catch(e => { console.error('❌', e.message); process.exit(1); });
