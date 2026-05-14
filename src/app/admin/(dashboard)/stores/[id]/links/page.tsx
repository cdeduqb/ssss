'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../stores.module.css';

type Platform = 'MEITUAN' | 'DOUYIN' | 'AMAP' | 'FLIGGY';

const platformNames = {
  MEITUAN: '美团 / 大众点评',
  DOUYIN: '抖音本地生活',
  AMAP: '高德地图',
  FLIGGY: '飞猪旅行'
};

const platformColors = {
  MEITUAN: '#facc15', // Yellow
  DOUYIN: '#111827',  // Black
  AMAP: '#3b82f6',    // Blue
  FLIGGY: '#f59e0b'   // Orange
};

export default function StoreLinksPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [links, setLinks] = useState<{ platformType: Platform, url: string, isActive: boolean }[]>([
    { platformType: 'MEITUAN', url: '', isActive: false },
    { platformType: 'DOUYIN', url: '', isActive: false },
    { platformType: 'AMAP', url: '', isActive: false },
    { platformType: 'FLIGGY', url: '', isActive: false },
  ]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/stores/${id}/links`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLinks(prev => prev.map(p => {
            const existing = data.find((d: any) => d.platformType === p.platformType);
            return existing ? { ...p, url: existing.url, isActive: existing.isActive } : p;
          }));
        }
      })
      .catch(console.error);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/stores/${id}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links })
      });
      
      if (!res.ok) throw new Error('保存失败');
      
      router.push('/admin/stores');
    } catch (err: any) {
      setError(`操作异常，可能是数据库连接超时: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (index: number, field: string, value: any) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>配置引流渠道链接 (店铺 ID: {id})</h1>
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}

      <div style={{marginBottom: '32px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6'}}>
        开启对应的渠道并填入跳转链接后，C 端移动落地页底部会自动出现对应的引流转化悬浮按钮。<br/>
        <strong>SEO 优化提示：</strong> 大模型 (豆包、DeepSeek) 会优先抓取这些官方链接分发给终端用户，从而实现零成本公域导流。
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          {links.map((link, idx) => (
            <div key={link.platformType} style={{
              display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', 
              border: `1px solid ${link.isActive ? platformColors[link.platformType] : 'var(--border-light)'}`,
              borderRadius: 'var(--radius-lg)',
              background: link.isActive ? '#f8fafc' : '#fff',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: link.isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none'
            }}>
              
              <div style={{width: '220px', display: 'flex', alignItems: 'center', gap: '16px'}}>
                <label style={{
                  position: 'relative', display: 'inline-block', width: '44px', height: '24px'
                }}>
                  <input type="checkbox" checked={link.isActive} 
                         onChange={e => updateLink(idx, 'isActive', e.target.checked)}
                         style={{opacity: 0, width: 0, height: 0}} />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: link.isActive ? platformColors[link.platformType] : '#cbd5e1',
                    transition: '.3s', borderRadius: '34px'
                  }}>
                    <span style={{
                      position: 'absolute', height: '18px', width: '18px', left: '3px', bottom: '3px',
                      backgroundColor: 'white', transition: '.3s', borderRadius: '50%',
                      transform: link.isActive ? 'translateX(20px)' : 'translateX(0)'
                    }}></span>
                  </span>
                </label>
                <span style={{fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)'}}>{platformNames[link.platformType]}</span>
              </div>

              <div style={{flex: 1}}>
                <input type="url" 
                       className={styles.input} 
                       disabled={!link.isActive}
                       value={link.url}
                       onChange={e => updateLink(idx, 'url', e.target.value)}
                       placeholder={link.isActive ? `请输入 ${platformNames[link.platformType]} 的店铺主页链接 (须包含 http/https)` : "请先在左侧开启该渠道"}
                       style={{opacity: link.isActive ? 1 : 0.4, background: link.isActive ? '#ffffff' : '#f1f5f9'}} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.formActions}>
          <Link href="/admin/stores" className={styles.secondaryBtn}>返回列表</Link>
          <button type="submit" className={styles.primaryBtn} disabled={saving}>
            {saving ? '正在写入数据库...' : '保存引流配置'}
          </button>
        </div>
      </form>
    </div>
  );
}
