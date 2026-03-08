const Database = require('better-sqlite3');
const { execSync } = require('child_process');
const fs = require('fs');

const db = new Database('db/woonews.db');
const CLAUDE = '/Users/aiwoody/.nvm/versions/node/v22.19.0/bin/claude';

function callClaude(prompt) {
  const tmp = `/tmp/interpret_${Date.now()}.txt`;
  fs.writeFileSync(tmp, prompt);
  try {
    const out = execSync(`${CLAUDE} --dangerously-skip-permissions -p "$(cat ${tmp})"`,
      { timeout: 30000, encoding: 'utf8' }).trim();
    fs.unlinkSync(tmp);
    return out;
  } catch(e) { try { fs.unlinkSync(tmp); } catch {} throw e; }
}

function interpretOne(topic) {
  const prompt = `你是专注阿根廷市场的出海顾问，深度了解阿根廷历史文化。
目标受众是「计划在阿根廷做出海业务的中国操盘手」。

对以下新闻原文进行解读，严格按格式输出6行，每行用|||分隔字段名和值：

新闻原文：${topic.title_es}

输出格式（每行严格一个字段，不要多余内容）：
title_zh|||中文标题10字以内
explanation|||一句话解释20字以内
mood|||只能是Positive或Neutral或Negative
marketing|||只能是Avoid或Neutral或Opportunity
business_impact|||出海建议25字以内
cultural_context|||为什么这话题在阿根廷有特殊重量，背后文化历史根源，帮中国人理解当地情绪，50-80字`;

  const out = callClaude(prompt);
  const result = { id: topic.id };
  for (const line of out.split('\n')) {
    const idx = line.indexOf('|||');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 3).trim();
      result[key] = val;
    }
  }
  return result;
}

async function main() {
  const latest = db.prepare("SELECT DISTINCT date FROM topics ORDER BY date DESC LIMIT 1").get();
  if (!latest) { console.log('无数据'); return; }

  const topics = db.prepare("SELECT * FROM topics WHERE date=?").all(latest.date);
  console.log(`🧠 解读 ${topics.length} 条话题 (${latest.date})...`);

  const update = db.prepare(`UPDATE topics SET title_zh=?, explanation=?, mood=?, marketing=?, business_impact=?, cultural_context=? WHERE id=?`);

  for (const topic of topics) {
    try {
      const r = interpretOne(topic);
      update.run(
        r.title_zh || topic.title_es.slice(0,15),
        r.explanation || null,
        r.mood || 'Neutral',
        r.marketing || 'Neutral',
        r.business_impact || null,
        r.cultural_context || null,
        topic.id
      );
      console.log(`  ✓ [${r.mood}] ${r.title_zh}`);
      if (r.cultural_context) console.log(`     🏛️ ${r.cultural_context.slice(0,50)}...`);
    } catch(e) {
      console.error(`  ✗ ${e.message}`);
    }
  }
  console.log('\n✅ 完成');
}

main().catch(console.error);
