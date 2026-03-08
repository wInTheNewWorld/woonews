#!/usr/bin/env node
/**
 * merge-topics.js
 * 从原始信号中挑选 5-7 个话题
 * 规则：
 * - 社交信号（Twitter/Reddit）优先权重 ×1.5
 * - 经济数据类话题最多 1-2 条（上限保护）
 * - 尽量保持视角多样性（左/右/中立媒体都参与）
 */

const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const db = new Database(path.join(__dirname, '../db/woonews.db'));
const TODAY = new Date().toISOString().split('T')[0];

// 经济话题关键词——命中这些词的话题会被限流
const ECON_KEYWORDS = [
  'dolar', 'dólar', 'inflación', 'inflacion', 'pib', 'gdp', 'reservas',
  'exportacion', 'exportación', 'importacion', 'importación', 'deuda',
  'banco central', 'tipo de cambio', 'indec', 'balanza', 'superavit',
  'superávit', '出口', '进口', '通胀', 'GDP', '汇率', '央行'
];

function isEconTopic(title) {
  const t = title.toLowerCase();
  return ECON_KEYWORDS.some(k => t.includes(k.toLowerCase()));
}

// 社交来源
const SOCIAL_SOURCES = ['twitter', 'reddit_argentina', 'reddit_merval'];

function isSocialSource(source) {
  return SOCIAL_SOURCES.some(s => source.includes(s));
}

function mergeTopics() {
  console.log('🔀 开始合并主题...');

  const signals = db.prepare(`
    SELECT * FROM raw_signals
    WHERE date = ?
    ORDER BY heat_score DESC
    LIMIT 100
  `).all(TODAY);

  if (!signals.length) {
    console.log('❌ 没有今日信号');
    return;
  }

  console.log(`  原始信号 ${signals.length} 条`);

  // 加权：社交信号 ×1.5
  const weighted = signals.map(s => ({
    ...s,
    effective_score: isSocialSource(s.source)
      ? s.heat_score * 1.5
      : s.heat_score
  })).sort((a, b) => b.effective_score - a.effective_score);

  // 简单去重：标题相似度（前20字）
  const seen = new Set();
  const deduped = [];
  for (const s of weighted) {
    const key = s.title.slice(0, 20).toLowerCase().replace(/\s+/g, '');
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(s);
    }
  }

  console.log(`  去重后 ${deduped.length} 条`);

  // 选题：最多 7 条，经济话题最多 2 条
  const selected = [];
  let econCount = 0;
  const MAX_ECON = 2;
  const MAX_TOTAL = 7;

  for (const s of deduped) {
    if (selected.length >= MAX_TOTAL) break;
    const isEcon = isEconTopic(s.title);
    if (isEcon && econCount >= MAX_ECON) continue;
    selected.push(s);
    if (isEcon) econCount++;
  }

  console.log(`  选中 ${selected.length} 条（经济话题 ${econCount} 条）`);

  // 写入 topics 表
  const insertTopic = db.prepare(`
    INSERT INTO topics (id, date, title_es, heat, sources, links, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of selected) {
    const id = uuidv4();
    const heat = s.effective_score >= 75 ? 'High'
               : s.effective_score >= 40 ? 'Medium' : 'Low';
    insertTopic.run(
      id, TODAY, s.title, heat,
      JSON.stringify([s.source]),
      s.url ? JSON.stringify([s.url]) : '[]',
      new Date().toISOString()
    );
    const tag = isSocialSource(s.source) ? '🔥' : '📰';
    console.log(`  ${tag} ${s.title.slice(0, 55)}...`);
  }

  console.log(`\n✅ 主题合并完成: ${selected.length} 个主题`);
  db.close();
}

mergeTopics();
