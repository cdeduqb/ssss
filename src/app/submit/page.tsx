'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from './submit.module.css';
import Link from 'next/link';

const facilityMap: Record<string, string[]> = {
  default: ['免费WiFi', '停车场', '无障碍设施', '空调', '洗手间', '充电宝', '外卖', '刷卡支付'],
  restaurant: ['免费WiFi', '停车场', '包间', '空调', '无烟区', '儿童座椅', '外卖', '可预约', '有露台', '现场表演'],
  hotel: ['免费WiFi', '停车场', '游泳池', '健身房', '24h前台', '行李寄存', '电梯', '早餐', '接机服务', '洗衣服务', '会议室', 'SPA', '商务中心', '无烟房', '空调', '热水'],
  attraction: ['免费WiFi', '停车场', '导览服务', '储物柜', '无障碍通道', '餐饮区', '纪念品店', '儿童友好', '宠物友好', '拍照打卡'],
};

function getFacilityOptions(templateType: string): string[] {
  return facilityMap[templateType] || facilityMap.default;
}

export default function SubmitPage() {
  const [categories, setCategories] = useState<{id: number, name: string, templateType?: string, level?: number}[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    phone: '',
    address: '',
    hours: '周一至周日 09:00-22:00',
    latitude: '',
    longitude: '',
    avgConsumption: '',
    holidayAvgConsumption: '',
    description: '',
  });

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const buildTree = (cats: any[], parentId: number | null = null, level = 0): any[] => {
            const children = cats.filter(c => c.parentId === parentId).sort((a, b) => b.sortOrder - a.sortOrder);
            let result: any[] = [];
            for (const child of children) {
              result.push({ ...child, level });
              if (level < 2) result = result.concat(buildTree(cats, child.id, level + 1));
            }
            return result;
          };
          setCategories(buildTree(data));
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (res.ok) {
        setImages([...images, data.url]);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('图片上传异常，请重试');
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images];
    if (direction === 'left' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === 'right' && index < newImages.length - 1) {
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    }
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      setError('请选择所属分类');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stores/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: parseInt(formData.categoryId),
          facilities: facilities,
          images: images
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.message || '提交失败，请重试');
      }
    } catch (err) {
      setError('网络异常，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>提交成功</h2>
          <p className={styles.successText}>您的店铺信息已提交，我们将尽快审核。<br/>审核通过后即可在平台展示。</p>
          <Link href="/explore" className={styles.backBtn}>返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>商家入驻申请</title>
      </Head>

      <div className={styles.header}>
        <h1 className={styles.title}>商家入驻申请</h1>
        <p className={styles.subtitle}>加入熊猫甄选，让更多人发现您的好店</p>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>商家全称 * (需与地图一致)</label>
            <input 
              type="text" 
              name="name" 
              required 
              className={styles.input} 
              placeholder="例如：海底捞火锅 (王府井店)"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>所属行业分类 *</label>
            <select 
              name="categoryId" 
              required 
              className={styles.select}
              value={formData.categoryId}
              onChange={e => {
                const catId = e.target.value;
                setFormData({...formData, categoryId: catId});
                const cat = categories.find((c: any) => c.id === Number(catId));
                if (cat?.templateType) setSelectedTemplate(cat.templateType);
              }}
            >
              <option value="">请选择分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {'\u00A0\u00A0'.repeat(cat.level || 0)}{cat.level && cat.level > 0 ? '├─ ' : ''}{cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>营业时间 *</label>
            <input 
              type="text" 
              name="hours" 
              required
              className={styles.input} 
              value={formData.hours}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>联系电话 *</label>
            <input 
              type="tel" 
              name="phone" 
              required 
              className={styles.input} 
              placeholder="手机号或座机号"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>详细地址 *</label>
            <input 
              type="text" 
              name="address" 
              required 
              className={styles.input} 
              placeholder="请输入详细的店铺地址"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>人均消费 (元)</label>
            <input 
              type="number" 
              name="avgConsumption" 
              className={styles.input} 
              placeholder="例如：88"
              value={formData.avgConsumption}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>节假日人均消费 (元) - 选填</label>
            <input 
              type="number" 
              name="holidayAvgConsumption" 
              className={styles.input} 
              placeholder="例如：128"
              value={formData.holidayAvgConsumption}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>高德地图坐标 - 经度</label>
            <input 
              type="text" 
              name="longitude" 
              className={styles.input} 
              placeholder="例如: 116.407526"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>高德地图坐标 - 纬度</label>
            <input 
              type="text" 
              name="latitude" 
              className={styles.input} 
              placeholder="例如: 39.90403"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>商家丰富简介 * (极其重要)</label>
            <textarea 
              name="description" 
              required
              className={styles.textarea} 
              placeholder="请详细描述店铺特色、招牌菜、环境风格等，让用户和平台更了解您的店铺..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>设施服务标签</label>
            <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'8px'}}>
              {getFacilityOptions(selectedTemplate).map(f => (
                <label key={f} style={{
                  display:'flex', alignItems:'center', gap:'4px',
                  padding:'6px 12px', borderRadius:'99px', cursor:'pointer',
                  background: facilities.includes(f) ? '#dbeafe' : 'rgba(255, 255, 255, 0.8)',
                  color: facilities.includes(f) ? '#1d4ed8' : '#475569',
                  border: facilities.includes(f) ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                  fontSize:'13px', fontWeight:500, transition:'all 0.2s'
                }}>
                  <input type="checkbox" checked={facilities.includes(f)}
                    onChange={() => setFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                    style={{display:'none'}} />
                  {facilities.includes(f) ? '✓ ' : ''}{f}
                </label>
              ))}
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>店铺宣传图库 (首张将作为门头封面)</label>
            <label className={styles.imageUploadArea}>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <div style={{color: '#3b82f6', fontWeight: '600', marginTop: '4px', fontSize: '14px'}}>
                {uploading ? '上传中...' : '点击选择图片'}
              </div>
            </label>

            {images.length > 0 && (
              <div className={styles.previewGrid}>
                {images.map((url, idx) => (
                  <div key={idx} className={styles.previewItem}>
                    {idx === 0 && <div style={{position:'absolute', top:0, left:0, background:'#3b82f6', color:'white', fontSize:'10px', padding:'2px 6px', borderBottomRightRadius:'8px', zIndex:10}}>封面</div>}
                    <img src={url} alt={`上传图片 ${idx + 1}`} />
                    <div className={styles.previewActions}>
                      <span className={styles.moveBtn} onClick={() => moveImage(idx, 'left')} style={{ opacity: idx === 0 ? 0.3 : 1 }}>◀</span>
                      <span className={styles.moveBtn} onClick={() => moveImage(idx, 'right')} style={{ opacity: idx === images.length - 1 ? 0.3 : 1 }}>▶</span>
                    </div>
                    <div className={styles.removeImgBtn} onClick={() => setImages(images.filter((_, i) => i !== idx))}>✕</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading || uploading}>
          {loading ? '提交中...' : '立即提交申请'}
        </button>
      </form>
    </div>
  );
}
