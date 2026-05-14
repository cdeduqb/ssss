'use client';

import { useState, useEffect } from 'react';
import styles from '../stores/stores.module.css';

type PushLog = {
  id: number;
  store: { id: number; name: string } | null;
  platform: string;
  status: string;
  response: string | null;
  createdAt: string;
};

type Stat = {
  platform: string;
  status: string;
  _count: { platform: number };
};

export default function GeoPushPage() {
  const [logs, setLogs] = useState<PushLog[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/geo-push');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch push data', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformStats = (platformName: string) => {
    const successCount = stats.find(s => s.platform.includes(platformName) && s.status === 'SUCCESS')?._count.platform || 0;
    const failCount = stats.find(s => s.platform.includes(platformName) && s.status === 'FAILED')?._count.platform || 0;
    return { successCount, failCount };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.pageHeader}>
          <div className={styles.pageIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <div className={styles.pageTitleWrapper}>
            <h1 className={styles.title}>SEO/GEO 推送中心</h1>
            <div className={styles.pageSubtitle}>管理和监控向百度、豆包、必应等底层大模型的数据推送状态</div>
          </div>
        </div>
        <button onClick={fetchData} className={styles.secondaryBtn}>
          🔄 刷新状态
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {/* 百度卡片 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', borderTop: '4px solid #2563eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>百度搜索 / 文心一言</h3>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>覆盖国内最大传统搜索引擎及文心生态</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>成功推送</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{getPlatformStats('Baidu').successCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>推送失败</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{getPlatformStats('Baidu').failCount}</div>
            </div>
          </div>
        </div>

        {/* 豆包/抖音卡片 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', borderTop: '4px solid #000000' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>头条搜索 / 豆包</h3>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>覆盖抖音、今日头条及豆包大模型生态</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>成功推送</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{getPlatformStats('Toutiao').successCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>推送失败</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{getPlatformStats('Toutiao').failCount}</div>
            </div>
          </div>
        </div>

        {/* IndexNow 卡片 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', borderTop: '4px solid #0d9488' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>IndexNow 协议</h3>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>微软发起，覆盖必应 Copilot 及 360智脑</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>成功推送</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{getPlatformStats('IndexNow').successCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>推送失败</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{getPlatformStats('IndexNow').failCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>近期推送流水</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>时间</th>
                <th>关联店铺</th>
                <th>推送目标平台</th>
                <th>状态</th>
                <th>详细反馈</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>加载中...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>暂无推送记录 (新增或编辑店铺后自动触发)</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: '#64748b' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      {log.store ? (
                        <a href={`/1`} target="_blank" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
                          {log.store.name}
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>未知/已删除</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>{log.platform}</td>
                    <td>
                      {log.status === 'SUCCESS' ? (
                        <span style={{ display: 'inline-block', padding: '4px 8px', background: '#d1fae5', color: '#059669', borderRadius: '4px', fontSize: '12px' }}>
                          成功
                        </span>
                      ) : (
                        <span style={{ display: 'inline-block', padding: '4px 8px', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontSize: '12px' }}>
                          失败
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.response || ''}>
                      {log.response || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
