import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Menu, LogOut, LayoutDashboard, MessageSquare, Tags, Package, Settings as SettingsIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/ad/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && isMobile && (
        <div 
          className="admin-sidebar-overlay open" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'}`}>
        <div className="admin-sidebar-header">
          {isSidebarOpen && (
            <Link to="/ad" style={{ display: 'block', width: '130px' }}>
              <img src="/Logo-1-2.png" alt="Petricor" style={{ width: '100%', height: 'auto' }} />
            </Link>
          )}
          {!isMobile && (
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="admin-desktop-toggle">
              <Menu size={24} />
            </button>
          )}
          {isMobile && isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
              <X size={24} />
            </button>
          )}
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
          <div className="admin-header-left">
            {isMobile && (
              <button 
                className="admin-mobile-menu-btn" 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
            )}
          </div>
          
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
