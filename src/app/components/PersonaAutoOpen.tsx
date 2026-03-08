'use client';
import { useEffect } from 'react';

export function PersonaAutoOpen() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    // 等 DOM 渲染
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // 触发卡片展开：找到 button 点击
        const btn = el.querySelector('button');
        if (btn) btn.click();
      }
    }, 100);
  }, []);
  return null;
}
