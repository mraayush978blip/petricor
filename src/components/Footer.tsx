import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer style={{ backgroundColor: '#f2f3f4', padding: '30px 0 15px', position: 'relative', borderTop: '1px solid #eaeaea' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* Logo - left aligned */}
                <div className="footer-logo-wrap" style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <img src="/Logo-1-2.png" alt="Petricor" style={{ width: '160px', height: 'auto' }} />
                </div>

                {/* Links + Info row */}
                <div className="footer-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'flex-start', marginBottom: '16px' }}>
                    
                    {/* Quick Links */}
                    <div style={{ minWidth: '110px' }}>
                        <h4 style={{ color: '#333', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <li><Link to="/products" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>Products</Link></li>
                            <li><Link to="/about-us" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>About Us</Link></li>
                            <li><Link to="/contact-us" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>Contact Us</Link></li>
                            <li><Link to="/general-enquiry" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>Enquire Now</Link></li>
                        </ul>
                    </div>

                    {/* Offices */}
                    <div style={{ minWidth: '190px', maxWidth: '240px' }}>
                        <h4 style={{ color: '#333', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Offices</h4>
                        <p style={{ color: '#666', fontSize: '12px', lineHeight: '1.6', margin: '0 0 8px' }}>
                            <strong style={{ color: '#555', fontSize: '12px' }}>Corporate:</strong><br />
                            Unit 602 &amp; 600B, Solitaire Corporate Park,<br />
                            Andheri East, Mumbai - 400093
                        </p>
                        <p style={{ color: '#666', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                            <strong style={{ color: '#555', fontSize: '12px' }}>Head Office:</strong><br />
                            20, Shastri Nagar, Neemuch - 458441, MP
                        </p>
                    </div>

                    {/* Contact */}
                    <div style={{ minWidth: '140px' }}>
                        <h4 style={{ color: '#333', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: '0 0 5px' }}>+91 9589794989</p>
                        <p style={{ margin: 0 }}>
                            <a href="mailto:contact@petricor.co.in" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>contact@petricor.co.in</a>
                        </p>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', textAlign: 'center' }}>
                    <p style={{ color: '#aaa', fontSize: '12px', margin: '0 0 4px' }}>
                        &copy; 2026 Petricor. All Rights Reserved.
                    </p>
                    <p style={{ color: '#bbb', fontSize: '11px', margin: 0 }}>
                        Protected by reCAPTCHA —{' '}
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#bbb', textDecoration: 'underline' }}>Privacy</a>
                        {' & '}
                        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#bbb', textDecoration: 'underline' }}>Terms</a>
                    </p>
                </div>
            </div>

            {/* Scroll to top */}
            <button 
                onClick={scrollToTop}
                style={{ 
                    position: 'absolute', 
                    bottom: '20px', 
                    right: '20px', 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    backgroundColor: 'transparent',
                    border: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#888',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eaeaea'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                <ChevronUp size={18} />
            </button>
        </footer>
    );
}
