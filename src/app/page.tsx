'use client';
import { useState, useEffect } from 'react';

interface Comment { id: string; persona: string; content: string; reply_to: string | null; }
interface Topic {
  id: string; title_zh: string; explanation: string;
  business_impact: string; cultural_context: string;
  mood: string; links: string[];
  persona_comments: Comment[];
}
interface DailyData { date: string; topics: Topic[]; }

const PERSONA: Record<string, { short: string; label: string }> = {
  middle_class:       { short: 'Carlos',    label: 'Porteño 中产' },
  kirchner:           { short: 'María',     label: '工会·Kirchner 派' },
  milei:              { short: 'Facundo',   label: '自由派 IT' },
  genz:               { short: 'Valentina', label: 'Gen Z' },
  middle_class_reply: { short: 'Carlos',    label: 'Porteño 中产' },
  kirchner_reply:     { short: 'María',     label: '工会·Kirchner 派' },
  milei_reply:        { short: 'Facundo',   label: '自由派 IT' },
  genz_reply:         { short: 'Valentina', label: 'Gen Z' },
};

function Plaza({ comments }: { comments: Comment[] }) {
  if (!comments.length) return null;
  const mains = comments.filter(c => !c.reply_to);
  const replies = comments.filter(c => c.reply_to);
  return (
    <div className="plaza">
      <p className="plaza-label">广场声音</p>
      {mains.map(c => {
        const p = PERSONA[c.persona] || { short: c.persona, label: '' };
        const reply = replies.find(r => r.reply_to === c.id);
        const rp = reply ? (PERSONA[reply.persona] || { short: reply.persona, label: '' }) : null;
        return (
          <div key={c.id} className="comment-thread">
            <div className="comment-main">
              <span className={`comment-persona persona-${c.persona}`}>{p.short}</span>
              <p className="comment-text">{c.content}</p>
            </div>
            {reply && rp && (
              <div className="comment-reply">
                <span className={`comment-persona persona-${reply.persona}`}>{rp.short}</span>
                <p className="comment-text">{reply.content}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  const [showCultural, setShowCultural] = useState(false);
  const moodLabel: Record<string, string> = { negative: '负面', positive: '利好', neutral: '中性' };
  const mood = topic.mood?.toLowerCase() || 'neutral';

  return (
    <article className="topic-card">
      <div className="card-meta-row">
        <span className={`card-mood-tag ${mood}`}>{moodLabel[mood] || mood}</span>
        {topic.links?.[0] && (
          <a href={topic.links[0]} target="_blank" rel="noopener noreferrer" className="source-link">
            原文 ↗
          </a>
        )}
      </div>
      <h2 className="topic-title">{topic.title_zh}</h2>
      <p className="topic-explanation">{topic.explanation}</p>

      <Plaza comments={topic.persona_comments || []} />

      {topic.cultural_context && (
        <>
          <button className="toggle-btn" onClick={() => setShowCultural(o => !o)}>
            文化背景 {showCultural ? '↑' : '↓'}
          </button>
          {showCultural && <p className="cultural-text">{topic.cultural_context}</p>}
        </>
      )}
    </article>
  );
}

function formatDate(d: string) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [y, m, day] = d.split('-');
  return `${months[+m-1]} ${+day}, ${y}`;
}

export default function Home() {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/daily').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <main><div className="container"><div className="loading">载入中...</div></div></main>;
  if (!data?.topics.length) return <main><div className="container"><div className="empty">暂无数据</div></div></main>;

  return (
    <main>
      <div className="container">
        <header className="page-header">
          <p className="header-date">{formatDate(data.date)}</p>
        </header>

        <div className="topic-list">
          {data.topics.map(t => <TopicCard key={t.id} topic={t} />)}
        </div>

        <footer className="site-footer">Clarín · La Nación · Twitter &nbsp;·&nbsp; Built by WooWoo</footer>
      </div>
    </main>
  );
}
