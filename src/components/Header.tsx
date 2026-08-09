import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
    const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname, location.search]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*').order('name');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const getLinkStyle = (path: string) => ({
        color: '#4a4a4a',
        textDecoration: 'none',
        fontWeight: isActive(path) ? '600' as const : '500' as const,
        fontSize: '14px',
        paddingBottom: '4px',
        borderBottom: isActive(path) ? '2px solid #b3b3b3' : '2px solid transparent',
        transition: 'all 0.2s ease'
    });

    return (
        <>
            <header style={{ 
                padding: '10px 0',
                backgroundColor: '#ececec',
                position: 'sticky', // Fixed the header to top
                top: 0,
                zIndex: 1000,
                borderBottom: '1px solid #e0e0e0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <div className="container" style={{ maxWidth: '1500px', width: '95%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0' }}>
                    
                    {/* Logo - Reduced size */}
                    <Link to="/" style={{ display: 'block', width: '130px' }}>
                        <img src="/Logo-1-2.png" alt="Petricor" style={{ width: '100%', height: 'auto' }} />
                    </Link>

                    {/* Desktop Nav (Centered) */}
                    <nav className="desktop-nav" style={{ display: 'none', gap: '35px', alignItems: 'center', margin: '0 auto' }}>
                        <Link to="/" style={getLinkStyle('/')}>Home</Link>
                        <Link to="/products" style={getLinkStyle('/products')}>Products</Link>
                        
                        {/* Categories Dropdown Container */}
                        <div 
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setShowCategoriesMenu(true)}
                            onMouseLeave={() => setShowCategoriesMenu(false)}
                        >
                            <Link to="/products" style={{ ...getLinkStyle('/products'), display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', border: 'none', background: 'none' }}>
                                Category <span style={{ fontSize: '10px' }}>▼</span>
                            </Link>
                            
                            {/* Dropdown Menu */}
                            {showCategoriesMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    borderRadius: '8px',
                                    padding: '15px 0',
                                    minWidth: '200px',
                                    zIndex: 1000,
                                    marginTop: '15px'
                                }}>
                                    {/* Triangle pointer */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '0',
                                        height: '0',
                                        borderLeft: '8px solid transparent',
                                        borderRight: '8px solid transparent',
                                        borderBottom: '8px solid #fff'
                                    }}></div>
                                    
                                    {categories.map(category => (
                                        <Link 
                                            key={category.id}
                                            to={`/products?category=${encodeURIComponent(category.name)}`}
                                            style={{ 
                                                display: 'block', 
                                                padding: '8px 20px', 
                                                color: '#333', 
                                                textDecoration: 'none',
                                                fontSize: '14px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <Link to="/about-us" style={getLinkStyle('/about-us')}>About Us</Link>
                        <Link to="/contact-us" style={getLinkStyle('/contact-us')}>Contact Us</Link>
                    </nav>

                    {/* Right Side / Mobile Menu Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button className="desktop-enquire" style={{ backgroundColor: '#8b6352', border: 'none', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', padding: '0' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                        <Link to="/general-enquiry" className="desktop-enquire" style={{ backgroundColor: '#8b6352', color: 'white', padding: '10px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '14px', display: 'none' }}>
                            Enquire Now
                        </Link>
                        
                        {/* Animated Hamburger Menu */}
                        <button 
                            className={`mobile-menu-btn hamburger ${isMobileMenuOpen ? 'open' : ''}`} 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>

                {/* Basic responsive CSS & animations injected safely */}
                <style dangerouslySetInnerHTML={{__html: `
                    @media (min-width: 992px) {
                        .desktop-nav, .desktop-enquire { display: flex !important; }
                        .mobile-menu-btn { display: none !important; }
                    }
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    
                    /* Hamburger Animation */
                    .hamburger {
                        width: 24px;
                        height: 20px;
                        position: relative;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        padding: 0;
                        z-index: 1001; /* Above the mobile menu */
                        display: block;
                    }
                    .hamburger span {
                        display: block;
                        position: absolute;
                        height: 2px;
                        width: 100%;
                        background: #333;
                        border-radius: 2px;
                        opacity: 1;
                        left: 0;
                        transform: rotate(0deg);
                        transition: .25s ease-in-out;
                    }
                    .hamburger span:nth-child(1) { top: 0px; }
                    .hamburger span:nth-child(2) { top: 9px; }
                    .hamburger span:nth-child(3) { top: 18px; }

                    .hamburger.open span:nth-child(1) {
                        top: 9px;
                        transform: rotate(135deg);
                    }
                    .hamburger.open span:nth-child(2) {
                        opacity: 0;
                        left: -60px;
                    }
                    .hamburger.open span:nth-child(3) {
                        top: 9px;
                        transform: rotate(-135deg);
                    }

                    /* Slide-in Mobile Drawer */
                    .mobile-nav-drawer {
                        position: fixed;
                        top: 0;
                        right: 0;
                        width: 280px;
                        height: 100vh;
                        background-color: #fff;
                        box-shadow: -5px 0 15px rgba(0,0,0,0.1);
                        z-index: 999;
                        padding: 80px 30px 30px;
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        transform: translateX(100%);
                        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .mobile-nav-drawer.open {
                        transform: translateX(0);
                    }
                    
                    /* Overlay Backdrop */
                    .mobile-nav-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        background-color: rgba(0,0,0,0.5);
                        z-index: 998;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.3s ease-in-out;
                    }
                    .mobile-nav-overlay.open {
                        opacity: 1;
                        pointer-events: auto;
                        backdrop-filter: blur(2px);
                    }
                `}} />
            </header>

            {/* Mobile Nav Overlay (Backdrop) */}
            <div 
                className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Mobile Nav Drawer */}
            <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                <Link to="/" style={{ color: '#333', textDecoration: 'none', fontSize: '18px', fontWeight: '500', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Home</Link>
                <Link to="/products" style={{ color: '#333', textDecoration: 'none', fontSize: '18px', fontWeight: '500', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Products</Link>
                <Link to="/about-us" style={{ color: '#333', textDecoration: 'none', fontSize: '18px', fontWeight: '500', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>About Us</Link>
                <Link to="/contact-us" style={{ color: '#333', textDecoration: 'none', fontSize: '18px', fontWeight: '500', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Contact Us</Link>
                <Link to="/general-enquiry" style={{ backgroundColor: '#7c5847', color: 'white', padding: '14px', textAlign: 'center', borderRadius: '4px', textDecoration: 'none', fontWeight: '600', marginTop: '20px' }}>
                    Enquire Now
                </Link>
            </div>
        </>
    );
}

