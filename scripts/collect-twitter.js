const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const https = require('https');

const db = new Database('db/woonews.db');
const today = new Date().toISOString().split('T')[0];
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiQWFIZjNQTUtrQVR2WEVRR1VENXNvNTFoQ1pDR3VDSkNGY1B3aTZIdFNDWXciLCJub25jZSI6IjAxMWQ3YTU2LTUxMGMtNDliMC05ZDc4LTYxZmJiNzBmM2M3NCIsImlhdCI6MTc3MjIwNTg2NiwianRpIjoiY2Q2ODIzZjAtOTAwOC00YjdhLTliNzMtNjRjMzMzNzE4NTJiIn0.TS14kIaF5sJyubqqKfSwv5yqbBxBdemuBx9DCeb8AEw';
const KEYWORDS = ['Argentina economia', 'Buenos Aires', 'Milei dolar', 'Argentina inflacion'];

function cleanText(text) {
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27FF}]/gu, '')
    .replace(/[\u{2300}-\u{23FF}]/gu, '')
    .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FAFF}]/gu, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function post6551(body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: 'ai.6551.io', path: '/open/twitter_search', method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(payload); req.end();
  });
}

async function collect() {
  console.log('🐦 Twitter 采集开始...');
  const insert = db.prepare(`INSERT OR IGNORE INTO raw_signals (id,date,source,title,url,heat_score,created_at) VALUES (?,?,?,?,?,?,?)`);
  let total = 0;

  for (const kw of KEYWORDS) {
    try {
      const res = await post6551({ keywords: kw, maxResults: 10, product: 'Top' });
      const tweets = res?.data || [];
      let count = 0;
      for (const t of tweets) {
        const url = `https://x.com/${t.userScreenName}/status/${t.id}`;
        const title = cleanText(t.text).slice(0, 200);
        const heat = (t.favoriteCount || 0) + (t.retweetCount || 0);
        const r = insert.run(uuidv4(), today, 'twitter', title, url, heat, new Date().toISOString());
        if (r.changes) count++;
      }
      console.log(`  [${kw}] → ${count} 条`);
      total += count;
    } catch(e) { console.error(`  [${kw}] 错误: ${e.message}`); }
  }

  // 清洗已有数据
  const existing = db.prepare("SELECT id, title FROM raw_signals WHERE source='twitter' AND date=?").all(today);
  let cleaned = 0;
  const upd = db.prepare("UPDATE raw_signals SET title=? WHERE id=?");
  for (const r of existing) {
    const c = cleanText(r.title);
    if (c !== r.title) { upd.run(c, r.id); cleaned++; }
  }
  if (cleaned) console.log(`  已清洗 ${cleaned} 条旧数据`);

  console.log(`\n✅ 完成，新增 ${total} 条`);
}

collect().catch(console.error);
