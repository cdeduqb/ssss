'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../stores/stores.module.css';

type PendingStore = { 
  id: number; 
  name: string; 
  address: string;
  phone: string;
  createdAt: string;
  category?: { name: string };
  submitterIp?: string;
};

export default function ReviewsPage() {
  const [stores, setStores] = useState<PendingStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectModal, setRejectModal] = useState<{ show: boolean; storeId: number | null; storeName: string; reason: string }>({ show: false, storeId: null, storeName: '', reason: '' });

  useEffect(() => {
    fetchPendingStores();
  }, []);

  const fetchPendingStores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stores/pending');
      if (!res.ok) throw new Error('拉取数据失败');
      const data = await res.json();
      setStores(data);
    } catch (err: any) {
      setError('数据加载失败，请检查网络。');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('确定审核通过该店铺并发布吗？')) return;
    try {
      const res = await fetch(`/api/stores/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      if (!res.ok) throw new Error('审核操作失败');
      await fetchPendingStores();
    } catch (err: any) {
      alert(`操作失败: ${err.message}`);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.storeId) return;
    try {
      const res = await fetch(`/api/stores/${rejectModal.storeId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', rejectReason: rejectModal.reason })
      });
      if (!res.ok) throw new Error('审核操作失败');
      setRejectModal({ show: false, storeId: null, storeName: '', reason: '' });
      await fetchPendingStores();
    } catch (err: any) {
      alert(`操作失败: ${err.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ marginBottom: 0 }}>
        <div className={styles.pageHeader}>
          <div className={styles.pageIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div className={styles.pageTitleWrapper}>
            <h1 className={styles.title}>入驻审核</h1>
            <div className={styles.pageSubtitle}>审核用户从移动端提交的本地店铺入驻申请</div>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>店铺基本信息</th>
            <th>联系方式 & 地址</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} style={{textAlign: 'center', padding: '32px'}}>加载中...</td></tr>
          ) : stores.length === 0 ? (
            <tr><td colSpan={4} style={{textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)'}}>暂无待审核的入驻申请</td></tr>
          ) : (
            stores.map(store => (
              <tr key={store.id}>
                <td>
                  <div className={styles.storeInfo}>
                    <div>
                      <div className={styles.storeName}>{store.name}</div>
                      <span className={styles.storeCategory}>{store.category?.name || '未分类'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '14px', color: '#334155', marginBottom: '4px' }}>📞 {store.phone}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>📍 {store.address}</div>
                </td>
                <td style={{ fontSize: '14px', color: '#64748b' }}>
                  {new Date(store.createdAt).toLocaleString()}
                </td>
                <td>
                  <button 
                    className={`${styles.actionBtn}`} 
                    style={{ color: '#16a34a', border: '1px solid #16a34a', padding: '4px 12px', borderRadius: '6px', marginRight: '8px' }}
                    onClick={() => handleApprove(store.id)}
                  >
                    通过
                  </button>
                  <button 
                    className={`${styles.actionBtn}`} 
                    style={{ color: '#ef4444', border: '1px solid #ef4444', padding: '4px 12px', borderRadius: '6px' }}
                    onClick={() => setRejectModal({ show: true, storeId: store.id, storeName: store.name, reason: '' })}
                  >
                    拒绝
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 拒绝确认弹窗 */}
      {rejectModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px',
            maxWidth: '420px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', textAlign: 'center' }}>
              拒绝入驻申请
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                拒绝原因 (可选)
              </label>
              <textarea 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px', boxSizing: 'border-box' }}
                placeholder="请输入拒绝原因..."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setRejectModal({ show: false, storeId: null, storeName: '', reason: '' })}
                style={{
                  padding: '10px 24px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  background: 'white', color: '#64748b', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', transition: 'all 0.2s', flex: 1
                }}
              >
                取消
              </button>
              <button 
                onClick={handleReject}
                style={{
                  padding: '10px 24px', borderRadius: '12px', border: 'none',
                  background: '#ef4444', color: 'white', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', transition: 'all 0.2s', flex: 1
                }}
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
