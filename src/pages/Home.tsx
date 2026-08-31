import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductEnquiryModal from '../components/ProductEnquiryModal';
import { ProductSkeleton } from '../components/Skeleton';
import ProgressiveImage from '../components/ProgressiveImage';
import ExportMap from '../components/ExportMap';
import EventsMarquee from '../components/EventsMarquee';

const APP_START_TIME = Date.now();

function AnimatedCounter({ end, suffix = '', delayOnLoad = false }: { end: number; suffix?: string, delayOnLoad?: boolean }) {
    const [count, setCount] = useState(0);
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect(); // Only trigger once
                }
            },
            { threshold: 0 }
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isInView) return;
        if (end <= 0) {
            setCount(end);
            return;
        }

        let startTime: number | null = null;
        const duration = 1500; // 1.5s animation
        let reqId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Ease-out quad function for smooth deceleration
            const easeOut = percentage * (2 - percentage);
            
            setCount(Math.floor(easeOut * end));

            if (progress < duration) {
                reqId = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        // Add 800ms base delay + whatever is left of the splash screen
        let finalDelay = 50; // default standard delay
        
        if (delayOnLoad) {
            const timeSinceStart = Date.now() - APP_START_TIME;
            const splashDuration = 2200;
            const remainingSplashTime = Math.max(0, splashDuration - timeSinceStart);
            finalDelay = remainingSplashTime + 800;
        }

        const startDelay = setTimeout(() => {
            reqId = requestAnimationFrame(animate);
        }, finalDelay);

        return () => {
            clearTimeout(startDelay);
            if (reqId) cancelAnimationFrame(reqId);
        };
    }, [end, isInView]);

    return <span ref={ref} style={{ display: 'inline-block', minWidth: '1.2em' }}>{count}{suffix}</span>;
}

import { useSEO } from '../hooks/useSEO';

