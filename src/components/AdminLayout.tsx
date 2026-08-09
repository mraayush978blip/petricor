import { Link, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Menu, LogOut, LayoutDashboard, MessageSquare, Tags, Package, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import '../admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'}`}>
        <div className="admin-sidebar-header">
          {isSidebarOpen && (
            <Link to="/admin" style={{ display: 'block', width: '150px' }}>
              <img src="/Logo-1-2.png" alt="Petricor" style={{ width: '100%', height: 'auto' }} />
            </Link>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
            <Menu size={24} />
          </button>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-link">
            <LayoutDashboard size={20} />
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link to="/admin/enquiries" className="admin-nav-link">
            <MessageSquare size={20} />
            {isSidebarOpen && <span>Enquiries</span>}
          </Link>
          <Link to="/admin/categories" className="admin-nav-link">
            <Tags size={20} />
            {isSidebarOpen && <span>Categories</span>}
          </Link>
          <Link to="/admin/products" className="admin-nav-link">
            <Package size={20} />
            {isSidebarOpen && <span>Products</span>}
          </Link>
          <Link to="/admin/settings" className="admin-nav-link">
            <SettingsIcon size={20} />
            {isSidebarOpen && <span>Settings</span>}
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <button onClick={handleLogout} className="admin-logout">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
