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
    navigate('/ad/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'}`}>
        <div className="admin-sidebar-header">
          {isSidebarOpen && (
            <Link to="/ad" style={{ display: 'block', width: '150px' }}>
              <img src="/Logo-1-2.png" alt="Petricor" style={{ width: '100%', height: 'auto' }} />
            </Link>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
            <Menu size={24} />
          </button>
        </div>
        <nav className="admin-nav">
          <Link to="/ad" className="admin-nav-link">
            <LayoutDashboard size={20} />
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link to="/ad/enquiries" className="admin-nav-link">
            <MessageSquare size={20} />
            {isSidebarOpen && <span>Enquiries</span>}
          </Link>
          <Link to="/ad/categories" className="admin-nav-link">
            <Tags size={20} />
            {isSidebarOpen && <span>Categories</span>}
          </Link>
          <Link to="/ad/products" className="admin-nav-link">
            <Package size={20} />
            {isSidebarOpen && <span>Products</span>}
          </Link>
          <Link to="/ad/settings" className="admin-nav-link">
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
