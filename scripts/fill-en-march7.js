const Database = require('better-sqlite3');
const { execSync } = require('child_process');
const fs = require('fs');

const db = new Database('/Users/aiwoody/Documents/Projects/woonews/db/woonews.db');
const CLAUDE = '/Users/aiwoody/.nvm/versions/node/v22.19.0/bin/claude';

function callClaude(prompt) {
  const tmp = `/tmp/fill_en_${Date.now()}.txt`;
  fs.writeFileSync(tmp, prompt);
  try {
    return execSync(`${CLAUDE} -p "$(cat ${tmp})" --output-format text 2>/dev/null`, 
      { encoding: 'utf8', timeout: 60000 }).trim();
  } catch { return null; }
  finally { fs.unlinkSync(tmp); }
}

const topics = db.prepare("SELECT * FROM topics WHERE date='2026-03-07' AND (title_en IS NULL OR title_en='')").all();
console.log(`补全 ${topics.length} 条英文字段...`);

for (const t of topics) {
  const prompt = `Translate the following Argentine news topic to English. Return ONLY in this exact format:
TITLE_EN|||English title (concise, 5-10 words)
EXPLANATION_EN|||English explanation (2-3 sentences, same content as Chinese)
CULTURAL_EN|||English cultural context (1-2 sentences)

Chinese title: ${t.title_zh}
Chinese explanation: ${t.explanation}
Cultural context: ${t.cultural_context || ''}`;

  const raw = callClaude(prompt);
  if (!raw) { console.log('❌ 失败:', t.title_zh); continue; }

  const title_en = raw.match(/TITLE_EN\|\|\|(.*)/)?.[1]?.trim();
  const explanation_en = raw.match(/EXPLANATION_EN\|\|\|([\s\S]*?)(?=CULTURAL_EN\|\|\||$)/)?.[1]?.trim();
  const cultural_en = raw.match(/CULTURAL_EN\|\|\|([\s\S]*?)$/)?.[1]?.trim();

  db.prepare("UPDATE topics SET title_en=?, explanation_en=?, cultural_context_en=? WHERE id=?")
    .run(title_en, explanation_en, cultural_en, t.id);
  console.log('✅', title_en);
}

// 补全评论英文
const comments = db.prepare("SELECT * FROM persona_comments WHERE date='2026-03-07' AND (content_en IS NULL OR content_en='')").all();
console.log(`\n补全 ${comments.length} 条评论英文...`);
for (const c of comments) {
  const prompt = `Translate this Argentine character's comment to natural English, preserving their voice and emotion (80-100 words):

${c.content}`;
  const en = callClaude(prompt);
  if (en) {
    db.prepare("UPDATE persona_comments SET content_en=? WHERE id=?").run(en.trim(), c.id);
    process.stdout.write('.');
  }
}
console.log('\n✅ 完成');
