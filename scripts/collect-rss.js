const Parser = require('rss-parser');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'WooNews/1.0 RSS Collector'
  }
});

const db = new Database(path.join(__dirname, '../db/woonews.db'));

const SOURCES = [
  { name: 'clarin', url: 'https://www.clarin.com/rss/lo-ultimo/' },
  { name: 'lanacion', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/' },
  { name: 'infobae', url: 'https://www.infobae.com/feeds/rss/' }
];

const MAX_ITEMS = 20;

const insertSignal = db.prepare(`
  INSERT OR IGNORE INTO raw_signals (id, date, source, title, url, heat_score, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const checkExists = db.prepare(`
  SELECT 1 FROM raw_signals WHERE date = ? AND title = ?
`);

async function collectFeed(source) {
  console.log(`Fetching ${source.name}...`);
  try {
    const feed = await parser.parseURL(source.url);
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    let inserted = 0;
    const items = feed.items.slice(0, MAX_ITEMS);

    for (const item of items) {
      const title = (item.title || '').trim();
      const url = item.link || item.guid || '';

      if (!title) continue;

      const exists = checkExists.get(today, title);
      if (exists) continue;

      insertSignal.run(uuidv4(), today, source.name, title, url, 50, now);
      inserted++;
    }

    console.log(`  ${source.name}: inserted ${inserted} / ${items.length} items`);
    return inserted;
  } catch (err) {
    console.error(`  ${source.name} failed: ${err.message}`);
    return 0;
  }
}

async function main() {
  console.log('Starting RSS collection...');
  let total = 0;
  for (const source of SOURCES) {
    total += await collectFeed(source);
  }
  console.log(`\nDone. Total new signals: ${total}`);
  db.close();
}

main();
