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
                        <h4 style={{ fontSize: '12px', color: '#8b6352', marginBottom: '20px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>Compliance Credentials</h4>
                        
                        <div className="credentials-list" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {[
                                { icon: '🔖', title: 'IEC — Import Export Code', sub: 'DGFT Registered', desc: 'Registered Indian exporter under DGFT. All international shipments dispatched under valid IEC.' },
                                { icon: '🛡️', title: 'FSSAI — Food Safety Licensed', sub: 'Food Safety & Standards Authority of India', desc: 'FSSAI-licensed facility compliant with Indian food safety standards for export of botanical ingredients.' },
                                { icon: '🔬', title: 'NABL Accredited Lab Testing', sub: 'HPLC quantified — every batch', desc: 'Active compound potency, heavy metals, pesticide residues and microbial panels verified on every lot before dispatch.' },
                                { icon: '📄', title: 'Full Shipment Documentation', sub: 'CoA · Phytosanitary · Origin · MSDS · Allergen', desc: null },
                            ].map((c, i) => (
                                <div key={i} className="credential-card" style={{
                                    display: 'flex',
                                    gap: '14px',
                                    padding: '16px 0',
                                    borderBottom: i < 3 ? '1px solid #e8e2dc' : 'none',
                                    alignItems: 'flex-start'
                                }}>
                                    <div style={{ fontSize: '18px', marginTop: '1px', flexShrink: 0 }}>{c.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#2a1f1a', fontWeight: '700', marginBottom: '2px' }}>{c.title}</div>
                                        <div style={{ fontSize: '11px', color: '#8b6352', fontWeight: '600', marginBottom: c.desc ? '5px' : '0' }}>{c.sub}</div>
                                        {c.desc && <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.55' }}>{c.desc}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORIES / PRODUCTS SECTION */}
            <div className="container" style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 15px' }}>
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
                        <div key={idx} className="product-card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff', transition: 'transform 0.2s', width: '260px', height: '100%' }}>
                            <Link 
                                to={`/product/${product.slug}`} 
                                style={{ display: 'block', backgroundColor: '#f9f9f9', padding: '0' }}
                                onMouseEnter={() => setHoveredProductSlug(product.slug)}
                                onMouseLeave={() => setHoveredProductSlug(null)}
                            >
                                <img 
                                    src={hoveredProductSlug === product.slug && product.images[1] ? product.images[1] : product.images[0]} 
                                    alt={product.title} 
                                    className="product-img"
                                    style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }} 
                                />
                            </Link>
                            <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <Link to={`/product/${product.slug}`} style={{ display: 'block', fontSize: '15px', color: '#222', textDecoration: 'none', fontWeight: '700', marginBottom: '3px', lineHeight: '1.3' }}>
                                    {product.title}
                                </Link>
                                <Link to={`/products?category=${encodeURIComponent(product.category)}`} style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '0', lineHeight: '1.4', textDecoration: 'none', flexGrow: 1 }}>
                                    {product.category}
                                </Link>
                                <button 
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                    style={{ display: 'block', width: '100%', textAlign: 'center', backgroundColor: '#6b4236', color: '#fff', padding: '12px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}
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
            <div style={{ backgroundColor: '#1a120e', padding: '80px 0 0' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 50px' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ fontSize: '11px', color: '#8b6352', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                            FORMULATION-READY SETS
                        </div>
                        <h2 style={{ fontSize: '34px', color: '#f5f0eb', margin: 0, fontWeight: '600', letterSpacing: '-0.5px' }}>
                            Don't just buy ingredients.
                        </h2>
                        <h2 style={{ fontSize: '28px', color: '#8b7a6e', margin: '0 0 10px 0', fontWeight: '400', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                            Build product lines.
                        </h2>
                        <p style={{ fontSize: '13px', color: '#7a6a60', lineHeight: '1.6', maxWidth: '500px' }}>
                            Pre-validated ingredient combos. Each set ships with matching certifications and combined CoA.
                        </p>
                    </div>
                </div>

                {/* Snap-scroll cards container */}
                <div
                    className="formulation-snap-scroll"
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        gap: '0',
                        paddingBottom: '0',
                    }}
                >
                    <style dangerouslySetInnerHTML={{__html: `
                        .formulation-snap-scroll::-webkit-scrollbar { display: none; }
                        .formulation-snap-card { scroll-snap-align: start; flex-shrink: 0; }
                    `}} />
                    {[
                        { num: '01', accent: '#8b6352', title: 'Adaptogen Stack', desc: 'For brands formulating stress, energy & hormonal balance supplements.', herbs: ['Ashwagandha KSM-66', 'Brahmi 40% Bacosides', 'Shatavari'], tag: 'BESTSELLER' },
                        { num: '02', accent: '#5a7a6a', title: 'Joint & Mobility Complex', desc: 'Anti-inflammation, arthritis management & sports recovery formulations.', herbs: ['Turmeric 95% Curcumin', 'Boswellia 65% AKBA', 'Ginger 5%'], tag: 'EXPORT READY' },
                        { num: '03', accent: '#6a7a8a', title: 'Immunity Shield', desc: 'Immune support, natural Vitamin C & antimicrobial combination for nutraceuticals.', herbs: ['Amla 50% Tannins', 'Moringa 20% Protein', 'Giloy Extract'], tag: 'HIGH DEMAND' },
                        { num: '04', accent: '#7a6a4a', title: 'Metabolic Support', desc: 'Blood sugar regulation, diabetes management & metabolic weight support.', herbs: ['Gymnema 75% GS4', 'Fenugreek 50% Saponins', 'Vijaysar Extract'], tag: 'CLINICAL GRADE' },
                        { num: '05', accent: '#5a6a5a', title: 'Digestive Wellness', desc: 'Complete gut health, detox & Ayurvedic digestion support stack.', herbs: ['Triphala Blend', 'Ginger 5% Gingerols', 'Psyllium Husk 85%'], tag: 'AYURVEDIC' },
                        { num: '06', accent: '#7a5a5a', title: "Men's Performance", desc: 'Testosterone support, energy & elite sports nutrition formulations.', herbs: ['Shilajit 60% Fulvic', 'Mucuna 98% L-DOPA', 'Safed Musli 60%'], tag: 'PREMIUM' },
                    ].map((set, idx) => (
                        <div
                            key={idx}
                            className="formulation-snap-card formulation-card"
                            style={{
                                width: '85vw',
                                maxWidth: '420px',
                                minHeight: '380px',
                                background: `linear-gradient(145deg, #2a1a14, #1a120e)`,
                                borderLeft: `3px solid ${set.accent}`,
                                padding: '40px 30px 35px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Background number watermark */}
                            <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '120px', fontWeight: '900', color: 'rgba(255,255,255,0.03)', lineHeight: 1, userSelect: 'none' }}>{set.num}</div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                    <span style={{ fontSize: '11px', color: set.accent, fontWeight: '700', letterSpacing: '2px', border: `1px solid ${set.accent}`, padding: '3px 8px', borderRadius: '2px' }}>{set.tag}</span>
                                    <span style={{ fontSize: '28px', color: '#3a2a22', fontWeight: '900', lineHeight: 1 }}>{set.num}</span>
                                </div>
                                <h3 style={{ fontSize: '22px', color: '#f5f0eb', marginBottom: '12px', fontWeight: '700', lineHeight: '1.2' }}>{set.title}</h3>
                                <p style={{ fontSize: '13px', color: '#8a7a70', lineHeight: '1.65', marginBottom: '28px' }}>{set.desc}</p>
                            </div>

                            <div>
                                <div style={{ fontSize: '10px', color: '#5a4a40', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '10px', textTransform: 'uppercase' }}>Key Ingredients</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {set.herbs.map((h, hi) => (
                                        <div key={hi} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: set.accent, flexShrink: 0 }}></div>
                                            <span style={{ fontSize: '12px', color: '#c5b5aa', fontWeight: '500' }}>{h}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* End spacer */}
                    <div style={{ width: '20px', flexShrink: 0 }}></div>
                </div>

                {/* Scroll hint */}
                <div style={{ textAlign: 'center', padding: '20px', color: '#3a2a22', fontSize: '12px', letterSpacing: '1px' }}>
                    ← SCROLL TO EXPLORE →
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
            <div className="container" style={{ maxWidth: '100%', margin: '80px auto 0', padding: '0', textAlign: 'center', display: 'flex' }}>
                <img src="/images/Map-scaled.jpeg" alt="Global Export Map" style={{ width: '100%', maxWidth: '1400px', height: 'auto', margin: '0 auto', display: 'block' }} />
            </div>
            
            <ProductEnquiryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct} 
            />
        </div>
    );
}
