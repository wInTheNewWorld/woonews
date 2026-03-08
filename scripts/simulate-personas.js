#!/usr/bin/env node
const Database = require('better-sqlite3');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, '../db/woonews.db'));
const TODAY = new Date().toISOString().slice(0, 10);
const CLAUDE = '/Users/aiwoody/.nvm/versions/node/v22.19.0/bin/claude';
const SOULS_DIR = path.join(__dirname, '../souls');

// 加载灵魂文件
function loadSoul(filename) {
  const filepath = path.join(SOULS_DIR, filename);
  return fs.existsSync(filepath) ? fs.readFileSync(filepath, 'utf8') : null;
}

const PERSONAS = {
  carlos: {
    soulFile: 'carlos-mendoza.md',
    name: 'Carlos',
    triggerKeywords: ['政治', '政府', '经济', '比索', '汇率', '选举', '腐败', '通胀', '退休金', '工资'],
  },
  maria: {
    soulFile: 'maria-gonzalez.md',
    name: 'María',
    triggerKeywords: ['医疗', '工会', '预算', '削减', '罢工', '退休金', '公共', '社会', 'Milei', '私有化'],
  },
  facundo: {
    soulFile: 'martin-alderete.md', // Facundo 暂用 Martín 的框架，后续单独写
    name: 'Facundo',
    triggerKeywords: ['自由市场', '改革', '美元', '加密', '科技', '创业', '效率', '通胀', 'libertad', '减税'],
  },
  valentina: {
    soulFile: 'valentina-torres.md',
    name: 'Valentina',
    triggerKeywords: ['文化', '年轻人', '社交媒体', '大学', '女权', '气候', '音乐', '移民', 'UBA', '游行'],
  },
};

function callClaude(prompt) {
  const tmpFile = `/tmp/soul_prompt_${Date.now()}.txt`;
  fs.writeFileSync(tmpFile, prompt, 'utf8');
  try {
    const result = execSync(
      `${CLAUDE} -p "$(cat ${tmpFile})" --dangerously-skip-permissions 2>/dev/null`,
      { timeout: 60000, maxBuffer: 1024 * 1024 }
    ).toString().trim();
    fs.unlinkSync(tmpFile);
    return result;
  } catch (e) {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    return null;
  }
}

function selectPersonas(topic) {
  const text = `${topic.title_zh || ''} ${topic.explanation || ''} ${topic.title_es || ''}`;
  const scores = {};
  for (const [key, persona] of Object.entries(PERSONAS)) {
    scores[key] = persona.triggerKeywords.filter(kw => text.includes(kw)).length;
  }
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => key);
}

async function generateComment(personaKey, topic, soulContent) {
  const persona = PERSONAS[personaKey];
  const prompt = `
以下是你的完整人物灵魂档案，请完全进入这个角色：

${soulContent}

---

现在，针对以下新闻话题，用你的角色身份发表一条评论：

**话题：** ${topic.title_zh || topic.title_es}
**背景：** ${topic.explanation}

要求：
- 完全按照灵魂档案中描述的说话方式
- 必须包含至少一个具体细节（价格/地名/人名/气味）
- 100-150字，西班牙语和中文混合（西语俚语+中文解释）
- 禁止外交辞令，禁止平衡两方
- 只输出评论本身，不要任何解释
`;
  return callClaude(prompt);
}

async function generateReply(replierKey, originalComment, topic, soulContent) {
  const prompt = `
以下是你的完整人物灵魂档案：

${soulContent}

---

针对以下评论，用你的角色身份进行回复：

**原话题：** ${topic.title_zh || topic.title_es}
**原评论：** ${originalComment}

要求：
- 与原评论形成真实的对话张力（可以同意、反驳、或从不同角度切入）
- 必须体现你的角色性格和偏见
- 60-100字，西班牙语和中文混合
- 禁止礼貌性回复，要有摩擦感
- 只输出回复本身，不要任何解释
`;
  return callClaude(prompt);
}

async function main() {
  const topics = db.prepare(`SELECT * FROM topics WHERE date = ? AND personas_done = 0`).all(TODAY);
  console.log(`📋 待处理话题：${topics.length} 条`);

  for (const topic of topics) {
    console.log(`\n🎭 话题：${topic.title_zh}`);

    const selectedPersonas = selectPersonas(topic);
    console.log(`   选中人物：${selectedPersonas.join(', ')}`);

    let replyToId = null;
    let firstComment = null;

    for (let i = 0; i < selectedPersonas.length; i++) {
      const personaKey = selectedPersonas[i];
      const persona = PERSONAS[personaKey];
      const soulContent = loadSoul(persona.soulFile);

      if (!soulContent) {
        console.log(`   ⚠️ 找不到灵魂文件：${persona.soulFile}`);
        continue;
      }

      // 生成主评论
      const comment = await generateComment(personaKey, topic, soulContent);
      if (!comment) continue;

      const insertResult = db.prepare(
        `INSERT INTO persona_comments (topic_id, date, persona, content, reply_to) VALUES (?, ?, ?, ?, ?)`
      ).run(topic.id, TODAY, personaKey, comment, null);

      console.log(`   ✅ ${persona.name}: ${comment.slice(0, 50)}...`);

      if (i === 0) {
        firstComment = { id: insertResult.lastInsertRowid, content: comment };
      }

      // 第二个人物对第一个人物的评论进行回复
      if (i === 1 && firstComment) {
        const replierPersonas = Object.keys(PERSONAS).filter(k => k !== personaKey && k !== selectedPersonas[0]);
        const replierKey = replierPersonas[Math.floor(Math.random() * replierPersonas.length)];
        const replierSoul = loadSoul(PERSONAS[replierKey].soulFile);

        if (replierSoul) {
          const reply = await generateReply(replierKey, firstComment.content, topic, replierSoul);
          if (reply) {
            db.prepare(
              `INSERT INTO persona_comments (topic_id, date, persona, content, reply_to) VALUES (?, ?, ?, ?, ?)`
            ).run(topic.id, TODAY, `${replierKey}_reply`, reply, firstComment.id);
            console.log(`   💬 ${PERSONAS[replierKey].name} 回复: ${reply.slice(0, 50)}...`);
          }
        }
      }
    }

    db.prepare(`UPDATE topics SET personas_done = 1 WHERE id = ?`).run(topic.id);
  }

  console.log('\n✅ 广场模拟完成');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
