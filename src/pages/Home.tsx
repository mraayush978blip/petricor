import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductEnquiryModal from '../components/ProductEnquiryModal';
import { ProductSkeleton } from '../components/Skeleton';

export default function Home() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    
    const [categories, setCategories] = useState<string[]>([]);
    const [productsData, setProductsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [hoveredProductSlug, setHoveredProductSlug] = useState<string | null>(null);



    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = params.get('category');
        if (cat) {
            setActiveTab(cat);
        }
    }, [location]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: catData } = await supabase.from('categories').select('name').order('name');
            if (catData) setCategories(['All', ...catData.map(c => c.name)]);
            
            const { data: prodData } = await supabase.from('products').select(`*, categories(name)`);
            if (prodData) {
                // Map the data to match the expected format in the UI
                const mappedProducts = prodData.map(p => ({
                    ...p,
                    category: p.categories?.name || 'Uncategorized',
                    images: [p.primary_image_url || '', p.hover_image_url || ''].filter(Boolean)
                }));
                setProductsData(mappedProducts);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const displayedProducts = activeTab === 'All' 
        ? productsData 
        : productsData.filter(p => p.category === activeTab);

    return (
        <div style={{ paddingBottom: '0' }}>
            {/* HERO SECTION */}
            <div className="hero-wrapper" style={{ borderBottom: '1px solid #dcdcdc', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
                <div className="container hero-container" style={{ maxWidth: '1500px', width: '95%', margin: '0 auto', display: 'flex', flexWrap: 'nowrap', padding: '0' }}>
                    
                    {/* LEFT COLUMN - TEXT */}
                    <div className="hero-left" style={{ flex: '1 1 50%', borderRight: '1px solid var(--border-color)' }}>
                        <div className="hero-badge-container">
                            <span className="hero-badge-line"></span>
                            GROWN IN NEEMUCH - VERIFIED AT SOURCE
                        </div>
                        <h1 className="hero-title" style={{ fontSize: '68px', color: '#2c2c2c', margin: '0 0 5px 0', fontWeight: '700', lineHeight: '1.05', letterSpacing: '-1.5px' }}>
                            We control
                        </h1>
                        <h1 className="hero-title" style={{ fontSize: '68px', color: '#2c2c2c', margin: '0 0 5px 0', fontWeight: '700', lineHeight: '1.05', letterSpacing: '-1.5px' }}>
                            the source.
                        </h1>
                        <h1 className="hero-title-italic" style={{ fontSize: '68px', color: 'var(--primary-brown)', marginBottom: '35px', fontWeight: '500', lineHeight: '1.05', fontStyle: 'italic', letterSpacing: '-1.5px' }}>
                            You get the proof.
                        </h1>
                        <p style={{ fontSize: '16px', color: '#595959', lineHeight: '25.6px', marginBottom: '40px', maxWidth: '100%', fontWeight: '500' }}>
                            Farm-origin botanical extracts from Neemuch, India where the herbs actually grow. Every batch traceable to its field, tested by NABL-accredited labs, documented for your import market. No middlemen. No assumptions.
                        </p>
                        <div className="hero-cta-row" style={{ display: 'flex', gap: '15px', marginBottom: '50px' }}>
                            <Link to="/contact-us" className="hero-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--primary-brown)', color: '#fff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '14px', transition: 'background-color 0.2s' }}>
                                Explore Product ➔
                            </Link>
                            <Link to="/general-enquiry" className="hero-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--primary-brown)', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s' }}>
                                Enquire Now ➔
                            </Link>
                        </div>
                        
                        <div className="hero-stats" style={{ borderTop: '1px solid #eaeaea', paddingTop: '30px', display: 'flex' }}>
                            <div className="hero-stat-item" style={{ flex: '1', paddingRight: '20px' }}>
                                <h4 style={{ fontSize: '32px', color: '#2c2c2c', margin: '0 0 6px 0', fontWeight: '500', letterSpacing: '-0.5px' }}>NABL Accredited</h4>
                                <p style={{ fontSize: '11px', color: '#666', margin: 0, fontWeight: '600', textTransform: 'none', letterSpacing: '0.5px' }}>No Brokers - No Traders - Direct from source</p>
                            </div>
                            <div className="hero-stat-divider" style={{ width: '1px', backgroundColor: '#eaeaea', margin: '0 30px' }}></div>
                            <div className="hero-stat-item" style={{ flex: '1' }}>
                                <h4 style={{ fontSize: '32px', color: '#2c2c2c', margin: '0 0 6px 0', fontWeight: '500', letterSpacing: '-0.5px' }}>30+</h4>
                                <p style={{ fontSize: '11px', color: '#666', margin: 0, fontWeight: '600', textTransform: 'none', letterSpacing: '0.5px' }}>Export countries</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* RIGHT COLUMN - CREDENTIALS */}
                    <div className="hero-right" style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="compliance-wrapper">
                            <h4 className="compliance-title" style={{ fontSize: '14px', color: '#8b9caa', marginBottom: '25px', fontWeight: '600' }}>Compliance Credentials</h4>
                            
                            <div className="credentials-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="credential-card textured-card" style={{ border: '1px solid transparent', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderRadius: '6px', padding: '25px' }}>
                                    <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', margin: '0 0 4px 0', fontWeight: '700' }}>✓ IEC - Import Export Code</h3>
                                    <p style={{ fontSize: '16px', color: '#595959', margin: '0 0 8px 0' }}>Directorate General of Foreign Trade (DGFT)</p>
                                    <p style={{ fontSize: '16px', color: '#595959', margin: 0, lineHeight: '1.5' }}>Registered Indian exporter under DGFT. All international shipments dispatched under valid IEC.</p>
                                </div>
                                
                                <div className="credential-card textured-card" style={{ border: '1px solid transparent', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderRadius: '6px', padding: '25px' }}>
                                    <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', margin: '0 0 4px 0', fontWeight: '700' }}>✓ FSSAI - Food Safety Licensed</h3>
                                    <p style={{ fontSize: '16px', color: '#595959', margin: '0 0 8px 0' }}>Food Safety &amp; Standards Authority of India</p>
                                    <p style={{ fontSize: '16px', color: '#595959', margin: 0, lineHeight: '1.5' }}>FSSAI-licensed facility. Compliant with Indian food safety standards for export of botanical ingredients.</p>
                                </div>
                                
                                <div className="credential-card textured-card" style={{ border: '1px solid transparent', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderRadius: '6px', padding: '25px' }}>
                                    <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', margin: '0 0 4px 0', fontWeight: '700' }}>✓ NABL Accredited Lab Testing</h3>
                                    <p style={{ fontSize: '16px', color: '#595959', margin: '0 0 8px 0' }}>Every batch independently tested - HPLC quantified</p>
                                    <p style={{ fontSize: '16px', color: '#595959', margin: 0, lineHeight: '1.5' }}>Active compound potency, heavy metals, pesticide residues, and microbial panels verified on every lot before dispatch.</p>
                                </div>
                                
                                <div className="credential-card textured-card-highlight" style={{ borderRadius: '6px', padding: '25px' }}>
                                    <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', margin: '0 0 4px 0', fontWeight: '700' }}>📄 Complete documentation on every shipment</h3>
                                    <p style={{ fontSize: '16px', color: '#595959', margin: 0 }}>CoA - Phytosanitary - Certificate of Origin - MSDS - Allergen Declaration</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORIES / PRODUCTS SECTION */}
            <div className="container" style={{ maxWidth: '1500px', width: '95%', margin: '80px auto 0', padding: '0' }}>
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#8b6352', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>
                        BOTANICAL INGREDIENTS <span style={{ display: 'inline-block', width: '40px', height: '1px', backgroundColor: '#8b6352' }}></span>
                    </div>
                    <h2 className="section-title" style={{ fontSize: '38px', color: '#1a1a1a', margin: '0 0 5px 0', fontWeight: '600', letterSpacing: '-1px', lineHeight: '1.2' }}>
                        35 ingredients.
                    </h2>
                    <h2 className="section-title-italic" style={{ fontSize: '28px', color: '#4a5b6c', margin: 0, fontWeight: '400', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                        Farm-verified. Export-ready.
                    </h2>
                </div>
                {/* Horizontal Category Scroll */}
                <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '15px', marginBottom: '30px', msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }} className="hide-scrollbar">
                    <style dangerouslySetInnerHTML={{__html: `
                        .hide-scrollbar::-webkit-scrollbar { display: none; }
                    `}} />
                    {categories.map((cat, idx) => (
                        <button 
                            key={idx}
                            onClick={() => {
                                setActiveTab(cat);
                                navigate(`/?category=${encodeURIComponent(cat)}`, { replace: true });
                            }}
                            style={{
                                display: 'inline-block',
                                padding: '12px 24px', 
                                margin: '0 10px 0 0',
                                cursor: 'pointer', 
                                border: activeTab === cat ? '1px solid var(--primary-brown)' : '1px solid #dcdcdc', 
                                background: activeTab === cat ? 'var(--primary-brown)' : '#e8e8e8', 
                                color: activeTab === cat ? '#fff' : '#334155', 
                                borderRadius: '4px',
                                fontSize: '15px',
                                fontWeight: activeTab === cat ? '600' : '500',
                                transition: 'all 0.2s ease',
                                boxShadow: 'none'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products Grid (2-row Horizontal Scroll) */}
                {loading ? (
                    <div className="home-products-grid" style={{ 
                        display: 'grid', 
                        gridTemplateRows: 'repeat(2, 1fr)', 
                        gridAutoFlow: 'column',
                        gridAutoColumns: '260px',
                        gap: '20px', 
                        marginBottom: '80px',
                        overflowX: 'auto',
                        paddingBottom: '20px',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : (
                <div className="home-products-grid" style={{ 
                    display: 'grid', 
                    gridTemplateRows: 'repeat(2, 1fr)', 
                    gridAutoFlow: 'column',
                    gridAutoColumns: '260px',
                    gap: '20px', 
                    marginBottom: '80px',
                    overflowX: 'auto',
                    paddingBottom: '20px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#9c7361 #f0f0f0',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    {displayedProducts.map((product, idx) => (
                        <div key={idx} className="product-card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff', transition: 'transform 0.2s', width: '260px', height: '100%' }}>
                            <Link 
                                to={`/product/${product.slug}`} 
                                style={{ display: 'block', backgroundColor: '#f9f9f9', padding: '0' }}
                                onMouseEnter={() => setHoveredProductSlug(product.slug)}
                                onMouseLeave={() => setHoveredProductSlug(null)}
                            >
                                <img 
                                    src={hoveredProductSlug === product.slug && product.images && product.images[1] ? product.images[1] : (product.images ? product.images[0] : '')} 
                                    alt={product.title || product.name} 
                                    className="product-img"
                                    style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }} 
                                />
                            </Link>
                            <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <Link to={`/product/${product.slug}`} style={{ display: 'block', fontSize: '15px', color: '#222', textDecoration: 'none', fontWeight: '700', marginBottom: '3px', lineHeight: '1.3' }}>
                                    {product.title || product.name}
                                </Link>
                                <Link to={`/?category=${encodeURIComponent(product.category)}`} style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '0', lineHeight: '1.4', textDecoration: 'none', flexGrow: 1 }}>
                                    {product.category}
                                </Link>
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                    style={{ display: 'block', width: '100%', textAlign: 'center', backgroundColor: '#6b4236', color: '#fff', padding: '12px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}
                                >
                                    Enquiry
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>

            {/* FORMULATION-READY SETS */}
            <div className="formulation-section-wrapper" style={{ backgroundColor: '#fdfbf9', padding: '100px 0 60px' }}>
                <div className="container formulation-header-container" style={{ maxWidth: '1500px', width: '95%', margin: '0 auto', marginBottom: '40px' }}>
                    <div style={{ fontSize: '12px', color: '#8b6352', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '15px' }}>
                        FORMULATION-READY SETS
                    </div>
                    <h2 style={{ fontSize: '38px', color: '#222', margin: 0, fontWeight: '700', letterSpacing: '-0.5px' }}>
                        Don't just buy ingredients.
                    </h2>
                    <h2 style={{ fontSize: '36px', color: '#b28b74', margin: '5px 0 20px 0', fontWeight: '500', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                        Build product lines.
                    </h2>
                    <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginTop: '15px', maxWidth: '600px' }}>
                        Pre-validated ingredient combinations for common supplement categories. Each set ships with matching certifications and combined CoA documentation.
                    </p>
                </div>

                <div className="container" style={{ maxWidth: '1500px', width: '95%', margin: '0 auto', padding: '0' }}>
                    <div className="formulation-grid">
                                    {[
                                        { emoji: '⚡', icon: '🌿', title: 'Adaptogen Stack', desc: 'Stress, energy, hormonal balance', herbs: ['Ashwagandha', 'Brahmi', 'Shatavari'], bg: '#f4f7f4', accent: '#4a6b55' },
                                        { emoji: '🦴', icon: '🦴', title: 'Joint & Mobility', desc: 'Anti-inflammation, arthritis, sports recovery', herbs: ['Turmeric 95%', 'Boswellia', 'Ginger'], bg: '#fdf7f2', accent: '#c86b2e' },
                                        { emoji: '🛡️', icon: '🛡️', title: 'Immunity Shield', desc: 'Immune support, Vitamin C, antimicrobial', herbs: ['Amla', 'Moringa', 'Giloy', 'Black Seed'], bg: '#fef5f6', accent: '#b94e5b' },
                                        { emoji: '📊', icon: '🩸', title: 'Metabolic Support', desc: 'Blood sugar, diabetes management, weight', herbs: ['Gymnema', 'Fenugreek', 'Turmeric'], bg: '#f4f5f8', accent: '#4b5f83' },
                                        { emoji: '🧘', icon: '💧', title: 'Digestive Wellness', desc: 'Gut health, detox, digestion', herbs: ['Triphala', 'Ginger', 'Fenugreek'], bg: '#fdf9f1', accent: '#b08d43' },
                                        { emoji: '💪', icon: '💪', title: "Men's Performance", desc: 'Testosterone, energy, sports nutrition', herbs: ['Ashwagandha', 'Mucuna', 'Fenugreek'], bg: '#f5f4f6', accent: '#5c526b' }
                                    ].map((set, idx) => (
                                        <div key={idx} className="formulation-card" style={{ 
                                            backgroundColor: set.bg, 
                                            border: `1px solid rgba(0,0,0,0.04)`,
                                            borderTop: '4px solid #8b6352',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                            borderRadius: '12px',
                                            padding: '30px',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}>
                                            {/* Giant background icon/watermark */}
                                            <div style={{ position: 'absolute', right: '-15px', bottom: '-25px', fontSize: '140px', opacity: 0.04, transform: 'rotate(-15deg)', pointerEvents: 'none' }}>
                                                {set.icon}
                                            </div>
                                            
                                            {/* Top bar with icon and title */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                                                <div style={{ 
                                                    fontSize: '28px', 
                                                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', 
                                                    backdropFilter: 'blur(10px)', 
                                                    border: '1px solid rgba(255,255,255,0.8)', 
                                                    width: '64px', height: '64px', 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    borderRadius: '16px', 
                                                    color: '#8b6352', 
                                                    boxShadow: '0 8px 20px rgba(0,0,0,0.04)' 
                                                }}>
                                                    {set.emoji}
                                                </div>
                                                <div style={{ paddingTop: '8px' }}>
                                                    <h3 style={{ fontSize: '20px', color: '#111', margin: '0 0 4px', fontWeight: '800', letterSpacing: '-0.3px' }}>{set.title}</h3>
                                                    <p style={{ fontSize: '13px', color: '#8b6352', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Formulation Set</p>
                                                </div>
                                            </div>
                                            
                                            <p style={{ fontSize: '15px', color: '#555', marginBottom: '25px', lineHeight: '1.6', position: 'relative', zIndex: 1, fontWeight: '500' }}>{set.desc}</p>
                                            
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', position: 'relative', zIndex: 1 }}>
                                                {set.herbs.map(h => (
                                                    <span key={h} style={{ 
                                                        backgroundColor: '#fff', 
                                                        border: `1px solid rgba(0,0,0,0.06)`, 
                                                        color: '#222', 
                                                        padding: '8px 16px', 
                                                        borderRadius: '30px', 
                                                        fontSize: '13px', 
                                                        fontWeight: '600', 
                                                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)' 
                                                    }}>
                                                        {h}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
            </div>

            {/* BUILT FOR BUSINESS BUYERS */}
            <div style={{ backgroundColor: '#fcfaf7', color: '#333', padding: '80px 15px' }}>
                <div className="container" style={{ maxWidth: '1500px', width: '95%', margin: '0 auto' }}>
                    <div className="b2b-header" style={{ marginBottom: '50px' }}>
                        <div style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                            BUILT FOR B2B INGREDIENTS
                        </div>
                        <h2 className="section-title" style={{ fontSize: '36px', margin: '0 0 5px 0', fontWeight: 'bold', letterSpacing: '-1px' }}>Trusted by brands & formulators</h2>
                        <h2 className="section-title-italic" style={{ fontSize: '36px', color: '#777', margin: 0, fontWeight: '400', fontStyle: 'italic', letterSpacing: '-1px' }}>across 30+ countries</h2>
                    </div>

                    <div className="b2b-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {[
                            { icon: '💊', title: 'Supplement Brands', desc: 'Nutraceutical brands needing certified, spec-compliant raw material' },
                            { icon: '🏭', title: 'Contract Manufacturers', desc: 'CMOs and OEM manufacturers sourcing consistent, traceable extracts at scale' },
                            { icon: '🧪', title: 'Formulators & R&D', desc: 'Product developers who need full CoA data, HPLC specs and sample availability fast' },
                            { icon: '🏷', title: 'Private Label Brands', desc: 'White-label and private-label businesses needing branded-ready ingredient supply' },
                            { icon: '🛒', title: 'Importers & Distributors', desc: 'Regional distributors buying certified botanical ingredients for resale into local markets' },
                            { icon: '🍵', title: 'Food & Beverage', desc: 'Functional food, tea, and beverage brands sourcing food-grade standardised herbs' }
                        ].map((buyer, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '15px', padding: '20px', backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '4px' }}>
                                <div style={{ fontSize: '20px', marginTop: '2px' }}>{buyer.icon}</div>
                                <div>
                                    <h4 style={{ fontSize: '15px', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>{buyer.title}</h4>
                                    <p style={{ fontSize: '13px', color: '#777', lineHeight: '1.5', margin: 0 }}>{buyer.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAP SECTION */}
            <div className="container" style={{ maxWidth: '100%', margin: '80px auto 0', padding: '0', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '1400px' }}>
                    <img src="/images/Map-scaled.jpeg" alt="Global Export Map" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    
                    {/* Blinking Dots at root ends */}
                    {[
                        { top: '22.5%', left: '28.5%' }, // Canada West
                        { top: '38.0%', left: '28.5%' }, // USA West
                        { top: '47.0%', left: '31.5%' }, // Central America
                        { top: '33.0%', left: '36.0%' }, // USA East
                        { top: '62.5%', left: '38.5%' }, // South America West
                        { top: '57.5%', left: '43.5%' }, // South America East
                        { top: '26.0%', left: '46.5%' }, // UK
                        { top: '23.0%', left: '55.5%' }, // Eastern Europe
                        { top: '52.0%', left: '53.5%' }, // West Africa
                        { top: '59.5%', left: '60.5%' }, // South Africa
                        { top: '36.5%', left: '78.5%' }, // Japan
                        { top: '54.0%', left: '72.0%' }, // Indonesia
                        { top: '63.5%', left: '79.5%' }, // Australia
                    ].map((pos, idx) => (
                        <div key={idx} style={{ position: 'absolute', top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}>
                            {/* Expanding ring only */}
                            <div className="map-dot-ring" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '1.5px solid #8b6352', borderRadius: '50%', animation: 'pulse-ring 2s infinite', animationDelay: `${idx * 0.15}s`, zIndex: 1 }}></div>
                        </div>
                    ))}
                </div>
            </div>
            
            <ProductEnquiryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct} 
            />
        </div>
    );
}
