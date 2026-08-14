import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductEnquiryModal from '../components/ProductEnquiryModal';
import ProgressiveImage from '../components/ProgressiveImage';
import { useSEO } from '../hooks/useSEO';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useSEO({
        title: product ? `${product.title} | Petricor` : "Product Details | Petricor Botanical Extracts",
        description: product ? (product.short_description || `Discover ${product.title}, a premium botanical extract by Petricor.`) : "Premium botanical extract product details.",
        url: product ? `https://petricor.co.in/product/${product.slug}` : "https://petricor.co.in/products"
    });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const fetchProductData = async () => {
            setLoading(true);
            const { data: prodData } = await supabase
                .from('products')
                .select(`*, categories!products_category_id_fkey(name), product_categories(category_id, categories(name))`)
                .eq('slug', id)
                .single();

            if (prodData) {
                const cats = new Set<string>();
                const catIds = new Set<string>();
                if (prodData.categories?.name) cats.add(prodData.categories.name);
                if (prodData.category_id) catIds.add(prodData.category_id);
                
                if (prodData.product_categories) {
                    prodData.product_categories.forEach((pc: any) => {
                        if (pc.categories?.name) cats.add(pc.categories.name);
                        if (pc.category_id) catIds.add(pc.category_id);
                    });
                }
                const categoryArray = Array.from(cats);
                const categoryIdArray = Array.from(catIds);

                const mappedProduct = {
                    ...prodData,
                    categoryArray,
                    category: categoryArray[0] || 'Uncategorized',
                    images: [prodData.primary_image_url, prodData.hover_image_url].filter(Boolean)
                };
                setProduct(mappedProduct);
                if (mappedProduct.images.length > 0) {
                    setMainImage(mappedProduct.images[0]);
                }

                // Fetch related products (small catalog, so fetching all and filtering is fine)
                const { data: relatedData } = await supabase
                    .from('products')
                    .select(`*, categories!products_category_id_fkey(name), product_categories(category_id, categories(name))`)
                    .neq('id', prodData.id);

                let related = (relatedData || [])
                    .filter(p => {
                        const pCats = new Set<string>();
                        if (p.category_id) pCats.add(p.category_id);
                        if (p.product_categories) p.product_categories.forEach((pc: any) => pCats.add(pc.category_id));
                        return Array.from(pCats).some(c => categoryIdArray.includes(c));
                    })
                    .slice(0, 4)
                    .map(p => {
                        const c = new Set<string>();
                        if (p.categories?.name) c.add(p.categories.name);
                        if (p.product_categories) p.product_categories.forEach((pc: any) => {
                            if (pc.categories?.name) c.add(pc.categories.name);
                        });
                        const arr = Array.from(c).filter(Boolean);
                        return {
                            ...p,
                            categoryArray: arr,
                            category: arr[0] || 'Uncategorized',
                            images: [p.primary_image_url, p.hover_image_url].filter(Boolean)
                        };
                    });
                
                setRelatedProducts(related);
            } else {
                navigate('/');
            }
            setLoading(false);
        };

        if (id) {
            fetchProductData();
        }
    }, [id, navigate]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #7c5847', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!product) return null;

    const sections = [
        { title: 'Description', content: product.description },
        { title: 'Specification', content: product.specification },
        { title: 'Plant Part & Origin', content: product.plant_and_origin },
        { title: 'Uses & Benefits', content: product.uses_and_benefits }
    ].filter(s => s.content);

    return (
        <div style={{ backgroundColor: '#fdfbf9', minHeight: '100vh', padding: '60px 0' }}>
            <div className="container" style={{ maxWidth: '1280px', width: '95%', margin: '0 auto', padding: '0' }}>
                
                {/* Main Product Section */}
                <div className="product-detail-card" style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '60px', 
                    backgroundColor: '#fff',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                    marginBottom: '80px',
                    boxSizing: 'border-box'
                }}>
                    
                    {/* Left Gallery */}
                    <div className="product-detail-gallery" style={{ flex: '1 1 45%', minWidth: '300px' }}>
                        <div style={{ 
                            borderRadius: '16px', 
                            overflow: 'hidden', 
                            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                            marginBottom: '20px',
                            backgroundColor: '#f9f9f9',
                            position: 'relative'
                        }}>
                            <ProgressiveImage 
                                src={mainImage} 
                                alt={product.title} 
                                style={{ 
                                    width: '100%', 
                                    aspectRatio: '1/1', 
                                    objectFit: 'cover',
                                    display: 'block',
                                    transition: 'transform 0.5s ease',
                                }} 
                            />
                        </div>
                        
                        {product.images && product.images.length > 1 && (
                            <div style={{ display: 'flex', gap: '15px' }}>
                                {product.images.map((img: string, idx: number) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setMainImage(img)}
                                        style={{ 
                                            width: '80px', 
                                            height: '80px', 
                                            borderRadius: '12px',
                                            border: mainImage === img ? '2px solid #7c5847' : '2px solid transparent', 
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                            transition: 'all 0.2s ease',
                                            opacity: mainImage === img ? 1 : 0.7
                                        }}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Details */}
                    <div style={{ flex: '1 1 45%', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ 
                            color: '#7c5847', 
                            textTransform: 'uppercase', 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            letterSpacing: '1.5px',
                            display: 'block',
                            marginBottom: '10px'
                        }}>
                            {product.categoryArray?.join(', ') || product.category}
                        </span>
                        
                        <h1 style={{ 
                            fontSize: 'clamp(28px, 4vw, 42px)', 
                            color: '#1a1a1a', 
                            marginBottom: '25px', 
                            fontWeight: '600',
                            lineHeight: '1.2'
                        }}>
                            {product.title}
                        </h1>

                        <div style={{ marginBottom: '40px' }}>
                            <button 
                                className="enquiry-btn-hero"
                                onClick={() => setIsModalOpen(true)}
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backgroundColor: '#7c5847', 
                                    color: 'white', 
                                    padding: '16px 40px', 
                                    fontSize: '16px', 
                                    fontWeight: '600', 
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderRadius: '50px',
                                    boxShadow: '0 8px 20px rgba(124, 88, 71, 0.3)',
                                    transition: 'all 0.3s ease',
                                    width: '100%',
                                    maxWidth: '350px'
                                }}
                            >
                                Request Enquiry 
                                <svg style={{ marginLeft: '12px', width: '16px', fill: 'white', transition: 'transform 0.3s ease' }} viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Information Sections */}
                        <div style={{ flexGrow: 1, marginTop: '10px' }}>
                            {sections.map((sec, idx) => (
                                <div key={idx} style={{ marginBottom: '35px' }}>
                                    <h3 style={{ 
                                        color: '#7c5847',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        marginBottom: '15px',
                                        borderBottom: '1px solid #eaeaea',
                                        paddingBottom: '10px'
                                    }}>
                                        {sec.title}
                                    </h3>
                                    <div 
                                        className="product-content"
                                        style={{ 
                                            color: '#555', 
                                            lineHeight: '1.8',
                                            fontSize: '15.5px',
                                            whiteSpace: 'pre-wrap'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: sec.content }} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div style={{ marginTop: '80px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '32px', color: '#1a1a1a', fontWeight: '600', margin: 0 }}>You May Also Like</h2>
                            <Link to="/products" style={{ color: '#7c5847', fontWeight: '600', textDecoration: 'none', fontSize: '15px' }}>
                                View All Products →
                            </Link>
                        </div>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                            gap: '30px' 
                        }}>
                            {relatedProducts.map(rp => (
                                <div key={rp.slug} className="related-card" style={{ 
                                    backgroundColor: '#fff',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}>
                                    <Link to={`/product/${rp.slug}`} style={{ display: 'block', overflow: 'hidden' }}>
                                        <ProgressiveImage 
                                            className="related-img"
                                            src={rp.images[0]} 
                                            alt={rp.title} 
                                            style={{ 
                                                width: '100%', 
                                                aspectRatio: '4/3', 
                                                objectFit: 'cover', 
                                                display: 'block',
                                                transition: 'transform 0.5s ease'
                                            }} 
                                        />
                                    </Link>
                                    <div style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ color: '#7c5847', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            <Link to={`/products?category=${encodeURIComponent(rp.categoryArray?.[0] || rp.category)}`} style={{ fontSize: '12px', color: '#888', textDecoration: 'none' }}>
                                                {rp.categoryArray?.join(', ') || rp.category}
                                            </Link>
                                        </div>
                                        <h4 style={{ fontSize: '18px', margin: '0 0 20px 0', fontWeight: '600', lineHeight: '1.4' }}>
                                            <Link to={`/product/${rp.slug}`} style={{ color: '#1a1a1a', textDecoration: 'none' }}>{rp.title}</Link>
                                        </h4>
                                        <button 
                                            onClick={() => {
                                                setProduct(rp);
                                                setIsModalOpen(true);
                                            }}
                                            style={{ 
                                                backgroundColor: '#f9f9f9', 
                                                color: '#1a1a1a', 
                                                padding: '12px 0', 
                                                fontSize: '14px', 
                                                fontWeight: '600', 
                                                border: '1px solid #eaeaea',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                transition: 'all 0.2s ease',
                                                width: '100%'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = '#7c5847';
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.borderColor = '#7c5847';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f9f9f9';
                                                e.currentTarget.style.color = '#1a1a1a';
                                                e.currentTarget.style.borderColor = '#eaeaea';
                                            }}
                                        >
                                            Quick Enquiry
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <ProductEnquiryModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    product={product} 
                />
            </div>

            {/* Injected Styles for hover effects */}
            <style>{`
                .enquiry-btn-hero:hover {
                    background-color: #614335 !important;
                    transform: translateY(-2px);
                }
                .enquiry-btn-hero:hover svg {
                    transform: translateX(5px);
                }
                .related-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.08) !important;
                }
                .related-card:hover .related-img {
                    transform: scale(1.05);
                }
                .product-content p {
                    margin-top: 0;
                    margin-bottom: 15px;
                }
                .product-content ul {
                    padding-left: 20px;
                }
                .product-content li {
                    margin-bottom: 8px;
                }
            `}</style>
        </div>
    );
}
