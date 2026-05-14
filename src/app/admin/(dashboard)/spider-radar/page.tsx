'use client';

import { useState, useEffect } from 'react';
import styles from '../stores/stores.module.css';

type CrawlerLog = {
  id: number;
  botName: string;
  url: string;
  ip: string | null;
  createdAt: string;
};

type Stats = {
  botName: string;
  _count: { botName: number };
};

export default function SpiderRadarPage() {
  const [logs, setLogs] = useState<CrawlerLog[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spider-radar');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch radar data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.pageHeader}>
          <div className={styles.pageIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"></path><path d="M12 6v6l4 2"></path><path d="M22 12h-2"></path><path d="M4 12H2"></path><path d="M12 2v2"></path><path d="M12 20v2"></path></svg>
          </div>
          <div className={styles.pageTitleWrapper}>
            <h1 className={styles.title}>AI 爬虫雷达</h1>
            <div className={styles.pageSubtitle}>实时监控各大模型爬虫 (GPT/豆包/百度等) 对本站的数据抓取情况</div>
          </div>
        </div>
        <button onClick={fetchData} className={styles.secondaryBtn}>
          🔄 刷新数据
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
        {/* 统计面板 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>抓取量排行榜 (全量)</h2>
          {loading ? (
            <div style={{ color: '#94a3b8' }}>加载中...</div>
          ) : stats.length === 0 ? (
            <div style={{ color: '#94a3b8' }}>暂无数据</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 500, color: '#334155' }}>{stat.botName}</span>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{stat._count.botName} 次</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 实时日志 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>最新抓取流水</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table} style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>时间</th>
                  <th>爬虫类型</th>
                  <th>抓取路径</th>
                  <th>IP 来源</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>加载中...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>暂无访问记录</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ color: '#64748b' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>
                        <span style={{ display: 'inline-block', padding: '4px 8px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '4px', fontSize: '12px' }}>
                          {log.botName}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#334155' }}>{log.url}</td>
                      <td style={{ color: '#94a3b8', fontSize: '13px' }}>{log.ip || '未知'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
