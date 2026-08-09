import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
    const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

    const location = useLocation();

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
        <header style={{ 
            padding: '10px 0',
            backgroundColor: '#ececec',
            position: 'relative',
            zIndex: 100,
            borderBottom: '1px solid #e0e0e0'
        }}>
            <div className="container" style={{ maxWidth: '1500px', width: '95%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0' }}>
                
                {/* Logo */}
                <Link to="/" style={{ display: 'block', width: '190px' }}>
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
                    
                    <button 
                        className="mobile-menu-btn" 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', display: 'block' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'white', borderBottom: '1px solid #eee', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#333', textDecoration: 'none', fontSize: '18px', fontWeight: '500' }}>Home</Link>
                    <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#333', textDecoration: 'none', fontSize: '18px', fontWeight: '500' }}>Products</Link>
                    <Link to="/about-us" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#333', textDecoration: 'none', fontSize: '18px', fontWeight: '500' }}>About Us</Link>
                    <Link to="/contact-us" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#333', textDecoration: 'none', fontSize: '18px', fontWeight: '500' }}>Contact Us</Link>
                    <Link to="/general-enquiry" onClick={() => setIsMobileMenuOpen(false)} style={{ backgroundColor: '#7c5847', color: 'white', padding: '12px', textAlign: 'center', borderRadius: '4px', textDecoration: 'none', fontWeight: '600', marginTop: '10px' }}>
                        Enquire Now
                    </Link>
                </div>
            )}

            {/* Basic responsive CSS injected safely */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (min-width: 992px) {
                    .desktop-nav, .desktop-enquire { display: flex !important; }
                    .mobile-menu-btn { display: none !important; }
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}} />
        </header>
    );
}
