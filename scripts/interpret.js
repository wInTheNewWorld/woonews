#!/usr/bin/env node
const Database = require('better-sqlite3');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, '../db/woonews.db'));
const TODAY = new Date().toISOString().slice(0, 10);
const CLAUDE = '/Users/aiwoody/.nvm/versions/node/v22.19.0/bin/claude';

function callClaude(prompt) {
  const tmp = `/tmp/interpret_${Date.now()}.txt`;
  fs.writeFileSync(tmp, prompt, 'utf8');
  try {
    const out = execSync(
      `${CLAUDE} -p "$(cat ${tmp})" --dangerously-skip-permissions 2>/dev/null`,
      { timeout: 120000, maxBuffer: 4 * 1024 * 1024 }
    ).toString().trim();
    fs.unlinkSync(tmp);
    return out;
  } catch(e) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    return null;
  }
}

function parseDelimited(text, fields) {
  const result = {};
  for (const field of fields) {
    const match = text.match(new RegExp(`${field}:::([\\s\\S]*?)(?=\\n[A-Z_]+:::|$)`));
    result[field] = match ? match[1].trim() : '';
  }
  return result;
}

async function main() {
  const topics = db.prepare(`SELECT * FROM topics WHERE date = ? AND (title_zh IS NULL OR title_zh = '')`).all(TODAY);
  console.log(`📋 待解读话题：${topics.length} 条`);

  // 过滤不相关话题
  const relevant = [];
  for (const topic of topics) {
    const checkPrompt = `你是阿根廷本地媒体编辑，负责筛选真正值得关注的本地议题。

请判断以下内容是否满足全部条件：
1. 事件/话题发生在阿根廷境内，或直接、显著影响阿根廷本地生活
2. 反映真实的民间议题或社会情绪，而不仅仅是官方声明或政府公告的转发
3. 信源来自阿根廷本地（不是其他国家用户谈论阿根廷）
4. 话题本身不是纯粹的景色/旅游观光内容（没有实质社会意义）

内容：${topic.title_es}

只回答 YES 或 NO，不要解释。`;

    const check = callClaude(checkPrompt);
    if (!check || check.trim().toUpperCase().startsWith('NO')) {
      console.log(`⏭️  过滤：${topic.title_es.slice(0, 60)}`);
      db.prepare('DELETE FROM topics WHERE id = ?').run(topic.id);
      continue;
    }
    relevant.push(topic);
  }

  console.log(`\n✅ 通过筛选：${relevant.length} 条（过滤掉 ${topics.length - relevant.length} 条）\n`);

  for (const topic of relevant) {
    console.log(`\n🔍 解读：${topic.title_es}`);

    const prompt = `你是一位深度了解阿根廷的分析师，同时精通中文和英文。

请对以下阿根廷新闻话题进行解读，同时用中文和英文输出。

话题标题（西班牙语）：${topic.title_es}
相关原始信号：${topic.sources || '无'}

请严格按以下格式输出，每个字段用三个冒号分隔，不要添加任何其他内容：

TITLE_ZH:::15字以内的中文标题，简洁有力
TITLE_EN:::English title, max 10 words, punchy
EXPLANATION_ZH:::一句话中文解读，说清楚发生了什么，60字以内
EXPLANATION_EN:::One sentence English explanation, max 50 words, what happened and why it matters
MOOD:::从以下选一个最贴切的情绪类型：争议 / 民怨 / 担忧 / 讽刺 / 政治对立 / 共情 / 中性
HEAT:::只能是 High、Medium 或 Low 之一
CULTURAL_CONTEXT_ZH:::50-80字，解释这件事在阿根廷文化语境下为什么重要
CULTURAL_CONTEXT_EN:::50-80 words, explain why this matters in Argentine cultural context`;

    const raw = callClaude(prompt);
    if (!raw) { console.log('   ⚠️ Claude 无响应'); continue; }

    const fields = ['TITLE_ZH','TITLE_EN','EXPLANATION_ZH','EXPLANATION_EN','MOOD','HEAT','CULTURAL_CONTEXT_ZH','CULTURAL_CONTEXT_EN'];
    const parsed = parseDelimited(raw, fields);

    db.prepare(`
      UPDATE topics SET
        title_zh = ?,
        title_en = ?,
        explanation = ?,
        explanation_en = ?,
        mood = ?,
        heat = ?,
        cultural_context = ?,
        cultural_context_en = ?
      WHERE id = ?
    `).run(
      parsed.TITLE_ZH, parsed.TITLE_EN,
      parsed.EXPLANATION_ZH, parsed.EXPLANATION_EN,
      parsed.MOOD || 'neutral', parsed.HEAT || 'Medium',
      parsed.CULTURAL_CONTEXT_ZH, parsed.CULTURAL_CONTEXT_EN,
      topic.id
    );

    console.log(`   ✅ ZH: ${parsed.TITLE_ZH}`);
    console.log(`   ✅ EN: ${parsed.TITLE_EN}`);
  }

  console.log('\n✅ 解读完成');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
