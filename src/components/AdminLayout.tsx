import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Menu, LogOut, LayoutDashboard, MessageSquare, Tags, Package, Settings as SettingsIcon, X, ChevronRight, HardDrive } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Auto-close nav popup when location changes
  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/ad/login');
  };

  const isActive = (path: string) => {
    if (path === '/ad') return location.pathname === '/ad';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-screen-layout">
      {/* Top Header Bar */}
      <header className="admin-popup-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setIsNavOpen(true)}
            className="admin-menu-popup-btn"
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Menu</span>
          </button>

          <Link to="/ad" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/logo1.webp" alt="Petricor" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '11px', backgroundColor: '#7c5847', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: '700', letterSpacing: '0.5px' }}>
              ADMIN
            </span>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={18} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </header>

      {/* Screen Pop-Up Navigation Drawer Overlay */}
      {isNavOpen && (
        <div className="admin-popup-backdrop" onClick={() => setIsNavOpen(false)}>
          <div className="admin-popup-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-popup-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/logo1.webp" alt="Petricor" style={{ height: '32px', width: 'auto' }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#7c5847', letterSpacing: '0.5px' }}>NAVIGATION</span>
              </div>
              <button 
                onClick={() => setIsNavOpen(false)}
                className="admin-popup-close-btn"
                aria-label="Close Navigation Menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="admin-popup-nav">
              <Link to="/ad" className={`admin-popup-nav-item ${isActive('/ad') ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </div>
                <ChevronRight size={16} opacity={0.5} />
              </Link>

              <Link to="/ad/enquiries" className={`admin-popup-nav-item ${isActive('/ad/enquiries') ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <MessageSquare size={20} />
                  <span>Enquiries</span>
                </div>
                <ChevronRight size={16} opacity={0.5} />
              </Link>

              <Link to="/ad/categories" className={`admin-popup-nav-item ${isActive('/ad/categories') ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Tags size={20} />
                  <span>Categories</span>
                </div>
                <ChevronRight size={16} opacity={0.5} />
              </Link>

              <Link to="/ad/products" className={`admin-popup-nav-item ${isActive('/ad/products') ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Package size={20} />
                  <span>Products</span>
                </div>
                <ChevronRight size={16} opacity={0.5} />
              </Link>

              <Link to="/ad/settings" className={`admin-popup-nav-item ${isActive('/ad/settings') ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <SettingsIcon size={20} />
                  <span>Settings</span>
                </div>
                <ChevronRight size={16} opacity={0.5} />
              </Link>

              <Link to="/ad/storage-cleanup" className={`admin-popup-nav-item ${isActive('/ad/storage-cleanup') ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <HardDrive size={20} color="#7c5847" />
                  <span>Storage Cleanup</span>
                </div>
                <ChevronRight size={16} opacity={0.5} />
              </Link>
            </nav>

            <div className="admin-popup-drawer-footer">
              <button onClick={handleLogout} className="admin-popup-logout-full">
                <LogOut size={18} />
                <span>Logout from Admin Panel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Main Content Container — Uses native document window scrolling */}
      <main className="admin-screen-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
