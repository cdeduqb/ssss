import styles from './page.module.css';

export default function AdminDashboard() {
  return (
    <div>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeIcon}>✨</div>
        <div className={styles.welcomeText}>
          <h1>早上好，管理员</h1>
          <p>欢迎来到您的 GEO 数字指挥中心，今天又是充满活力的一天</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>🏪</div>
          <div className={styles.statInfo}>
            <h3>已入驻店铺总数</h3>
            <p>0</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>🔥</div>
          <div className={styles.statInfo}>
            <h3>大模型页面展现量</h3>
            <p>0</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>🔗</div>
          <div className={styles.statInfo}>
            <h3>引流跳转点击数</h3>
            <p>0</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.dashboardCard}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>快捷操作</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
          您目前尚未添加任何本地生活店铺。<br />
          请先前往左侧菜单栏的 <strong>[内容分类]</strong> 创建行业分类，然后再进入 <strong>[店铺列表]</strong> 录入商家信息，最后配置美团/抖音等引流跳转链接。
        </p>
      </div>
    </div>
  );
}
