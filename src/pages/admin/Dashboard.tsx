import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Package, Tags } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    enquiries: 0,
    products: 0,
    categories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      setStats({
        enquiries: enquiriesCount || 0,
        products: productsCount || 0,
        categories: categoriesCount || 0
      });
      
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="admin-page-title">Dashboard Overview</h1>
      
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <MessageSquare size={28} />
          </div>
          <div>
            <div className="admin-stat-label">Total Enquiries</div>
            <div className="admin-stat-value">{stats.enquiries}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <Package size={28} />
          </div>
          <div>
            <div className="admin-stat-label">Total Products</div>
            <div className="admin-stat-value">{stats.products}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <Tags size={28} />
          </div>
          <div>
            <div className="admin-stat-label">Total Categories</div>
            <div className="admin-stat-value">{stats.categories}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
