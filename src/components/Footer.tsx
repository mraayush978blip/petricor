import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer style={{ backgroundColor: 'var(--bg-beige)', position: 'relative', borderTop: '1px solid var(--border-color)' }} className="site-footer">
            <div className="container" style={{ maxWidth: '1500px', width: '95%', margin: '0 auto', padding: '0' }}>

                {/* Main footer row: Logo + 3 columns */}
                <div className="footer-grid footer-main-row">

                    {/* Logo Column */}
                    <div className="footer-logo-col">
                        <img src="/logo1.jpeg" alt="Petricor" className="footer-logo-img" />
                        <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                            Global Root From India | Catering to the World Market.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h4 className="footer-col-heading">Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <li><Link to="/products" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Products</Link></li>
                            <li><Link to="/about-us" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>About Us</Link></li>
                            <li><Link to="/contact-us" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Contact Us</Link></li>
                            <li><Link to="/general-enquiry" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Enquire Now</Link></li>
                        </ul>
                    </div>

                    {/* Our Offices */}
                    <div className="footer-col footer-offices-col">
                        <h4 className="footer-col-heading">Our Offices</h4>
                        <div style={{ marginBottom: '22px' }}>
                            <div style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Corporate Office</div>
                            <div style={{ color: 'var(--text-light)', fontSize: '13px', lineHeight: '1.8' }}>
                                Unit No 602 &amp; 600B, Building No 6,<br />
                                Ground Floor, Solitaire Corporate Park,<br />
                                Andheri Kurla Road, Andheri East,<br />
                                Mumbai - 400093, Maharashtra, India
                            </div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Head Office</div>
                            <div style={{ color: 'var(--text-light)', fontSize: '13px', lineHeight: '1.8' }}>
                                20, Shastri Nagar, Neemuch - 458441,<br />
                                Madhya Pradesh, India
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-col">
                        <h4 className="footer-col-heading">Contact Info</h4>
                        <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: '0 0 12px' }}>+91 9589794989</p>
                        <p style={{ margin: 0 }}>
                            <a href="mailto:contact@petricor.co.in" style={{ color: 'var(--text-light)', textDecoration: 'none', fontSize: '14px' }}>contact@petricor.co.in</a>
                        </p>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', paddingBottom: '18px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-light)', fontSize: '13px', margin: 0 }}>
                        &copy; 2026 Petricor All Rights Reserved
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
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#888',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0e0e0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                <ChevronUp size={18} />
            </button>
        </footer>
    );
}
