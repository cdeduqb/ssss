'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../stores.module.css';

const facilityMap: Record<string, string[]> = {
  default: ['免费WiFi', '停车场', '无障碍设施', '空调', '洗手间', '充电宝', '外卖', '刷卡支付'],
  restaurant: ['免费WiFi', '停车场', '包间', '空调', '无烟区', '儿童座椅', '外卖', '可预约', '有露台', '现场表演'],
  hotel: ['免费WiFi', '停车场', '游泳池', '健身房', '24h前台', '行李寄存', '电梯', '早餐', '接机服务', '洗衣服务', '会议室', 'SPA', '商务中心', '无烟房', '空调', '热水'],
  attraction: ['免费WiFi', '停车场', '导览服务', '储物柜', '无障碍通道', '餐饮区', '纪念品店', '儿童友好', '宠物友好', '拍照打卡'],
};

function getFacilityOptions(templateType: string): string[] {
  return facilityMap[templateType] || facilityMap.default;
}

export default function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [categories, setCategories] = useState<{id: number, name: string, templateType?: string, level?: number}[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    hours: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    avgConsumption: '',
    holidayAvgConsumption: '',
    description: ''
  });

  useEffect(() => {
    // 获取分类
    fetch('/api/categories').then(res => res.json()).then(data => {
      if(Array.isArray(data)) {
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
    }).catch(console.error);

    // 获取现有店铺数据
    fetch(`/api/stores/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('获取店铺数据失败');
        return res.json();
      })
      .then(data => {
        setFormData({
          name: data.name || '',
          categoryId: data.categoryId?.toString() || '',
          hours: data.hours || '',
          phone: data.phone || '',
          address: data.address || '',
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || '',
          avgConsumption: data.avgConsumption?.toString() || '',
          holidayAvgConsumption: data.holidayAvgConsumption?.toString() || '',
          description: data.description || ''
        });
        
        if (data.images && Array.isArray(data.images)) {
          setImages(data.images.map((img: any) => img.url));
        }

        if (data.facilities) {
          try {
            const list = JSON.parse(data.facilities);
            if (Array.isArray(list)) setFacilities(list);
          } catch(e) {}
        }

        if (data.category?.templateType) {
          setSelectedTemplate(data.category.templateType);
        }
      })
      .catch(err => {
        setError('无法加载店铺数据: ' + err.message);
      });
  }, [id]);

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
      alert('上传异常，请检查网络或权限');
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
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, images, facilities: JSON.stringify(facilities) })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || '更新失败');
      }
      
      router.push('/admin/stores');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>编辑本地商家</h1>
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>商家全称 (需与高德/美团一致，利于 AI 抓取)</label>
            <input type="text" className={styles.input} required 
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                   placeholder="例如：海底捞火锅 (王府井店)" />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>所属行业分类</label>
            <select className={styles.select} required 
                    value={formData.categoryId} onChange={e => {
                      const catId = e.target.value;
                      setFormData({...formData, categoryId: catId});
                      const cat = categories.find((c: any) => c.id === Number(catId));
                      if (cat?.templateType) setSelectedTemplate(cat.templateType);
                    }}>
              <option value="">请选择分类</option>
              {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{'\u00A0\u00A0'.repeat(cat.level || 0)}{cat.level > 0 ? '├─ ' : ''}{cat.name}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>营业时间</label>
            <input type="text" className={styles.input} required 
                   value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>联系电话</label>
            <input type="text" className={styles.input} required 
                   value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>详细地址</label>
            <input type="text" className={styles.input} required 
                   value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>人均消费 (元)</label>
            <input type="number" className={styles.input} 
                   value={formData.avgConsumption} onChange={e => setFormData({...formData, avgConsumption: e.target.value})} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>节假日人均消费 (元) - 选填</label>
            <input type="number" className={styles.input} 
                   value={formData.holidayAvgConsumption} onChange={e => setFormData({...formData, holidayAvgConsumption: e.target.value})} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>高德地图坐标 - 经度 (Longitude)</label>
            <input type="text" className={styles.input} 
                   value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} 
                   placeholder="例如: 116.407526" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>高德地图坐标 - 纬度 (Latitude)</label>
            <input type="text" className={styles.input} 
                   value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} 
                   placeholder="例如: 39.90403" />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>商家丰富简介 (极其重要：大模型生成摘要的核心依据)</label>
            <textarea className={styles.textarea} required 
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="请详细描述店铺特色、招牌菜、环境风格等，字数越多越结构化，越容易被豆包/DeepSeek收录并作为首选推荐..."></textarea>
          </div>

          {/* 设施服务 */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>设施服务标签 (将展示在落地页)</label>
            <div style={{display:'flex', flexWrap:'wrap', gap:'10px', marginTop:'8px'}}>
              {getFacilityOptions(selectedTemplate).map(f => (
                <label key={f} style={{
                  display:'flex', alignItems:'center', gap:'6px',
                  padding:'8px 14px', borderRadius:'99px', cursor:'pointer',
                  background: facilities.includes(f) ? '#dbeafe' : '#f1f5f9',
                  color: facilities.includes(f) ? '#1d4ed8' : '#64748b',
                  border: facilities.includes(f) ? '1px solid #93c5fd' : '1px solid transparent',
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

          {/* Image Upload Area */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>店铺宣传图库 (第一张图片将作为默认封面)</label>
            <label className={styles.imageUploadArea}>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <div style={{color: 'var(--brand-primary)', fontWeight: '600', marginTop: '4px'}}>
                {uploading ? '图片上传中...' : '点击选择图片上传'}
              </div>
              <div style={{fontSize: '13px', color: 'var(--text-tertiary)'}}>支持 JPG/PNG，图片将直接保存在系统内部</div>
            </label>

            {images.length > 0 && (
              <div className={styles.previewGrid}>
                {images.map((url, idx) => (
                  <div key={idx} className={styles.previewItem}>
                    {idx === 0 && <div style={{position:'absolute', top:0, left:0, background:'var(--brand-primary)', color:'white', fontSize:'10px', padding:'2px 6px', borderBottomRightRadius:'8px', zIndex:10}}>封面图</div>}
                    <img src={url} alt={`Preview ${idx}`} />
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

        <div className={styles.formActions}>
          <Link href="/admin/stores" className={styles.secondaryBtn}>返回列表</Link>
          <button type="submit" className={styles.primaryBtn} disabled={saving || uploading}>
            {saving ? '正在写入...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  );
}
