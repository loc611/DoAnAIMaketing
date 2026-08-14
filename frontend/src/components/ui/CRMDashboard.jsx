import React, { useState } from 'react';
import styles from './CRMDashboard.module.css';

const SALES_DATA = [
  { month: 'T1', sales: 450000000 },
  { month: 'T2', sales: 520000000 },
  { month: 'T3', sales: 480000000 },
  { month: 'T4', sales: 610000000 },
  { month: 'T5', sales: 590000000 },
  { month: 'T6', sales: 750000000 },
];

const RECENT_ORDERS = [
  { id: '#ORD-001', customer: 'Nguyễn Văn A', product: 'iPhone 16 Pro Max 256GB', status: 'Delivered', amount: 29999000 },
  { id: '#ORD-002', customer: 'Trần Thị B', product: 'MacBook Pro M3 14"', status: 'Processing', amount: 39999000 },
  { id: '#ORD-003', customer: 'Lê Văn C', product: 'iPad Pro M4 11"', status: 'Shipped', amount: 24999000 },
  { id: '#ORD-004', customer: 'Phạm Thị D', product: 'AirPods Pro 2', status: 'Pending', amount: 6499000 },
];

export default function CRMDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return styles.statusDelivered;
      case 'Processing': return styles.statusProcessing;
      case 'Shipped': return styles.statusShipped;
      default: return styles.statusPending;
    }
  };

  // Find max sales for chart height calculation
  const maxSales = Math.max(...SALES_DATA.map(d => d.sales));

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>AppleCRM.</div>
        <nav className={styles.navMenu}>
          <button className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => setActiveTab('overview')}>
            <span className={styles.icon}>📊</span> Tổng quan
          </button>
          <button className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`} onClick={() => setActiveTab('orders')}>
            <span className={styles.icon}>📦</span> Đơn hàng
          </button>
          <button className={`${styles.navItem} ${activeTab === 'customers' ? styles.active : ''}`} onClick={() => setActiveTab('customers')}>
            <span className={styles.icon}>👥</span> Khách hàng
          </button>
          <button className={`${styles.navItem} ${activeTab === 'inventory' ? styles.active : ''}`} onClick={() => setActiveTab('inventory')}>
            <span className={styles.icon}>📱</span> Tồn kho
          </button>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Tổng quan kinh doanh</h1>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>A</div>
            <span>Admin User</span>
          </div>
        </header>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Doanh thu tháng này</h3>
            <p className={styles.statValue}>{formatCurrency(750000000)}</p>
            <span className={styles.trendUp}>+15.2% vs tháng trước</span>
          </div>
          <div className={styles.statCard}>
            <h3>Đơn hàng mới</h3>
            <p className={styles.statValue}>142</p>
            <span className={styles.trendUp}>+5.4% vs tháng trước</span>
          </div>
          <div className={styles.statCard}>
            <h3>Khách hàng mới</h3>
            <p className={styles.statValue}>89</p>
            <span className={styles.trendDown}>-2.1% vs tháng trước</span>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          {/* Sales Chart (CSS Only) */}
          <section className={styles.chartSection}>
            <h2 className={styles.sectionTitle}>Biểu đồ doanh thu</h2>
            <div className={styles.barChart}>
              {SALES_DATA.map((data, index) => (
                <div key={index} className={styles.barWrapper}>
                  <div 
                    className={styles.bar} 
                    style={{ height: `${(data.sales / maxSales) * 100}%` }}
                  >
                    <div className={styles.tooltip}>{formatCurrency(data.sales)}</div>
                  </div>
                  <span className={styles.barLabel}>{data.month}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Orders */}
          <section className={styles.ordersSection}>
            <h2 className={styles.sectionTitle}>Đơn hàng gần đây</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th>Mã ĐH</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((order, i) => (
                    <tr key={i}>
                      <td className={styles.orderId}>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td><span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>{order.status}</span></td>
                      <td className={styles.amount}>{formatCurrency(order.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
