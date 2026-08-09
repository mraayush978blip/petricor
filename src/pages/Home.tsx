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
        <div style={{ paddingBottom: '60px' }}>
            {/* HERO SECTION */}
            <div style={{ backgroundColor: '#ececec', padding: '60px 0', borderBottom: '1px solid #dcdcdc' }}>
                <div className="container" style={{ maxWidth: '1500px', width: '95%', margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
                    
                    {/* LEFT COLUMN - TEXT */}
                    <div className="hero-left" style={{ flex: '1 1 50%', padding: '0 50px 0 0', borderRight: '1px solid #d5d5d5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b28b74', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '25px', textTransform: 'uppercase' }}>
                            <span style={{ display: 'inline-block', width: '24px', height: '1px', backgroundColor: '#b28b74' }}></span>
                            GROWN IN NEEMUCH - VERIFIED AT SOURCE
                        </div>
                        <h1 className="hero-title" style={{ fontSize: '56px', color: '#333', margin: '0 0 5px 0', fontWeight: 'bold', lineHeight: '1.1', letterSpacing: '-1px' }}>
                            We control
                        </h1>
                        <h1 className="hero-title" style={{ fontSize: '56px', color: '#333', margin: '0 0 5px 0', fontWeight: 'bold', lineHeight: '1.1', letterSpacing: '-1px' }}>
                            the source.
                        </h1>
                        <h1 className="hero-title-italic" style={{ fontSize: '56px', color: '#8b6352', marginBottom: '35px', fontWeight: '500', lineHeight: '1.1', fontStyle: 'italic', letterSpacing: '-1px' }}>
                            You get the proof.
                        </h1>
                        <p style={{ fontSize: '15px', color: '#5a6773', lineHeight: '1.7', marginBottom: '40px', maxWidth: '420px', fontWeight: '500' }}>
                            Farm-origin botanical extracts from Neemuch, India where the herbs actually grow. Every batch traceable to its field, tested by NABL-accredited labs, documented for your import market. No middlemen. No assumptions.
                        </p>
                        <div className="hero-cta-row" style={{ display: 'flex', gap: '15px', marginBottom: '50px' }}>
                            <Link to="/contact-us" className="hero-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#8b6352', color: '#fff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}>
                                Explore Product ➔
                            </Link>
                            <Link to="/general-enquiry" className="hero-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', border: '1px solid #dcdcdc', color: '#8b6352', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}>
                                Enquire Now ➔
                            </Link>
                        </div>
                        
                        <div className="hero-stats" style={{ borderTop: '1px solid #dcdcdc', paddingTop: '30px', display: 'flex' }}>
                            <div className="hero-stat-item" style={{ flex: '1', paddingRight: '20px' }}>
                                <h4 style={{ fontSize: '22px', color: '#333', margin: '0 0 8px 0', fontWeight: '500' }}>NABL Accredited</h4>
                                <p style={{ fontSize: '11px', color: '#666', margin: 0, fontWeight: '500' }}>No Brokers - No Traders - Direct from source</p>
                            </div>
                            <div className="hero-stat-divider" style={{ width: '1px', backgroundColor: '#dcdcdc', margin: '0 20px' }}></div>
                            <div className="hero-stat-item" style={{ flex: '1' }}>
                                <h4 style={{ fontSize: '22px', color: '#333', margin: '0 0 8px 0', fontWeight: '500' }}>30+</h4>
                                <p style={{ fontSize: '11px', color: '#666', margin: 0, fontWeight: '500' }}>Export countries</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* RIGHT COLUMN - CREDENTIALS */}
                    <div className="hero-right" style={{ flex: '1 1 50%', padding: '0 30px 0 50px' }}>
                        <h4 style={{ fontSize: '14px', color: '#8b9caa', marginBottom: '25px', fontWeight: '600' }}>Compliance Credentials</h4>
                        
                        <div className="credentials-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="credential-card" style={{ backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '20px' }}>
                                <h3 style={{ fontSize: '13px', color: '#333', margin: '0 0 4px 0', fontWeight: 'bold' }}>✓ IEC - Import Export Code</h3>
                                <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px 0' }}>Directorate General of Foreign Trade (DGFT)</p>
                                <p style={{ fontSize: '11px', color: '#999', margin: 0, lineHeight: '1.5' }}>Registered Indian exporter under DGFT. All international shipments dispatched under valid IEC.</p>
                            </div>
                            
                            <div className="credential-card" style={{ backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '20px' }}>
                                <h3 style={{ fontSize: '13px', color: '#333', margin: '0 0 4px 0', fontWeight: 'bold' }}>✓ FSSAI - Food Safety Licensed</h3>
                                <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px 0' }}>Food Safety &amp; Standards Authority of India</p>
                                <p style={{ fontSize: '11px', color: '#999', margin: 0, lineHeight: '1.5' }}>FSSAI-licensed facility. Compliant with Indian food safety standards for export of botanical ingredients.</p>
                            </div>
                            
                            <div className="credential-card" style={{ backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '20px' }}>
                                <h3 style={{ fontSize: '13px', color: '#333', margin: '0 0 4px 0', fontWeight: 'bold' }}>✓ NABL Accredited Lab Testing</h3>
                                <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px 0' }}>Every batch independently tested - HPLC quantified</p>
                                <p style={{ fontSize: '11px', color: '#999', margin: 0, lineHeight: '1.5' }}>Active compound potency, heavy metals, pesticide residues, and microbial panels verified on every lot before dispatch.</p>
                            </div>
                            
                            <div className="credential-card credential-card--highlight" style={{ backgroundColor: '#e6dfd9', border: '1px solid #b28b74', borderRadius: '6px', padding: '20px' }}>
                                <h3 style={{ fontSize: '13px', color: '#333', margin: '0 0 4px 0', fontWeight: 'bold' }}>📄 Complete documentation on every shipment</h3>
                                <p style={{ fontSize: '11px', color: '#777', margin: 0 }}>CoA - Phytosanitary - Certificate of Origin - MSDS - Allergen Declaration</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORIES / PRODUCTS SECTION */}
            <div className="container" style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 15px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                        BOTANICAL INGREDIENTS
                    </div>
                    <h2 className="section-title" style={{ fontSize: '36px', color: '#333', margin: 0, fontWeight: 'bold', letterSpacing: '-1px' }}>
                        35 ingredients. <br />
                        <span style={{ fontStyle: 'italic', color: '#7c5847', fontWeight: '600' }}>Farm-verified. Export-ready.</span>
                    </h2>
                </div>
                {/* Horizontal Category Scroll */}
                <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '15px', marginBottom: '30px', msOverflowStyle: 'none', scrollbarWidth: 'none' }} className="hide-scrollbar">
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
                                border: '1px solid #eaeaea', 
                                background: activeTab === cat ? '#9c7361' : '#fff', 
                                color: activeTab === cat ? '#fff' : '#555', 
                                borderRadius: '4px',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                boxShadow: activeTab === cat ? '0 4px 10px rgba(156,115,97,0.3)' : 'none'
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
                        paddingBottom: '20px'
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
                    scrollbarColor: '#9c7361 #f0f0f0'
                }}>
                    {displayedProducts.map((product, idx) => (
                        <div key={idx} className="product-card" style={{ border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff', transition: 'transform 0.2s', width: '260px' }}>
                            <Link 
                                to={`/product/${product.slug}`} 
                                style={{ display: 'block', backgroundColor: '#f9f9f9', padding: '20px' }}
                                onMouseEnter={() => setHoveredProductSlug(product.slug)}
                                onMouseLeave={() => setHoveredProductSlug(null)}
                            >
                                <img 
                                    src={hoveredProductSlug === product.slug && product.images[1] ? product.images[1] : product.images[0]} 
                                    alt={product.title} 
                                    className="product-img"
                                    style={{ width: '100%', height: '180px', objectFit: 'contain' }} 
                                />
                            </Link>
                            <div style={{ padding: '20px' }}>
                                <Link to={`/product/${product.slug}`} style={{ display: 'block', fontSize: '15px', color: '#333', textDecoration: 'none', fontWeight: '500', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</Link>
                                <div style={{ fontSize: '13px', color: '#888', marginBottom: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.category}</div>
                                <button 
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                    style={{ display: 'block', width: '100%', textAlign: 'center', backgroundColor: '#8b6352', color: '#fff', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                                >
                                    Enquire Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>

            {/* FORMULATION-READY SETS */}
            <div style={{ backgroundColor: '#ececec', padding: '100px 15px' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '60px' }}>
                        <div style={{ fontSize: '11px', color: '#b28b74', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                            FORMULATION-READY SETS
                        </div>
                        <h2 style={{ fontSize: '36px', color: '#333', margin: 0, fontWeight: '500', letterSpacing: '-0.5px' }}>
                            Don't just buy ingredients.
                        </h2>
                        <h2 style={{ fontSize: '36px', color: '#7a8693', margin: '0 0 15px 0', fontWeight: '400', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                            Build product lines.
                        </h2>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginTop: '15px', maxWidth: '600px' }}>
                            Pre-validated ingredient combinations for common supplement categories. Each set ships with matching certifications and combined CoA documentation.
                        </p>
                    </div>

                    <div className="formulation-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {[
                            { emoji: '⚡', title: 'Adaptogen Stack', desc: 'Stress, energy, hormonal balance', herbs: ['Ashwagandha', 'Brahmi', 'Shatavari'] },
                            { emoji: '🦴', title: 'Joint & Mobility Complex', desc: 'Anti-inflammation, arthritis, sports recovery', herbs: ['Turmeric 95%', 'Boswellia AKBA', 'Ginger'] },
                            { emoji: '🛡️', title: 'Immunity Shield', desc: 'Immune support, Vitamin C, antimicrobial', herbs: ['Amla', 'Moringa', 'Giloy', 'Black Seed'] },
                            { emoji: '📊', title: 'Metabolic Support', desc: 'Blood sugar, diabetes management, weight', herbs: ['Gymnema', 'Fenugreek', 'Turmeric'] },
                            { emoji: '🧘', title: 'Digestive Wellness', desc: 'Gut health, detox, digestion', herbs: ['Triphala', 'Ginger', 'Fenugreek'] },
                            { emoji: '💪', title: "Men's Performance", desc: 'Testosterone, energy, sports nutrition', herbs: ['Ashwagandha', 'Mucuna L-DOPA', 'Fenugreek'] }
                        ].map((set, idx) => (
                            <div key={idx} 
                                className="formulation-card"
                                style={{ 
                                    backgroundColor: '#f6f6f6', 
                                    padding: '30px', 
                                    borderRadius: '4px', 
                                    border: '1px solid #e0e0e0',
                                    transition: 'border-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#8b6352'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                            >
                                <div style={{ fontSize: '20px', marginBottom: '15px' }}>{set.emoji}</div>
                                <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '8px', fontWeight: '600' }}>{set.title}</h3>
                                <p style={{ fontSize: '12px', color: '#777', marginBottom: '20px' }}>{set.desc}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                    {set.herbs.map(h => (
                                        <span key={h} style={{ color: '#5a6773', fontSize: '11px', fontWeight: '500' }}>
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
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            <div className="container" style={{ maxWidth: '100%', margin: '80px auto', padding: '0', textAlign: 'center' }}>
                <img src="/images/Map-scaled.jpeg" alt="Global Export Map" style={{ width: '100%', maxWidth: '1400px', height: 'auto' }} />
            </div>
            
            <ProductEnquiryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct} 
            />
        </div>
    );
}
