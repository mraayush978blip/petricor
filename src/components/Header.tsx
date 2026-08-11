import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
    const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);

    const location = useLocation();

    // Handle scroll transition with smooth threshold (optimized against scroll re-render lag)
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 40;
            setIsScrolled(prev => (prev !== scrolled ? scrolled : prev));
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
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
        color: 'var(--text-dark)',
        textDecoration: 'none',
        fontWeight: isActive(path) ? '600' as const : '500' as const,
        fontSize: '15px',
        paddingBottom: '4px',
        borderBottom: isActive(path) ? '2px solid var(--primary-brown)' : '2px solid transparent',
        transition: 'all 0.2s ease'
    });

    const getMobileLinkStyle = (path: string) => {
        const active = isActive(path);
        return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: active ? 'var(--primary-brown)' : '#2c2c2c',
            textDecoration: 'none',
            fontSize: '18px',
            fontFamily: "'Manrope', sans-serif",
            fontWeight: active ? '700' as const : '500' as const,
            padding: '16px 4px',
            borderBottom: '1px solid #eee7df',
            transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)'
        };
    };

    return (
        <>
            {/* Fixed height spacer to prevent page layout jumps during header resize */}
            <div style={{ height: '76px' }} />
            <header style={{
                padding: '18px 0',
                backgroundColor: isScrolled ? '#ffffff' : '#ffffff',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                boxShadow: isScrolled ? '0 4px 25px rgba(0,0,0,0.08)' : '0 1px 10px rgba(0,0,0,0.03)',
                borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(0,0,0,0.03)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 1000,
                opacity: isMobileMenuOpen ? 0 : 1,
                pointerEvents: isMobileMenuOpen ? 'none' : 'auto',
                transition: 'background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, opacity 0.22s ease'
            }}>
                <div className="container" style={{ maxWidth: '1280px', width: '95%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    {/* Logo - Fixed height for 100% smooth scroll without layout shifts */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img
                            src="/logo1.jpeg"
                            alt="Petricor"
                            className="header-logo-img"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav" style={{ display: 'none', alignItems: 'center', gap: '35px' }}>
                        <Link to="/" style={getLinkStyle('/')}>Home</Link>
                        <Link to="/products" style={getLinkStyle('/products')}>Products</Link>

                        {/* Desktop Category Dropdown */}
                        <div
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setShowCategoriesMenu(true)}
                            onMouseLeave={() => setShowCategoriesMenu(false)}
                        >
                            <button
                                style={{
                                    ...getLinkStyle('/products?category='),
                                    background: 'none',
                                    border: 'none',
                                    padding: '0 0 4px 0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                Category
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: showCategoriesMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {/* Dropdown Content */}
                            {showCategoriesMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    paddingTop: '12px',
                                    zIndex: 1000,
                                    width: '260px'
                                }}>
                                    <div style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '4px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '0',
                                            height: '0',
                                            borderLeft: '8px solid transparent',
                                            borderRight: '8px solid transparent',
                                            borderBottom: '8px solid var(--primary-brown)'
                                        }}></div>

                                        {/* Scrollable category list */}
                                        <div className="nav-dropdown-scroll" style={{
                                            maxHeight: '60vh',
                                            overflowY: 'auto',
                                            padding: '10px 0',
                                            borderRadius: '0 0 8px 8px'
                                        }}>
                                            {categories.map(category => (
                                                <Link
                                                    key={category.id}
                                                    to={`/products?category=${encodeURIComponent(category.name)}`}
                                                    style={{
                                                        display: 'block',
                                                        padding: '12px 24px',
                                                        color: '#4a4a4a',
                                                        textDecoration: 'none',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onClick={() => setShowCategoriesMenu(false)}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#fdfbf9';
                                                        e.currentTarget.style.color = '#8b6352';
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
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/about-us" style={getLinkStyle('/about-us')}>About Us</Link>
                        <Link to="/contact-us" style={getLinkStyle('/contact-us')}>Contact Us</Link>
                    </nav>

                    {/* Right Side / Mobile Menu Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="desktop-enquire" style={{ display: 'none', alignItems: 'center', gap: '20px' }}>
                            <Link to="/general-enquiry" style={{ backgroundColor: 'var(--primary-brown)', color: 'white', padding: '12px 30px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '15px', transition: 'all 0.2s ease' }}>
                                Enquire Now
                            </Link>
                        </div>

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

                {/* Responsive CSS & animations */}
                <style dangerouslySetInnerHTML={{
                    __html: `
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
                        z-index: 1001;
                        display: block;
                    }
                    .hamburger span {
                        display: block;
                        position: absolute;
                        height: 2.5px;
                        width: 100%;
                        background: #2c2c2c;
                        border-radius: 2px;
                        opacity: 1;
                        left: 0;
                        transform: rotate(0deg);
                        transition: .25s cubic-bezier(0.2, 0, 0, 1);
                    }
                    .hamburger span:nth-child(1) { top: 0px; }
                    .hamburger span:nth-child(2) { top: 8px; }
                    .hamburger span:nth-child(3) { top: 16px; }

                    .hamburger.open span:nth-child(1) {
                        top: 8px;
                        transform: rotate(135deg);
                        background: var(--primary-brown);
                    }
                    .hamburger.open span:nth-child(2) {
                        opacity: 0;
                        left: -60px;
                    }
                    .hamburger.open span:nth-child(3) {
                        top: 8px;
                        transform: rotate(-135deg);
                        background: var(--primary-brown);
                    }

                    /* Slide-in Mobile Drawer (App-Themed Luxury UI) */
                    .mobile-nav-drawer {
                        position: fixed;
                        top: 0;
                        right: 0;
                        width: 320px;
                        max-width: 88vw;
                        height: 100vh;
                        height: 100dvh;
                        background: linear-gradient(180deg, #fbf9f6 0%, #f4f0e9 100%);
                        box-shadow: -15px 0 45px rgba(0,0,0,0.18);
                        z-index: 1002;
                        display: flex;
                        flex-direction: column;
                        transform: translateX(100%);
                        transition: transform 0.22s cubic-bezier(0.2, 0, 0, 1);
                        overflow: hidden;
                        overscroll-behavior: none;
                        border-top-left-radius: 24px;
                        border-bottom-left-radius: 24px;
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
                        background-color: rgba(0,0,0,0.5);
                        z-index: 1001;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.22s cubic-bezier(0.2, 0, 0, 1);
                        overscroll-behavior: none;
                    }
                    .mobile-nav-overlay.open {
                        opacity: 1;
                        pointer-events: auto;
                        backdrop-filter: blur(4px);
                        -webkit-backdrop-filter: blur(4px);
                    }
                ` }} />
            </header>

            {/* Mobile Nav Overlay (Backdrop) */}
            <div
                className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Mobile Nav Drawer */}
            <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                {/* Header branding & close button inside drawer */}
                <div style={{ padding: '22px 20px 18px 20px', borderBottom: '1px solid #eae4dc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <img
                            src="/logo1.jpeg"
                            alt="Petricor Logo"
                            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                        />
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: '#f2eae2',
                            color: '#795548',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '9.5px',
                            fontWeight: '700',
                            letterSpacing: '0.6px',
                            marginTop: '8px',
                            textTransform: 'uppercase'
                        }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#795548' }}></span>
                            Grown in Neemuch • Export Verified
                        </div>
                    </div>

                    {/* Luxury SVG Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close Menu"
                        style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5dfd6',
                            color: '#2c2c2c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            transition: 'all 0.15s ease',
                            flexShrink: 0
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Drawer Menu Items */}
                <div style={{ flex: '1', overflowY: 'auto', padding: '20px 20px', display: 'flex', flexDirection: 'column' }}>

                    <Link to="/" style={getMobileLinkStyle('/')}>
                        <span>Home</span>
                        <span style={{ fontSize: '14px', color: '#795548' }}>→</span>
                    </Link>

                    <Link to="/products" style={getMobileLinkStyle('/products')}>
                        <span>All Products</span>
                        <span style={{ fontSize: '14px', color: '#795548' }}>→</span>
                    </Link>

                    {/* Mobile Category Collapsible */}
                    <div style={{ borderBottom: '1px solid #eee7df' }}>
                        <button
                            onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                color: isMobileCategoryOpen ? 'var(--primary-brown)' : '#2c2c2c',
                                fontSize: '18px',
                                fontFamily: "'Manrope', sans-serif",
                                fontWeight: isMobileCategoryOpen ? '700' : '500',
                                padding: '16px 4px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>Categories</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', backgroundColor: '#f3ece6', color: '#795548', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                                    {categories.length}
                                </span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isMobileCategoryOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </button>

                        <div style={{
                            maxHeight: isMobileCategoryOpen ? '50vh' : '0px',
                            overflowY: 'auto',
                            transition: 'max-height 0.3s cubic-bezier(0.2, 0, 0, 1)',
                            backgroundColor: 'transparent'
                        }}>
                            <div style={{ padding: '0 0 12px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {categories.map(category => (
                                    <Link
                                        key={category.id}
                                        to={`/products?category=${encodeURIComponent(category.name)}`}
                                        style={{
                                            display: 'block',
                                            padding: '6px 0',
                                            color: '#666666',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            fontFamily: "'Inter', sans-serif",
                                            fontWeight: '500',
                                            transition: 'color 0.15s ease'
                                        }}
                                    >
                                        • {category.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link to="/about-us" style={getMobileLinkStyle('/about-us')}>
                        <span>About Us</span>
                        <span style={{ fontSize: '14px', color: '#795548' }}>→</span>
                    </Link>

                    <Link to="/contact-us" style={getMobileLinkStyle('/contact-us')}>
                        <span>Contact Us</span>
                        <span style={{ fontSize: '14px', color: '#795548' }}>→</span>
                    </Link>
                </div>

                {/* Drawer Footer CTA */}
                <div style={{ padding: '20px', borderTop: '1px solid #eae4dc', backgroundColor: '#faf6f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link to="/general-enquiry" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--primary-brown)',
                        color: '#ffffff',
                        padding: '14px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        letterSpacing: '0.3px',
                        boxShadow: '0 4px 14px rgba(121, 85, 72, 0.2)',
                        transition: 'all 0.2s ease'
                    }}>
                        Enquire Now  →
                    </Link>
                    <div style={{ textAlign: 'center', fontSize: '10.5px', color: '#888', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '4px' }}>
                        NABL Testing Verified • DGFT Exporter
                    </div>
                </div>
            </div>
        </>
    );
}
