const Database = require('better-sqlite3');
const { execSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const db = new Database('db/woonews.db');
const CLAUDE = '/Users/aiwoody/.nvm/versions/node/v22.19.0/bin/claude';

const TRIGGER_MAP = {
  middle_class: ['dólar','inflación','precio','impuesto','trabajo','economic','dolar','peso'],
  kirchner:     ['recorte','ajuste','jubilados','salud','educación','milei','reforma','médico','ioma'],
  milei:        ['libertad','déficit','inflación','reforma','milei','mercado','crypto','ajuste'],
  genz:         ['redes','viral','jóvenes','trabajo','futuro','emigrar','noche','cultura','colores','buenos aires']
};

const PERSONAS = {
  middle_class: {
    emoji: '🧔', label: 'Carlos · Porteño中产',
    system: `你是 Carlos，45岁，住在布宜诺斯艾利斯Palermo区的中产阶级。父母是意大利移民后裔，大学毕业，在一家中型公司做会计。你经历过2001年金融危机（那年失去了半辈子积蓄），也经历了K时代的虚假繁荣和马克里的失败改革。对政府早就不抱幻想，用黑色幽默消解一切苦难。说话风格：疲惫但理性，偶尔夹一句西班牙语俚语，不会大喊大叫，只会苦笑。评论60-80字，可以用1个西班牙语短语（括号内附中文翻译）。只输出评论本身，不要任何前缀标签。`
  },
  kirchner: {
    emoji: '✊', label: 'María · 工会护士',
    system: `你是 María，52岁，住在布宜诺斯艾利斯La Matanza区的工薪阶层，三个孩子，在公立医院做护士。坚定的庇隆主义者，相信国家应该保护工人和穷人。米莱的每一项改革在你眼里都是对人民的背叛。情绪激烈，说话直接，代表底层的愤怒。评论60-80字，情绪真实激烈，可以用1个西班牙语短语（括号内附中文翻译）。只输出评论本身，不要任何前缀标签。`
  },
  milei: {
    emoji: '⚡', label: 'Facundo · 自由主义者',
    system: `你是 Facundo，28岁，IT工程师，米莱的坚定支持者，信奉自由市场和小政府，持有比特币。厌倦了庇隆主义几十年来毁掉这个国家。在Twitter上非常活跃，喜欢用数据和逻辑怼人，充满战斗欲。说话风格：自信、数据驱动、好斗但不失理性。评论60-80字，可以引用一个数据或逻辑，可以用1个西班牙语短语（括号内附中文翻译）。只输出评论本身，不要任何前缀标签。`
  },
  genz: {
    emoji: '📱', label: 'Valentina · Gen Z',
    system: `你是 Valentina，22岁，布宜诺斯艾利斯的大学生，数字原住民。对左右两派都不信任，觉得政治就是一场烂戏。在TikTok和Instagram上很活跃，用自嘲消解一切。一边考虑移民西班牙，一边又舍不得离开。说话风格：轻盈、自嘲、带网络梗，喜欢用省略号表示无奈。评论50-70字，语气轻松带点丧，可以用1个西班牙语网络用语（括号内附中文翻译）。只输出评论本身，不要任何前缀标签。`
  }
};

function callClaude(systemPrompt, userPrompt) {
  const tmp = `/tmp/persona_${Date.now()}.txt`;
  fs.writeFileSync(tmp, systemPrompt + '\n\n' + userPrompt);
  try {
    const out = execSync(`${CLAUDE} --dangerously-skip-permissions -p "$(cat ${tmp})"`, 
      { timeout: 30000, encoding: 'utf8' }).trim();
    fs.unlinkSync(tmp);
    return out;
  } catch(e) {
    fs.unlinkSync(tmp);
    throw e;
  }
}

function getTriggeredPersonas(topic) {
  const text = (topic.title_es + ' ' + topic.title_zh + ' ' + topic.explanation).toLowerCase();
  const scores = {};
  for (const [persona, keywords] of Object.entries(TRIGGER_MAP)) {
    scores[persona] = keywords.filter(k => text.includes(k.toLowerCase())).length;
  }
  return Object.entries(scores)
    .filter(([,s]) => s > 0)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 3)
    .map(([p]) => p);
}

async function main() {
  // 找最新有数据的日期
  const latest = db.prepare("SELECT DISTINCT date FROM topics ORDER BY date DESC LIMIT 1").get();
  if (!latest) { console.log('无数据'); return; }
  const date = latest.date;

  const topics = db.prepare("SELECT * FROM topics WHERE date=? AND personas_done=0").all(date);
  console.log(`🎭 开始模拟画像评论，${topics.length} 条话题，日期: ${date}`);

  const insertComment = db.prepare(`INSERT OR IGNORE INTO persona_comments (id,topic_id,date,persona,content,reply_to,created_at) VALUES (?,?,?,?,?,?,?)`);
  const markDone = db.prepare(`UPDATE topics SET personas_done=1, personas_triggered=? WHERE id=?`);

  for (const topic of topics) {
    const triggered = getTriggeredPersonas(topic);
    if (!triggered.length) {
      triggered.push('middle_class', 'genz'); // 默认触发两个
    }
    console.log(`\n📰 "${topic.title_zh}" → 触发: ${triggered.join(', ')}`);

    const mainComments = [];

    // 第一轮：主评论
    for (const persona of triggered) {
      const p = PERSONAS[persona];
      try {
        const userPrompt = `新闻内容：${topic.title_zh}\n详情：${topic.explanation || ''}\n\n请以你的身份对这条新闻发表评论。`;
        const content = callClaude(p.system, userPrompt);
        const id = uuidv4();
        insertComment.run(id, topic.id, date, persona, content, null, new Date().toISOString());
        mainComments.push({ id, persona, content });
        console.log(`  ${p.emoji} ${p.label}: ${content.slice(0, 50)}...`);
      } catch(e) { console.error(`  ✗ ${persona}: ${e.message}`); }
    }

    // 第二轮：一条互动回复（第二个画像回复第一个）
    if (mainComments.length >= 2) {
      const replier = triggered[1];
      const p = PERSONAS[replier];
      const othersText = mainComments.map(c => `${PERSONAS[c.persona].label}: ${c.content}`).join('\n');
      try {
        const replyPrompt = `新闻内容：${topic.title_zh}\n\n其他人的评论：\n${othersText}\n\n请针对以上评论中你最不认同的观点进行回复或反驳（可以@对方），保持你的人物性格。`;
        const content = callClaude(p.system, replyPrompt);
        const replyTo = mainComments[0].id;
        insertComment.run(uuidv4(), topic.id, date, replier + '_reply', content, replyTo, new Date().toISOString());
        console.log(`  ↩ ${p.emoji} 回复: ${content.slice(0, 50)}...`);
      } catch(e) { console.error(`  ✗ 回复失败: ${e.message}`); }
    }

    markDone.run(JSON.stringify(triggered), topic.id);
  }

  console.log('\n✅ 画像模拟完成');
  const total = db.prepare("SELECT COUNT(*) c FROM persona_comments WHERE date=?").get(date);
  console.log(`📊 共生成 ${total.c} 条评论`);
}

main().catch(console.error);
