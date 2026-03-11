#!/usr/bin/env node
/**
 * simulate-personas.js
 * 逻辑：以人物为单位，一次性看完今天所有话题，自主决定对哪几条有反应
 */

const Database = require('better-sqlite3');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, '../db/woonews.db'));
const TODAY = new Date(Date.now() + 8*3600*1000).toISOString().split('T')[0];
const CLAUDE = '/Users/aiwoody/.nvm/versions/node/v22.19.0/bin/claude';

const PERSONAS = {
  carlos:    { name: 'Carlos Mendoza',           soulFile: 'carlos-mendoza.md' },
  maria:     { name: 'María González',           soulFile: 'maria-gonzalez.md' },
  tincho:    { name: 'Martín "Tincho" Alderete', soulFile: 'martin-alderete.md' },
  facundo:   { name: 'Facundo Ramos',            soulFile: 'facundo-ramos.md' },
  valentina: { name: 'Valentina Torres',         soulFile: 'valentina-torres.md' },
  hector:    { name: 'Héctor Villanueva',        soulFile: 'hector-villanueva.md' },
  lucia:     { name: 'Lucía Kim',                soulFile: 'lucia-kim.md' },
  rodrigo:   { name: 'Rodrigo Benítez',          soulFile: 'rodrigo-benitez.md' },
};

function loadSoul(filename) {
  try {
    return fs.readFileSync(path.join(__dirname, '../souls', filename), 'utf8');
  } catch { return null; }
}

function callClaude(prompt) {
  const tmpFile = `/tmp/persona_${Date.now()}.txt`;
  fs.writeFileSync(tmpFile, prompt, 'utf8');
  try {
    const result = execSync(
      `${CLAUDE} -p "$(cat ${tmpFile})" --output-format text 2>/dev/null`,
      { encoding: 'utf8', timeout: 120000, maxBuffer: 1024 * 1024 * 10 }
    );
    return result.trim();
  } catch (e) {
    return null;
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

/**
 * 让一个人物看完今天所有话题，自主决定评论哪几条
 * 返回: [{ topicIndex, zh, en }, ...]
 */
function generatePersonaComments(personaKey, soul, topics) {
  const topicList = topics.map((t, i) =>
    `[${i + 1}] ${t.title_zh || t.title_es}\n    ${t.explanation}`
  ).join('\n\n');

  const prompt = `
以下是你的人物档案：

${soul}

---

今天布宜诺斯艾利斯广场上有这几条新闻：

${topicList}

---

请以真实的人的方式做出反应：

1. 从上面的新闻里，选出你**真正有感觉**的1到3条。如果某条和你的生活、关心的事完全无关，就跳过它，不要硬挤评论。
2. 对你选中的每条，写一段真实的发言。要求：
   - 从新闻本身触发你的情绪，而不是表演你的身份标签
   - 用一个你生活中的具体细节来回应，但每条评论只用一个不同的细节
   - 语言自然，像在广场上随口说的，不是写文章
   - 100-150字中文，可夹杂西语词汇
3. 不同条目之间不要重复使用同样的个人经历或口头禅

输出格式（严格按此格式，每条一个块）：
TOPIC|||话题编号（数字）
COMMENT_ZH|||中文评论
COMMENT_EN|||English comment (natural, preserves voice, 80-120 words)
---
（如有多条，重复上述块，用---分隔）

如果今天没有任何话题触动你，输出：SKIP
`;

  const raw = callClaude(prompt);
  if (!raw || raw.includes('SKIP')) return [];

  const blocks = raw.split(/\n?---\n?/).filter(b => b.includes('TOPIC|||'));
  const results = [];

  for (const block of blocks) {
    const topicMatch = block.match(/TOPIC\|\|\|(\d+)/);
    const zhMatch = block.match(/COMMENT_ZH\|\|\|([\s\S]*?)(?=COMMENT_EN\|\|\||$)/);
    const enMatch = block.match(/COMMENT_EN\|\|\|([\s\S]*?)$/);

    if (topicMatch && zhMatch) {
      const idx = parseInt(topicMatch[1]) - 1;
      if (idx >= 0 && idx < topics.length) {
        results.push({
          topicIndex: idx,
          zh: zhMatch[1].trim(),
          en: enMatch ? enMatch[1].trim() : null,
        });
      }
    }
  }

  return results;
}

async function main() {
  const topics = db.prepare(
    `SELECT * FROM topics WHERE date = ? ORDER BY rowid`
  ).all(TODAY);

  if (!topics.length) {
    console.log('❌ 今天没有话题数据');
    process.exit(0);
  }

  console.log(`📋 今日话题：${topics.length} 条`);
  console.log(`👥 开始广场模拟...\n`);

  // 清空今天已有的评论（重新生成）
  db.prepare(`DELETE FROM persona_comments WHERE date = ?`).run(TODAY);

  // 以人物为单位，逐个生成
  for (const [personaKey, persona] of Object.entries(PERSONAS)) {
    const soul = loadSoul(persona.soulFile);
    if (!soul) {
      console.log(`⚠️  找不到灵魂文件：${persona.soulFile}`);
      continue;
    }

    console.log(`🎭 ${persona.name} 走进广场...`);
    const comments = generatePersonaComments(personaKey, soul, topics);

    if (!comments.length) {
      console.log(`   → 今天没有感兴趣的话题，沉默\n`);
      continue;
    }

    for (const c of comments) {
      const topic = topics[c.topicIndex];
      db.prepare(
        `INSERT INTO persona_comments (topic_id, date, persona, content, content_en, reply_to)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(topic.id, TODAY, personaKey, c.zh, c.en || null, null);
      console.log(`   ✅ [话题${c.topicIndex + 1}] ${c.zh.slice(0, 50)}...`);
    }
    console.log();
  }

  // 更新 topics 的 personas_done 标记
  db.prepare(`UPDATE topics SET personas_done = 1 WHERE date = ?`).run(TODAY);

  // 统计
  const total = db.prepare(
    `SELECT count(*) as n FROM persona_comments WHERE date = ?`
  ).get(TODAY);
  console.log(`✅ 广场模拟完成，共 ${total.n} 条发言`);
}

main().catch(e => { console.error(e); process.exit(1); });
