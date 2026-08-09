import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductEnquiryModal from '../components/ProductEnquiryModal';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            const { data: prodData } = await supabase
                .from('products')
                .select(`*, categories(name)`)
                .eq('slug', id)
                .single();

            if (prodData) {
                const mappedProduct = {
                    ...prodData,
                    category: prodData.categories?.name || 'Uncategorized',
                    images: [prodData.primary_image_url, prodData.hover_image_url].filter(Boolean)
                };
                setProduct(mappedProduct);
                if (mappedProduct.images.length > 0) {
                    setMainImage(mappedProduct.images[0]);
                }

                // Fetch related products
                const { data: relatedData } = await supabase
                    .from('products')
                    .select(`*, categories(name)`)
                    .neq('id', prodData.id)
                    .eq('category_id', prodData.category_id)
                    .limit(4);

                let related = (relatedData || []).map(p => ({
                    ...p,
                    category: p.categories?.name || 'Uncategorized',
                    images: [p.primary_image_url, p.hover_image_url].filter(Boolean)
                }));

                if (related.length < 4) {
                    const { data: moreData } = await supabase
                        .from('products')
                        .select(`*, categories(name)`)
                        .neq('id', prodData.id)
                        .limit(4 - related.length);
                        
                    if (moreData) {
                        related = [...related, ...moreData.map(p => ({
                            ...p,
                            category: p.categories?.name || 'Uncategorized',
                            images: [p.primary_image_url, p.hover_image_url].filter(Boolean)
                        }))];
                    }
                }
                
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
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;
    }

    if (!product) {
        return null; // Handled by redirect in useEffect
    }

    return (
        <div className="container" style={{ padding: '60px 15px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px', marginBottom: '80px' }}>
                {/* Left Column - Gallery */}
                <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
                    <div style={{ marginBottom: '20px', border: '1px solid #eee', position: 'relative' }}>
                        {/* Organic badge placeholder if needed */}
                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                            <img src="/images/organic-badge.png" alt="Organic" style={{ width: '40px', display: 'none' }} />
                        </div>
                        <img src={mainImage} alt={product.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            {product.images.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setMainImage(img)}
                                    style={{ 
                                        width: '100px', 
                                        height: '100px', 
                                        border: mainImage === img ? '2px solid #7c5847' : '1px solid #eee', 
                                        cursor: 'pointer',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <img src={img} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column - Details */}
                <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
                    <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '20px', fontWeight: '400', fontFamily: 'inherit' }}>
                        {product.title}
                    </h1>
                    
                    <div style={{ marginBottom: '40px' }}>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: '#7c5847', 
                                color: 'white', 
                                padding: '12px 30px', 
                                fontSize: '15px', 
                                fontWeight: '500', 
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '3px',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        >
                            Enquiry Now 
                            <svg style={{ marginLeft: '10px', width: '14px', fill: 'white' }} viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path></svg>
                        </button>
                    </div>

                    {/* Stacked Details */}
                    <div>
                        {[
                            { title: 'Description', content: product.description },
                            { title: 'Specification', content: product.specification },
                            { title: 'Plant Part & Origin', content: product.plant_part_origin },
                            { title: 'Uses & Benefits', content: product.uses_benefits }
                        ].map((tab, idx) => {
                            if (!tab.content) return null;
                            return (
                                <div key={idx} style={{ marginBottom: '25px', borderBottom: idx < 3 ? '1px solid #eaeaea' : 'none', paddingBottom: '25px' }}>
                                    <h4 
                                        style={{ 
                                            color: '#7c5847',
                                            fontWeight: '600',
                                            fontSize: '15px',
                                            margin: '0 0 15px 0'
                                        }}
                                    >
                                        {tab.title}
                                    </h4>
                                    <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.8' }}>
                                        <div dangerouslySetInnerHTML={{ __html: tab.content }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '50px' }}>
                <h3 style={{ fontSize: '24px', color: '#333', marginBottom: '30px', fontWeight: '600' }}>Related products</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
                    {relatedProducts.map(rp => (
                        <div key={rp.slug} style={{ display: 'flex', flexDirection: 'column' }}>
                            <Link to={`/product/${rp.slug}`} style={{ display: 'block', marginBottom: '15px', border: '1px solid #eee' }}>
                                <img src={rp.images[0]} alt={rp.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </Link>
                            <h4 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>
                                <Link to={`/product/${rp.slug}`} style={{ color: '#333', textDecoration: 'none' }}>{rp.title}</Link>
                            </h4>
                            <div style={{ color: '#999', fontSize: '13px', marginBottom: '15px' }}>{rp.category}</div>
                            <button 
                                onClick={() => {
                                    setProduct(rp);
                                    setIsModalOpen(true);
                                }}
                                style={{ 
                                    backgroundColor: '#7c5847', 
                                    color: 'white', 
                                    textAlign: 'center', 
                                    padding: '10px 0', 
                                    fontSize: '14px', 
                                    fontWeight: '600', 
                                    textTransform: 'uppercase',
                                    border: 'none',
                                    cursor: 'pointer',
                                    marginTop: 'auto'
                                }}
                            >
                                Enquiry Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            <ProductEnquiryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={product} 
            />
        </div>
    );
}