export default function Home() {
    useSEO({
        title: "Petricor | Premium Botanical Extracts",
        description: "Petricor provides the highest quality botanical extracts, ethically sourced and scientifically formulated for your health and wellness.",
        url: "https://petricor.co.in/"
    });

    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    
    const [categories, setCategories] = useState<string[]>([]);
    const [productsData, setProductsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Interactive Highlights
    const [activeCredentialIndex, setActiveCredentialIndex] = useState<number | null>(null);
    const [activeBuyerIndex, setActiveBuyerIndex] = useState<number | null>(null);



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
            
            const { data: prodData } = await supabase.from('products').select(`*, categories!products_category_id_fkey(name), product_categories(categories(name))`);
            if (prodData) {
                // Map the data to match the expected format in the UI
                const mappedProducts = prodData.map(p => {
                    const cats = new Set<string>();
                    if (p.categories?.name) cats.add(p.categories.name);
                    if (p.product_categories) {
                        p.product_categories.forEach((pc: any) => {
                            if (pc.categories?.name) cats.add(pc.categories.name);
                        });
                    }
                    const categoryArray = Array.from(cats);
                    return {
                        ...p,
                        categoryArray,
                        category: categoryArray[0] || 'Uncategorized',
                        images: [p.primary_image_url || '', p.hover_image_url || ''].filter(Boolean)
                    };
                });
                setProductsData(mappedProducts);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const displayedProducts = activeTab === 'All' 
        ? productsData 
        : productsData.filter(p => p.categoryArray?.includes(activeTab) || p.category === activeTab);

    return (
        <div style={{ paddingBottom: '0' }}>
            {/* HERO SECTION */}
            <div className="hero-wrapper" style={{ borderBottom: 'none' }}>
                <div className="container hero-container" style={{ maxWidth: '1280px', width: '95%', margin: '0 auto', display: 'flex', flexWrap: 'nowrap', padding: '0' }}>
                    
                    {/* LEFT COLUMN - TEXT */}
                    <div className="hero-left" style={{ flex: '1 1 50%', borderRight: '1px solid var(--border-color)' }}>
                        <div className="hero-badge-container">
                            <span className="hero-badge-line"></span>
                            GROWN IN NEEMUCH - VERIFIED AT SOURCE
                        </div>
                        <h1 className="hero-title" style={{ fontSize: 'clamp(38px, 3vw, 68px)', color: '#2c2c2c', margin: '0 0 5px 0', fontWeight: '700', lineHeight: '1.05', letterSpacing: '-1.5px' }}>
                            We control
                        </h1>
                        <h1 className="hero-title" style={{ fontSize: 'clamp(38px, 3vw, 68px)', color: '#2c2c2c', margin: '0 0 5px 0', fontWeight: '700', lineHeight: '1.05', letterSpacing: '-1.5px' }}>
                            the source.
                        </h1>
                        <h1 className="hero-title-italic" style={{ fontSize: 'clamp(38px, 3vw, 68px)', color: 'var(--primary-brown)', marginBottom: '20px', fontWeight: '500', lineHeight: '1.05', fontStyle: 'italic', letterSpacing: '-1.5px' }}>
                            You get the proof.
                        </h1>
                        <p style={{ fontSize: 'clamp(14px, 1.2vw, 16px)', color: '#595959', lineHeight: '1.5', marginBottom: 'clamp(15px, 2vh, 24px)', maxWidth: '100%', fontWeight: '500' }}>
                            Farm-origin botanical extracts from Neemuch, India where the herbs actually grow. Every batch traceable to its field, tested by NABL-accredited labs, documented for your import market. No middlemen. No assumptions.
                        </p>
                        <div className="hero-cta-row" style={{ display: 'flex', gap: '15px', marginBottom: 'clamp(20px, 3vh, 30px)' }}>
                            <Link to="/products" className="hero-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--primary-brown)', color: '#fff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '14px', transition: 'background-color 0.2s' }}>
                                Explore Product ➔
                            </Link>
                            <Link to="/general-enquiry" className="hero-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--primary-brown)', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s' }}>
                                Enquire Now ➔
                            </Link>
                        </div>
                        
                        <div className="hero-stats" style={{ borderTop: '1px solid #eaeaea', paddingTop: '20px', display: 'flex', alignItems: 'flex-start' }}>
                            <div className="hero-stat-item" style={{ flex: '1', paddingRight: '20px' }}>
                                <h4 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 'clamp(22px, 2vw, 30px)', color: '#2c2c2c', margin: '0 0 6px 0', fontWeight: '700', lineHeight: '1' }}>NABL Accredited</h4>
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#7A7A7A', margin: 0, fontWeight: '600', lineHeight: '1', letterSpacing: '0.4px' }}>No Brokers · No Traders · Direct from source</p>
                            </div>
                            <div className="hero-stat-divider" style={{ width: '1px', backgroundColor: '#eaeaea', margin: '0 30px' }}></div>
                            <div className="hero-stat-item" style={{ flex: '1' }}>
                                <h4 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 'clamp(22px, 2vw, 30px)', color: '#2c2c2c', margin: '0 0 6px 0', fontWeight: '700', lineHeight: '1' }}>
                                    <AnimatedCounter end={30} suffix="+" delayOnLoad={true} />
                                </h4>
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#7A7A7A', margin: 0, fontWeight: '600', lineHeight: '1', letterSpacing: '0.4px' }}>Export countries</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* RIGHT COLUMN - CREDENTIALS */}
                    <div className="hero-right" style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '10px' }}>
                        <div className="compliance-wrapper credentials-container-bg">
                            <h4 className="compliance-title" style={{ fontSize: 'clamp(11px, 1vw, 13px)', color: '#777', marginBottom: 'clamp(10px, 1.5vh, 18px)', fontWeight: '600', paddingLeft: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Compliance Credentials</h4>
                            
                            <div className="credentials-list" onMouseLeave={() => setActiveCredentialIndex(null)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { title: '✓ IEC - Import Export Code', sub: 'Directorate General of Foreign Trade (DGFT)', desc: 'Registered Indian exporter under DGFT. All international shipments dispatched under valid IEC.' },
                                    { title: '✓ FSSAI - Food Safety Licensed', sub: 'Food Safety & Standards Authority of India', desc: 'FSSAI-licensed facility. Compliant with Indian food safety standards for export of botanical ingredients.' },
                                    { title: '✓ NABL Accredited Lab Testing', sub: 'Every batch independently tested - HPLC quantified', desc: 'Active compound potency, heavy metals, pesticide residues, and microbial panels verified on every lot before dispatch.' },
                                    { title: '📄 Complete documentation on every shipment', sub: '', desc: 'CoA - Phytosanitary - Certificate of Origin - MSDS - Allergen Declaration' }
                                ].map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        onMouseEnter={() => setActiveCredentialIndex(idx)}
                                        onClick={() => setActiveCredentialIndex(idx)}
                                        className="credential-card"
                                        style={{ 
                                            backgroundColor: activeCredentialIndex === idx ? '#fcf8f4' : '#ffffff', 
                                            border: activeCredentialIndex === idx ? '1.5px solid #7c5847' : '1px solid #e0e0e0', 
                                            boxShadow: activeCredentialIndex === idx ? '0 3px 10px rgba(124,88,71,0.12)' : '0 1px 4px rgba(0,0,0,0.02)', 
                                            borderRadius: '6px', 
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <h3 style={{ fontSize: '13.5px', color: activeCredentialIndex === idx ? '#7c5847' : 'var(--text-dark)', margin: '0 0 2px 0', fontWeight: '700' }}>{item.title}</h3>
                                        {item.sub && <p style={{ fontSize: '11.5px', color: '#666', margin: '0 0 2px 0', fontWeight: '500' }}>{item.sub}</p>}
                                        <p style={{ fontSize: '11.5px', color: '#555', margin: 0, lineHeight: '1.35' }}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '1280px', width: '95%', margin: '80px auto 0', padding: '0', scrollMarginTop: '100px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#8b6352', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>
                        BOTANICAL INGREDIENTS <span style={{ display: 'inline-block', width: '40px', height: '1px', backgroundColor: '#8b6352' }}></span>
                    </div>
                    <h2 className="section-title" style={{ fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#1a1a1a', margin: '0 0 5px 0', fontWeight: '600', letterSpacing: '-1px', lineHeight: '1.2' }}>
                        <AnimatedCounter end={productsData.length > 0 ? productsData.length : 35} suffix="+" /> ingredients.
                    </h2>
                    <h2 className="section-title-italic" style={{ fontSize: 'clamp(20px, 2.2vw, 28px)', color: '#4a5b6c', margin: 0, fontWeight: '400', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                        Farm-verified. Export-ready.
                    </h2>
                </div>
                {/* Horizontal Category Scroll */}
                <div className="category-scroll-container">
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
    gridAutoColumns: '170px',
    gap: '15px', 
    marginBottom: '80px',
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBottom: '20px',
    WebkitOverflowScrolling: 'touch'
}}>
    {[...Array(6)].map((_, i) => <div key={i}><ProductSkeleton /></div>)}
</div>
                ) : (
                <div className="home-products-grid" style={{ 
    display: 'grid', 
    gridTemplateRows: 'repeat(2, 1fr)', 
    gridAutoFlow: 'column',
    gridAutoColumns: '170px',
    gap: '15px', 
    marginBottom: '80px',
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBottom: '20px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#9c7361 #f0f0f0',
    WebkitOverflowScrolling: 'touch'
}}>
    {displayedProducts.map((product, idx) => (
                        <div key={idx} className="product-card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff', transition: 'transform 0.2s', width: '100%', height: '100%' }}>
                            <Link 
                                to={`/product/${product.slug}`} 
                                style={{ display: 'block', padding: '0' }}
                            >
                                <div className="product-image-wrapper">
                                    <div className="product-img-primary">
                                        <ProgressiveImage 
                                            src={product.images ? product.images[0] : ''} 
                                            alt={product.title || product.name} 
                                        />
                                    </div>
                                    {product.images && product.images[1] && (
                                        <div className="product-img-secondary">
                                            <ProgressiveImage 
                                                src={product.images[1]} 
                                                alt={product.title || product.name} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="product-card-content" style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <Link to={`/product/${product.slug}`} className="product-card-title" style={{ display: 'block', fontSize: '15px', color: '#222', textDecoration: 'none', fontWeight: '700', marginBottom: '3px', lineHeight: '1.3' }}>
                                    {product.title || product.name}
                                </Link>
                                <Link to={`/?category=${encodeURIComponent(activeTab !== 'All' && product.categoryArray?.includes(activeTab) ? activeTab : (product.categoryArray?.[0] || product.category))}`} className="product-card-category" style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '0', lineHeight: '1.4', textDecoration: 'none', flexGrow: 1 }}>
                                    {product.categoryArray?.length > 1 ? `${activeTab !== 'All' && product.categoryArray.includes(activeTab) ? activeTab : product.categoryArray[0]} +${product.categoryArray.length - 1}` : (product.categoryArray?.[0] || product.category)}
                                </Link>
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                    className="product-card-button"
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
            <div className="formulation-section-wrapper" style={{ backgroundColor: '#fdfbf9', padding: '60px 0 40px', scrollMarginTop: '90px' }}>
                <div className="container formulation-header-container" style={{ maxWidth: '1280px', width: '95%', margin: '0 auto', marginBottom: '25px' }}>
                    <div style={{ fontSize: '12px', color: '#8b6352', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '15px' }}>
                        FORMULATION-READY SETS
                    </div>
                    <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#222', margin: 0, fontWeight: '700', letterSpacing: '-0.5px' }}>
                        Don't just buy ingredients.
                    </h2>
                    <h2 style={{ fontSize: 'clamp(20px, 2.2vw, 28px)', color: '#b28b74', margin: '5px 0 20px 0', fontWeight: '500', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                        Build product lines.
                    </h2>
                    <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginTop: '15px', maxWidth: '600px' }}>
                        Pre-validated ingredient combinations for common supplement categories. Each set ships with matching certifications and combined CoA documentation.
                    </p>
                </div>

                <div className="container" style={{ maxWidth: '1280px', width: '95%', margin: '0 auto', padding: '0' }}>
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
                                            padding: '20px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            height: '100%',
                                            boxSizing: 'border-box'
                                        }}>
                                            {/* Giant background icon/watermark */}
                                            <div style={{ position: 'absolute', right: '-15px', bottom: '-25px', fontSize: '140px', opacity: 0.04, transform: 'rotate(-15deg)', pointerEvents: 'none' }}>
                                                {set.icon}
                                            </div>
                                            
                                            <div>
                                                {/* Top bar with icon and title */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', position: 'relative', zIndex: 1 }}>
                                                    <div style={{ 
                                                        fontSize: '24px', 
                                                        background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', 
                                                        backdropFilter: 'blur(10px)', 
                                                        border: '1px solid rgba(255,255,255,0.8)', 
                                                        width: '50px', height: '50px', 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                        borderRadius: '14px', 
                                                        color: '#8b6352', 
                                                        boxShadow: '0 4px 14px rgba(0,0,0,0.04)' 
                                                    }}>
                                                        {set.emoji}
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: '18px', color: '#111', margin: '0 0 2px', fontWeight: '800', letterSpacing: '-0.3px' }}>{set.title}</h3>
                                                        <p style={{ fontSize: '12px', color: '#8b6352', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Formulation Set</p>
                                                    </div>
                                                </div>
                                                
                                                <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px', lineHeight: '1.5', position: 'relative', zIndex: 1, fontWeight: '500' }}>{set.desc}</p>
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', position: 'relative', zIndex: 1, marginTop: 'auto' }}>
                                                {set.herbs.map(h => (
                                                    <span key={h} style={{ 
                                                        backgroundColor: '#fff', 
                                                        border: `1px solid rgba(0,0,0,0.06)`, 
                                                        color: '#222', 
                                                        padding: '6px 14px', 
                                                        borderRadius: '30px', 
                                                        fontSize: '12px', 
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
                <div className="container" style={{ maxWidth: '1280px', width: '95%', margin: '0 auto' }}>
                    <div className="b2b-header" style={{ marginBottom: '50px' }}>
                        <div style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                            BUILT FOR B2B INGREDIENTS
                        </div>
                        <h2 className="section-title" style={{ fontSize: 'clamp(20px, 2.2vw, 28px)', margin: '0 0 5px 0', fontWeight: 'bold', letterSpacing: '-1px' }}>Trusted by brands & formulators</h2>
                        <h2 className="section-title-italic" style={{ fontSize: 'clamp(20px, 2.2vw, 28px)', color: '#777', margin: 0, fontWeight: '400', fontStyle: 'italic', letterSpacing: '-1px' }}>across <AnimatedCounter end={30} suffix="+" /> countries</h2>
                    </div>

                    <div className="b2b-grid" onMouseLeave={() => setActiveBuyerIndex(null)}>
                        {[
                            { icon: '💊', title: 'Supplement Brands', desc: 'Nutraceutical brands needing certified, spec-compliant raw material' },
                            { icon: '🏭', title: 'Contract Manufacturers', desc: 'CMOs and OEM manufacturers sourcing consistent, traceable extracts at scale' },
                            { icon: '🧪', title: 'Formulators & R&D', desc: 'Product developers who need full CoA data, HPLC specs and sample availability fast' },
                            { icon: '🏷', title: 'Private Label Brands', desc: 'White-label and private-label businesses needing branded-ready ingredient supply' },
                            { icon: '🛒', title: 'Importers & Distributors', desc: 'Regional distributors buying certified botanical ingredients for resale into local markets' },
                            { icon: '🍵', title: 'Food & Beverage', desc: 'Functional food, tea, and beverage brands sourcing food-grade standardised herbs' }
                        ].map((buyer, idx) => (
                            <div 
                                key={idx} 
                                onMouseEnter={() => setActiveBuyerIndex(idx)}
                                onClick={() => setActiveBuyerIndex(idx)}
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    padding: '16px 20px', 
                                    backgroundColor: activeBuyerIndex === idx ? '#fcf8f4' : '#fff', 
                                    border: `1.5px solid ${activeBuyerIndex === idx ? '#7c5847' : '#eaeaea'}`, 
                                    borderRadius: '8px',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: activeBuyerIndex === idx ? '0 4px 14px rgba(124,88,71,0.12)' : 'none'
                                }}
                            >
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', marginBottom: '6px', fontWeight: '700', color: activeBuyerIndex === idx ? '#7c5847' : '#333' }}>
                                    <span style={{ fontSize: '18px' }}>{buyer.icon}</span> 
                                    <span>{buyer.title}</span>
                                </h4>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', margin: 0 }}>{buyer.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAP SECTION */}
            <div style={{ backgroundColor: '#fff', padding: '60px 0 80px 0' }}>
                <div className="container" style={{ maxWidth: '1280px', width: '95%', margin: '0 auto', padding: '0' }}>
                    <ExportMap />
                </div>
            </div>

            {/* EVENTS MARQUEE */}
            <EventsMarquee />
            
            <ProductEnquiryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct} 
            />
        </div>
    );
}
