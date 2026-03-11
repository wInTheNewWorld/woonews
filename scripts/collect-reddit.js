#!/usr/bin/env node
/**
 * collect-reddit.js
 * 采集 r/argentina 热帖，社交情绪信号，权重最高
 */
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const db = new Database(path.join(__dirname, '../db/woonews.db'));
const TODAY = new Date(Date.now() + 8*3600*1000).toISOString().split('T')[0];

const SUBREDDITS = ['argentina', 'merval'];
const MAX_POSTS = 25;
const SOCIAL_WEIGHT = 50; // 社交信号基础权重，会加上热度加成

const insertSignal = db.prepare(`
  INSERT OR IGNORE INTO raw_signals (id, date, source, title, url, heat_score, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

async function collectSubreddit(sub) {
  const url = `https://www.reddit.com/r/${sub}/hot.json?limit=${MAX_POSTS}&t=day`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'WooNews/1.0 (news aggregator)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const posts = data?.data?.children || [];

    let inserted = 0;
    for (const p of posts) {
      const post = p.data;
      if (post.stickied || post.is_video) continue;
      const title = post.title?.trim();
      if (!title) continue;

      // 热度加成：upvotes 越高，score 越高，最高 100
      const upvoteBonus = Math.min(50, Math.floor(post.ups / 200));
      const score = SOCIAL_WEIGHT + upvoteBonus;
      const postUrl = `https://reddit.com${post.permalink}`;

      insertSignal.run(uuidv4(), TODAY, `reddit_${sub}`, title, postUrl, score, new Date().toISOString());
      inserted++;
    }
    console.log(`  reddit/${sub}: ${inserted} 条`);
    return inserted;
  } catch (e) {
    console.error(`  reddit/${sub} 失败: ${e.message}`);
    return 0;
  }
}

async function main() {
  let total = 0;
  for (const sub of SUBREDDITS) {
    total += await collectSubreddit(sub);
  }
  console.log(`✅ Reddit 采集完成，共 ${total} 条`);
  db.close();
}

main();
