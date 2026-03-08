'use client';
import { useState, useEffect } from 'react';

interface Comment { id: string; persona: string; content: string; reply_to: string | null; }
interface Topic {
  id: string; title: string; explanation: string;
  cultural_context: string; mood: string; links: string[];
  persona_comments: Comment[];
}
interface DailyData { date: string; lang: string; topics: Topic[]; }

const PERSONA: Record<string, { short: string }> = {
  carlos:             { short: 'Carlos'    },
  maria:              { short: 'María'     },
  facundo:            { short: 'Facundo'   },
  valentina:          { short: 'Valentina' },
  hector:             { short: 'Don Héctor'},
  lucia:              { short: 'Lucía'     },
  rodrigo:            { short: 'Rodrigo'   },
  tincho:             { short: 'Tincho'    },
  carlos_reply:       { short: 'Carlos'    },
  maria_reply:        { short: 'María'     },
  facundo_reply:      { short: 'Facundo'   },
  valentina_reply:    { short: 'Valentina' },
  hector_reply:       { short: 'Don Héctor'},
  lucia_reply:        { short: 'Lucía'     },
  rodrigo_reply:      { short: 'Rodrigo'   },
  tincho_reply:       { short: 'Tincho'    },
};

const UI: Record<string, Record<string, string>> = {
  zh: {
    plaza:      '广场声音',
    cultural:   '文化背景',
    source:     '原文 ↗',
    loading:    '载入中...',
    empty:      '暂无数据',
    footer:     'Clarín · La Nación · Twitter · Built by WooWoo',
    switchLang: 'English',
    switchHref: '/en',
    navHome:    '阿根廷情报',
    navDocs:    '文档',
  },
  en: {
    plaza:      'The Plaza',
    cultural:   'Cultural Context',
    source:     'Source ↗',
    loading:    'Loading...',
    empty:      'No data available',
    footer:     'Clarín · La Nación · Twitter · Built by WooWoo',
    switchLang: '中文',
    switchHref: '/',
    navHome:    'Argentina Intel',
    navDocs:    'Docs',
  },
};

function Plaza({ comments, t }: { comments: Comment[], t: Record<string, string> }) {
  if (!comments.length) return null;
  const mains = comments.filter(c => !c.reply_to);
  const replies = comments.filter(c => c.reply_to);
  return (
    <div className="plaza">
      <p className="plaza-label">{t.plaza}</p>
      {mains.map(c => {
        const p = PERSONA[c.persona] || { short: c.persona };
        const reply = replies.find(r => r.reply_to === c.id);
        const rp = reply ? (PERSONA[reply.persona] || { short: reply.persona }) : null;
        return (
          <div key={c.id} className="comment-thread">
            <div className="comment-main">
              <span className={`comment-persona persona-${c.persona.replace('_reply','')}`}>{p.short}</span>
              <p className="comment-text">{c.content}</p>
            </div>
            {reply && rp && (
              <div className="comment-reply">
                <span className={`comment-persona persona-${reply.persona.replace('_reply','')}`}>{rp.short}</span>
                <p className="comment-text">{reply.content}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TopicCard({ topic, t }: { topic: Topic, t: Record<string, string> }) {
  const [showCultural, setShowCultural] = useState(false);
  const mood = topic.mood?.toLowerCase() || 'neutral';
  const moodLabel: Record<string, string> = t === UI.zh
    ? { negative: '负面', positive: '利好', neutral: '中性' }
    : { negative: 'Negative', positive: 'Positive', neutral: 'Neutral' };

  return (
    <article className="topic-card">
      <div className="card-meta-row">
        <span className={`card-mood-tag ${mood}`}>{moodLabel[mood] || mood}</span>
        {topic.links?.[0] && (
          <a href={topic.links[0]} target="_blank" rel="noopener noreferrer" className="source-link">
            {t.source}
          </a>
        )}
      </div>
      <h2 className="topic-title">{topic.title}</h2>
      <p className="topic-explanation">{topic.explanation}</p>
      <Plaza comments={topic.persona_comments || []} t={t} />
      {topic.cultural_context && (
        <>
          <button className="toggle-btn" onClick={() => setShowCultural(o => !o)}>
            {t.cultural} {showCultural ? '↑' : '↓'}
          </button>
          {showCultural && <p className="cultural-text">{topic.cultural_context}</p>}
        </>
      )}
    </article>
  );
}

function formatDate(d: string, lang: string) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthsZh = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const [y, m, day] = d.split('-');
  return lang === 'en'
    ? `${months[+m-1]} ${+day}, ${y}`
    : `${y}年${monthsZh[+m-1]}${+day}日`;
}

export function DailyPage({ lang }: { lang: 'zh' | 'en' }) {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const t = UI[lang];

  useEffect(() => {
    fetch(`/api/daily?lang=${lang}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lang]);

  if (loading) return <main><div className="container"><div className="loading">{t.loading}</div></div></main>;
  if (!data?.topics.length) return <main><div className="container"><div className="empty">{t.empty}</div></div></main>;

  return (
    <main>
      <div className="container">
        <header className="page-header">
          <p className="header-date">{formatDate(data.date, lang)}</p>
        </header>
        <div className="topic-list">
          {data.topics.map(topic => <TopicCard key={topic.id} topic={topic} t={t} />)}
        </div>
        <footer className="site-footer">{t.footer}</footer>
      </div>
    </main>
  );
}
