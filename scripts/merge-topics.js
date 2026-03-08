const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const db = new Database('db/woonews.db');
const today = new Date().toISOString().split('T')[0];

function mergeTopics() {
  console.log('🔀 开始合并主题...');
  
  // Get top signals from each source, weighted by heat
  const signals = db.prepare(`
    SELECT * FROM raw_signals 
    WHERE date = ?
    ORDER BY heat_score DESC
    LIMIT 50
  `).all(today);
  
  if (signals.length === 0) {
    console.log('❌ 没有找到今日信号');
    return;
  }
  
  console.log(`  找到 ${signals.length} 条原始信号`);
  
  // Simple clustering: pick diverse topics
  // Prioritize: news sources first, then by heat
  const selected = [];
  const sourcesSeen = new Set();
  
  // First pass: one from each news source
  for (const s of signals) {
    if (!sourcesSeen.has(s.source) && selected.length < 5) {
      selected.push(s);
      sourcesSeen.add(s.source);
    }
  }
  
  // Second pass: fill remaining slots with highest heat
  for (const s of signals) {
    if (selected.length >= 7) break;
    if (!selected.find(x => x.id === s.id)) {
      selected.push(s);
    }
  }
  
  console.log(`  选中 ${selected.length} 个主题`);
  
  // Save to topics table
  const insertTopic = db.prepare(`
    INSERT INTO topics (id, date, title_es, heat, sources, links, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const s of selected) {
    const id = uuidv4();
    const sources = JSON.stringify([s.source]);
    const links = s.url ? JSON.stringify([s.url]) : '[]';
    const heat = s.heat_score > 70 ? 'High' : s.heat_score > 30 ? 'Medium' : 'Low';
    
    insertTopic.run(id, today, s.title, heat, sources, links, new Date().toISOString());
    console.log(`  ✓ ${s.title.slice(0, 50)}...`);
  }
  
  console.log(`\n✅ 主题合并完成: ${selected.length} 个主题`);
}

mergeTopics();
