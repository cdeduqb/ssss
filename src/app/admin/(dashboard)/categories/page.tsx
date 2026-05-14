'use client';

import { useState, useEffect } from 'react';
import styles from './categories.module.css';

type Category = { id: number; name: string; sortOrder: number; parentId: number | null; templateType: string; level?: number; hasChildren?: boolean };

const templateLabels: Record<string, string> = {
  default: '通用',
  restaurant: '美食餐饮',
  hotel: '酒店民宿',
  attraction: '景点玩乐',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', sortOrder: 0, parentId: '', templateType: 'default' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('拉取数据失败');
      const data: Category[] = await res.json();
      
      const buildTree = (cats: Category[], parentId: number | null = null, level = 0): Category[] => {
        const children = cats.filter(c => c.parentId === parentId).sort((a, b) => b.sortOrder - a.sortOrder);
        let result: Category[] = [];
        for (const child of children) {
          const childCats = cats.filter(c => c.parentId === child.id);
          result.push({ ...child, level, hasChildren: childCats.length > 0 });
          if (level < 2) { // 3级分类: 0, 1, 2
            result = result.concat(buildTree(cats, child.id, level + 1));
          }
        }
        return result;
      };

      setCategories(buildTree(data));
    } catch (err: any) {
      setError('数据库连接超时或网络错误。可能会导致数据无法显示，请检查防火墙设置。');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '保存失败');
      }
      
      await fetchCategories();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(`操作失败: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '删除失败');
      }
      await fetchCategories();
    } catch (err: any) {
      alert(`删除失败: ${err.message}`);
    }
  };

  const openModal = (category?: Category) => {
    setError('');
    if (category) {
      setEditingId(category.id);
      setFormData({ 
        name: category.name, 
        sortOrder: category.sortOrder, 
        parentId: category.parentId ? category.parentId.toString() : '',
        templateType: category.templateType || 'default'
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', sortOrder: 0, parentId: '', templateType: 'default' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ marginBottom: 0 }}>
        <div className={styles.pageHeader}>
          <div className={styles.pageIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          </div>
          <div className={styles.pageTitleWrapper}>
            <h1 className={styles.title}>产品分类管理 (3级)</h1>
            <div className={styles.pageSubtitle}>管理系统内容的分类体系，便于高效检索与大模型收录</div>
          </div>
        </div>
        <button className={styles.primaryBtn} onClick={() => openModal()}>+ 新增分类</button>
      </div>

      {error && !isModalOpen && <div className={styles.errorMsg}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>分类名称</th>
            <th>落地页模板</th>
            <th>排序权重</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} style={{textAlign: 'center', padding: '32px'}}>数据加载中...</td></tr>
          ) : categories.length === 0 ? (
            <tr><td colSpan={5} style={{textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)'}}>暂无分类数据</td></tr>
          ) : (
            categories.map(cat => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td style={{fontWeight: 500}}>
                  <div style={{ marginLeft: `${(cat.level || 0) * 24}px`, display: 'flex', alignItems: 'center' }}>
                    {(cat.level || 0) > 0 && <span style={{color: '#94a3b8', marginRight: '8px'}}>├─</span>}
                    {cat.name}
                  </div>
                </td>
                <td><span style={{background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500}}>{templateLabels[cat.templateType] || '通用'}</span></td>
                <td>{cat.sortOrder}</td>
                <td>
                  <button className={styles.actionBtn} onClick={() => openModal(cat)}>编辑</button>
                  <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(cat.id)}>删除</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editingId ? '编辑分类' : '新增分类'}</h2>
            
            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>上级分类</label>
                <select 
                  className={styles.input} 
                  value={formData.parentId}
                  onChange={e => setFormData({...formData, parentId: e.target.value})}
                  style={{ backgroundColor: '#f8fafc' }}
                >
                  <option value="">无 (作为一级分类)</option>
                  {categories.filter(c => c.id !== editingId && (c.level || 0) < 2).map(c => (
                    <option key={c.id} value={c.id}>
                      {'- '.repeat(c.level || 0)}{c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>分类名称</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="例如：特色餐饮"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>落地页模板类型</label>
                <select 
                  className={styles.input} 
                  value={formData.templateType}
                  onChange={e => setFormData({...formData, templateType: e.target.value})}
                  style={{ backgroundColor: '#f8fafc' }}
                >
                  <option value="default">通用模板</option>
                  <option value="restaurant">美食餐饮 (含招牌菜、人均消费)</option>
                  <option value="hotel">酒店民宿 (含设施服务、房型)</option>
                  <option value="attraction">景点玩乐 (含门票、开放时间)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>排序权重 (数字越大越靠前)</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={formData.sortOrder}
                  onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>取消</button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? '保存中...' : '确认保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
