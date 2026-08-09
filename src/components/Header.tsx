import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
    const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
    const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);

    const location = useLocation();

    // Handle scroll transition
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname, location.search]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => { 
            document.body.style.overflow = '';
            document.documentElement.style.overflow = ''; 
        };
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
        fontSize: '15px',
        paddingBottom: '4px',
        borderBottom: isActive(path) ? '2px solid #7c5847' : '2px solid transparent',
        transition: 'all 0.2s ease'
    });

    const getMobileLinkStyle = (path: string) => {
        const active = isActive(path);
        return {
            display: 'flex',
            alignItems: 'center',
            color: active ? '#7c5847' : '#4a4a4a',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: active ? '600' as const : '500' as const,
            borderBottom: '1px solid #f0f0f0',
            padding: '16px 20px',
            backgroundColor: active ? '#fcf9f8' : 'transparent',
            borderLeft: active ? '4px solid #7c5847' : '4px solid transparent',
            transition: 'all 0.2s ease'
        };
    };

    return (
        <>
            {/* Spacer to prevent content from hiding under fixed header */}
            <div style={{ height: isScrolled ? '65px' : '85px', transition: 'height 0.15s ease-out' }} />
            <header style={{ 
                padding: isScrolled ? '10px 0' : '20px 0',
                backgroundColor: isScrolled ? 'rgba(236, 236, 236, 0.95)' : '#ececec',
                backdropFilter: isScrolled ? 'blur(10px)' : 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderBottom: isScrolled ? '1px solid #ddd' : '1px solid #e0e0e0',
                boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease-out'
            }}>
                <div className="container" style={{ maxWidth: '1500px', width: '95%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0' }}>
                    
                    {/* Logo - Smooth scaling */}
                    <Link to="/" style={{ display: 'block', width: isScrolled ? '120px' : '140px', transition: 'width 0.15s ease-out' }}>
                        <img src="/Logo-1-2.png" alt="Petricor" style={{ width: '100%', height: 'auto' }} />
                    </Link>

                    {/* Desktop Nav (Centered) */}
                    <nav className="desktop-nav" style={{ display: 'none', gap: '40px', alignItems: 'center', margin: '0 auto' }}>
                        <Link to="/" style={getLinkStyle('/')}>Home</Link>
                        <Link to="/products" style={getLinkStyle('/products')}>Products</Link>
                        
                        {/* Categories Dropdown Container */}
                        <div 
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setShowCategoriesMenu(true)}
                            onMouseLeave={() => setShowCategoriesMenu(false)}
                        >
                            <Link to="/products" style={{ ...getLinkStyle('/products'), display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none', background: 'none' }}>
                                Category 
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showCategoriesMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </Link>
                            
                            {/* Dropdown Menu */}
                            {showCategoriesMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    borderRadius: '8px',
                                    padding: '10px 0',
                                    minWidth: '220px',
                                    zIndex: 1000,
                                    marginTop: '20px',
                                    border: '1px solid #eee'
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
                                                padding: '10px 24px', 
                                                color: '#4a4a4a', 
                                                textDecoration: 'none',
                                                fontSize: '14px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = '#fdf9f7';
                                                e.currentTarget.style.color = '#7c5847';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#4a4a4a';
                                            }}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button className="desktop-enquire" style={{ backgroundColor: '#7c5847', border: 'none', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', padding: '0', transition: 'background-color 0.2s' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                        <Link to="/general-enquiry" className="desktop-enquire" style={{ backgroundColor: '#7c5847', color: 'white', padding: '10px 28px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '15px', display: 'none', transition: 'background-color 0.2s' }}>
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
                    
                    /* Hamburger Animation */
                    .hamburger {
                        width: 26px;
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
                        background: #4a4a4a;
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
                        width: 300px;
                        height: 100vh;
                        height: 100dvh; /* Better for mobile Safari */
                        background-color: #ffffff;
                        box-shadow: -10px 0 30px rgba(0,0,0,0.08);
                        z-index: 999;
                        display: flex;
                        flex-direction: column;
                        transform: translateX(100%);
                        transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
                        overflow: hidden;
                        overscroll-behavior: none;
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
                        height: 100dvh;
                        background-color: rgba(0,0,0,0.6);
                        z-index: 998;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.4s ease;
                        overscroll-behavior: none;
                    }
                    .mobile-nav-overlay.open {
                        opacity: 1;
                        pointer-events: auto;
                        backdrop-filter: blur(3px);
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
                <div style={{ flex: '1', overflowY: 'auto', padding: '90px 0 20px', display: 'flex', flexDirection: 'column' }}>
                    <Link to="/" style={getMobileLinkStyle('/')}>Home</Link>
                    <Link to="/products" style={getMobileLinkStyle('/products')}>Products</Link>
                    
                    {/* Mobile Category Dropdown */}
                    <div style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <button 
                            onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                            style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                color: '#4a4a4a',
                                fontSize: '18px',
                                fontWeight: '500',
                                padding: '16px 20px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderLeft: '4px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Category
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isMobileCategoryOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        
                        <div style={{ 
                            maxHeight: isMobileCategoryOpen ? '500px' : '0px', 
                            overflow: 'hidden', 
                            transition: 'all 0.3s ease',
                            backgroundColor: '#fcf9f8'
                        }}>
                            {categories.map(category => (
                                <Link 
                                    key={category.id}
                                    to={`/products?category=${encodeURIComponent(category.name)}`}
                                    style={{ 
                                        display: 'block', 
                                        padding: '12px 20px 12px 40px', 
                                        color: '#7c5847', 
                                        textDecoration: 'none',
                                        fontSize: '15px'
                                    }}
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <Link to="/about-us" style={getMobileLinkStyle('/about-us')}>About Us</Link>
                    <Link to="/contact-us" style={getMobileLinkStyle('/contact-us')}>Contact Us</Link>
                </div>
                
                <div style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
                    <Link to="/general-enquiry" style={{ 
                        display: 'block',
                        backgroundColor: '#7c5847', 
                        color: 'white', 
                        padding: '14px', 
                        textAlign: 'center', 
                        borderRadius: '4px', 
                        textDecoration: 'none', 
                        fontWeight: '600', 
                        fontSize: '16px',
                        boxShadow: '0 4px 10px rgba(124, 88, 71, 0.2)'
                    }}>
                        Enquire Now
                    </Link>
                </div>
            </div>
        </>
    );
}

