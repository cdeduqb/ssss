'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './stores.module.css';

type Store = { 
  id: number; 
  name: string; 
  visitCount: number; 
  isActive: boolean;
  category?: { name: string };
  images?: { url: string }[];
};

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; storeId: number | null; storeName: string }>({ show: false, storeId: null, storeName: '' });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stores');
      if (!res.ok) throw new Error('拉取数据失败');
      const data = await res.json();
      setStores(data);
    } catch (err: any) {
      setError('数据库连接超时。由于当前网络不稳定，暂无数据显示。');
    } finally {
      setLoading(false);
    }
  };

  // 上架/下架切换
  const handleToggleActive = async (id: number, currentActive: boolean) => {
    const action = currentActive ? '下架' : '上架';
    if (!confirm(`确定要${action}该店铺吗？${currentActive ? '下架后前端将不再展示该店铺。' : '上架后前端将重新展示该店铺。'}`)) return;
    try {
      const res = await fetch(`/api/stores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive })
      });
      if (!res.ok) throw new Error(`${action}失败`);
      await fetchStores();
    } catch (err: any) {
      alert(`操作失败: ${err.message}`);
    }
  };

  // 永久删除 - 通过弹窗确认
  const handleDelete = async () => {
    if (!confirmModal.storeId) return;
    try {
      const res = await fetch(`/api/stores/${confirmModal.storeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('删除失败');
      setConfirmModal({ show: false, storeId: null, storeName: '' });
      await fetchStores();
    } catch (err: any) {
      alert(`操作失败: ${err.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ marginBottom: 0 }}>
        <div className={styles.pageHeader}>
          <div className={styles.pageIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <div className={styles.pageTitleWrapper}>
            <h1 className={styles.title}>店铺管理</h1>
            <div className={styles.pageSubtitle}>录入与管理核心本地商家信息，为大模型 SEO 提供数据基础</div>
          </div>
        </div>
        <Link href="/admin/stores/new" className={styles.primaryBtn}>+ 新增本地商家</Link>
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>店铺信息</th>
            <th>状态</th>
            <th>引流转化访问量</th>
            <th>大模型结构化评分</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} style={{textAlign: 'center', padding: '32px'}}>数据加载中...</td></tr>
          ) : stores.length === 0 ? (
            <tr><td colSpan={5} style={{textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)'}}>暂无店铺数据，点击右上方按钮开始录入</td></tr>
          ) : (
            stores.map(store => (
              <tr key={store.id} style={{ opacity: store.isActive ? 1 : 0.6 }}>
                <td>
                  <div className={styles.storeInfo}>
                    <img 
                      src={store.images?.[0]?.url || '/placeholder.png'} 
                      className={styles.storeImage} 
                      alt={store.name} 
                    />
                    <div>
                      <div className={styles.storeName}>{store.name}</div>
                      <span className={styles.storeCategory}>{store.category?.name || '未分类'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '99px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: store.isActive ? '#dcfce7' : '#fee2e2',
                    color: store.isActive ? '#15803d' : '#b91c1c'
                  }}>
                    {store.isActive ? '已上架' : '已下架'}
                  </span>
                </td>
                <td style={{fontWeight: 'bold', color: 'var(--brand-primary)'}}>{store.visitCount} 次</td>
                <td style={{color: '#22c55e'}}>✓ GEO SEO-Ready</td>
                <td>
                  <a href={`/${store.id}`} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} ${styles.preview}`}>查看落地页</a>
                  <Link href={`/admin/stores/${store.id}/links`} className={styles.actionBtn}>引流配置</Link>
                  <Link href={`/admin/stores/${store.id}/edit`} className={styles.actionBtn}>编辑</Link>
                  <button 
                    className={`${styles.actionBtn}`} 
                    style={{ color: store.isActive ? '#ea580c' : '#16a34a' }}
                    onClick={() => handleToggleActive(store.id, store.isActive)}
                  >
                    {store.isActive ? '下架' : '上架'}
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.danger}`} 
                    onClick={() => setConfirmModal({ show: true, storeId: store.id, storeName: store.name })}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 删除确认弹窗 */}
      {confirmModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px',
            maxWidth: '420px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>确认永久删除</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
              您即将永久删除 <strong style={{ color: '#ef4444' }}>「{confirmModal.storeName}」</strong>，该操作将同时删除所有关联的图片、引流配置等数据，且<strong>无法撤销</strong>。
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setConfirmModal({ show: false, storeId: null, storeName: '' })}
                style={{
                  padding: '10px 24px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  background: 'white', color: '#64748b', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                取消
              </button>
              <button 
                onClick={handleDelete}
                style={{
                  padding: '10px 24px', borderRadius: '12px', border: 'none',
                  background: '#ef4444', color: 'white', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
