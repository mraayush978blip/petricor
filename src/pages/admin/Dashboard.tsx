import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Package, Tags, HardDrive, Database, CheckCircle2, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    enquiries: 0,
    products: 0,
    categories: 0,
    events: 0
  });

  const [storageInfo, setStorageInfo] = useState({
    fileCount: 0,
    totalSizeBytes: 0,
    totalSizeMB: '0.00',
    usedPercent: 0,
    loadingStorage: true
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchStorageMetrics();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    
    const { count: enquiriesCount } = await supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true });
      
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    const { count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    setStats({
      enquiries: enquiriesCount || 0,
      products: productsCount || 0,
      categories: categoriesCount || 0,
      events: eventsCount || 0
    });
    
    setLoading(false);
  };

  const fetchStorageMetrics = async () => {
    try {
      let totalBytes = 0;
      let fileCount = 0;

      // 1. List root directory items
      const { data: rootData } = await supabase.storage.from('product-images').list('', { limit: 1000 });
      if (rootData) {
        rootData.forEach(item => {
          if (item.metadata && item.metadata.size) {
            totalBytes += item.metadata.size;
            fileCount++;
          }
        });
      }

      // 2. List products subfolder items
      const { data: productsFolderData } = await supabase.storage.from('product-images').list('products', { limit: 1000 });
      if (productsFolderData) {
        productsFolderData.forEach(item => {
          if (item.metadata && item.metadata.size) {
            totalBytes += item.metadata.size;
            fileCount++;
          }
        });
      }

      // 3. Database query
      const { data: dbProducts } = await supabase.from('products').select('primary_image_url, hover_image_url');
      let totalDbImageCount = 0;
      if (dbProducts) {
        dbProducts.forEach(p => {
          if (p.primary_image_url) totalDbImageCount++;
          if (p.hover_image_url) totalDbImageCount++;
        });
      }

      const finalCount = Math.max(fileCount, totalDbImageCount);
      const finalBytes = totalBytes > 0 ? totalBytes : (finalCount * 350 * 1024);
      const sizeMB = (finalBytes / (1024 * 1024)).toFixed(2);
      const freeTierLimitMB = 1024;
      const usedPercent = Math.min(100, Math.max(1, Math.round((parseFloat(sizeMB) / freeTierLimitMB) * 100)));

      setStorageInfo({
        fileCount: finalCount,
        totalSizeBytes: finalBytes,
        totalSizeMB: sizeMB,
        usedPercent: usedPercent,
        loadingStorage: false
      });
    } catch (e) {
      console.error('Error fetching storage stats:', e);
      setStorageInfo(prev => ({ ...prev, loadingStorage: false }));
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="admin-page-title">Dashboard Overview</h1>
      
      {/* Hyperlinked Dashboard Stat Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '30px' }}>
        <Link to="/ad/enquiries" className="admin-stat-card-link">
          <div className="admin-stat-icon blue">
            <MessageSquare size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="admin-stat-label">Total Enquiries</div>
            <div className="admin-stat-value">{stats.enquiries}</div>
          </div>
          <ArrowRight size={18} color="#aaa" />
        </Link>

        <Link to="/ad/products" className="admin-stat-card-link">
          <div className="admin-stat-icon green">
            <Package size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="admin-stat-label">Total Products</div>
            <div className="admin-stat-value">{stats.products}</div>
          </div>
          <ArrowRight size={18} color="#aaa" />
        </Link>

        <Link to="/ad/categories" className="admin-stat-card-link">
          <div className="admin-stat-icon purple">
            <Tags size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="admin-stat-label">Total Categories</div>
            <div className="admin-stat-value">{stats.categories}</div>
          </div>
          <ArrowRight size={18} color="#aaa" />
        </Link>

        <Link to="/ad/events" className="admin-stat-card-link">
          <div className="admin-stat-icon" style={{ backgroundColor: '#fff4eb', color: '#7c5847' }}>
            <Package size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="admin-stat-label">Total Events</div>
            <div className="admin-stat-value">{stats.events}</div>
          </div>
          <ArrowRight size={18} color="#aaa" />
        </Link>
      </div>

      {/* Supabase Storage & Database Usage Overview Widgets */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
        Supabase Cloud Usage & Storage
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Hyperlinked Media Storage Card */}
        <Link to="/ad/storage-cleanup" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-card-link" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '10px', backgroundColor: '#fff4eb', borderRadius: '8px', color: '#7c5847' }}>
                  <HardDrive size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, color: '#2c2c2c' }}>Supabase Media Storage</h3>
                  <span style={{ fontSize: '12px', color: '#888' }}>product-images bucket • Click to Manage</span>
                </div>
              </div>
              <span style={{ fontSize: '11px', backgroundColor: '#e6ffed', color: '#38a169', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
                Free Tier (1 GB)
              </span>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>
                <span>{storageInfo.totalSizeMB} MB Used</span>
                <span>1 GB Quota</span>
              </div>

              {/* Quota Progress Bar */}
              <div style={{ height: '8px', backgroundColor: '#f0ece7', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.max(2, storageInfo.usedPercent)}%`, 
                  backgroundColor: storageInfo.usedPercent > 80 ? '#e53e3e' : '#7c5847', 
                  borderRadius: '4px', 
                  transition: 'width 0.5s ease-in-out' 
                }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', borderTop: '1px solid #f4f0eb', paddingTop: '10px' }}>
              <span>{storageInfo.fileCount} Storage Files</span>
              <span style={{ color: '#7c5847', fontWeight: '600' }}>Open Storage Bucket Manager ➔</span>
            </div>
          </div>
        </Link>

        {/* Database Rows Card */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #eaeaea', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '10px', backgroundColor: '#eef2ff', borderRadius: '8px', color: '#4f46e5' }}>
                <Database size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, color: '#2c2c2c' }}>PostgreSQL Database</h3>
                <span style={{ fontSize: '12px', color: '#888' }}>Supabase Live DB</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#38a169', fontWeight: '700' }}>
              <span style={{ fontSize: '11px', backgroundColor: '#e6ffed', color: '#38a169', padding: '3px 8px', borderRadius: '12px', fontWeight: '700', marginRight: '8px' }}>
                Free Tier (500 MB)
              </span>
              <CheckCircle2 size={14} /> Healthy
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', padding: '12px 0', backgroundColor: '#faf8f5', borderRadius: '6px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#7c5847' }}>{stats.products}</div>
              <div style={{ fontSize: '11px', color: '#777' }}>Products</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#7c5847' }}>{stats.categories}</div>
              <div style={{ fontSize: '11px', color: '#777' }}>Categories</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#7c5847' }}>{stats.enquiries}</div>
              <div style={{ fontSize: '11px', color: '#777' }}>Enquiries</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#7c5847' }}>{stats.events}</div>
              <div style={{ fontSize: '11px', color: '#777' }}>Events</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', paddingTop: '4px' }}>
            Total Database Records: <strong>{stats.products + stats.categories + stats.enquiries + stats.events} entries</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
