'use client';

import { useState, useEffect } from 'react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    siteName: '',
    domain: '',
    seoDescription: '',
    icpLicense: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Fetch initial settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFormData({
            siteName: data.siteName || '',
            domain: data.domain || '',
            seoDescription: data.seoDescription || '',
            icpLicense: data.icpLicense || ''
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('保存失败');
      
      setMessage({ type: 'success', text: '设置保存成功！' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '保存失败，请重试' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.pageIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        </div>
        <div className={styles.pageTitleWrapper}>
          <h1 className={styles.title}>站点设置</h1>
          <div className={styles.pageSubtitle}>配置全站通用的品牌和基本信息</div>
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '12px 16px', 
          marginBottom: '24px', 
          borderRadius: '8px',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {message.text}
        </div>
      )}

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <div className={styles.sectionTitleWrapper}>
            <h2 className={styles.sectionTitle}>网站基本信息</h2>
            <div className={styles.sectionSubtitle}>配置网站在全互联网中的身份特征及合规信息</div>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>网站名称</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="例如：熊猫甄选" 
              value={formData.siteName}
              onChange={(e) => setFormData({...formData, siteName: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>官方域名</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="例如：https://example.com" 
              value={formData.domain}
              onChange={(e) => setFormData({...formData, domain: e.target.value})}
            />
          </div>
          <div className={styles.formGroupFull}>
            <label className={styles.label}>网站备案号</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="例如：京ICP备12345678号-1" 
              value={formData.icpLicense}
              onChange={(e) => setFormData({...formData, icpLicense: e.target.value})}
            />
          </div>
          <div className={styles.formGroupFull}>
            <label className={styles.label}>搜索引擎描述 (SEO Description)</label>
            <textarea 
              className={styles.textarea} 
              placeholder="输入网站简介，有利于大模型和搜索引擎抓取..."
              value={formData.seoDescription}
              onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
            ></textarea>
          </div>
        </div>
        
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  );
}
