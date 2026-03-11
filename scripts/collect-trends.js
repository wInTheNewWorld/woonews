const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const https = require('https');

const db = new Database('db/woonews.db');
const today = new Date(Date.now() + 8*3600*1000).toISOString().split('T')[0];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } 
        catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function collectTrends() {
  console.log('📈 开始采集 Google Trends...');
  
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO raw_signals (id, date, source, title, url, heat_score, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Google Trends RSS for Argentina
  const trends = [
    { name: 'Argentina trends', url: 'https://trends.google.com/trends/rss?geo=AR' },
  ];
  
  let totalAdded = 0;
  
  try {
    console.log('  采集阿根廷趋势...');
    const data = await fetchJSON(trends[0].url);
    
    if (data && data.rss && data.rss.channel && data.rss.channel.item) {
      const items = Array.isArray(data.rss.channel.item) 
        ? data.rss.channel.item 
        : [data.rss.channel.item];
      
      let count = 0;
      for (const item of items.slice(0, 15)) {
        const title = (item.title || '').replace(/<[^>]+>/g, '').slice(0, 200);
        const exists = db.prepare('SELECT id FROM raw_signals WHERE title = ? AND source = ?').get(title, 'trends');
        
        if (!exists && title) {
          insertStmt.run(uuidv4(), today, 'trends', title, item.link || '', 50, new Date().toISOString());
          count++;
          totalAdded++;
        }
      }
      console.log(`    ✓ ${count} 条新趋势`);
    }
  } catch (err) {
    console.error(`    ✗ 错误: ${err.message}`);
  }
  
  console.log(`\n✅ Google Trends 采集完成: ${totalAdded} 条新数据`);
  
  const stats = db.prepare('SELECT source, COUNT(*) as count FROM raw_signals GROUP BY source').all();
  console.log('\n📊 当前数据统计:');
  stats.forEach(s => console.log(`   ${s.source}: ${s.count}`));
}

collectTrends().catch(console.error);
