import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductEnquiryModal from '../components/ProductEnquiryModal';
import { ProductSkeleton } from '../components/Skeleton';

export default function AllProducts() {
    const [currentPage, setCurrentPage] = useState(1);
    const [productsData, setProductsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [hoveredProductSlug, setHoveredProductSlug] = useState<string | null>(null);

    const productsPerPage = 12;
    const totalPages = Math.ceil(productsData.length / productsPerPage);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = productsData.slice(indexOfFirstProduct, indexOfLastProduct);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data } = await supabase.from('products').select(`*, categories(name)`);
            if (data) {
                const mappedProducts = data.map(p => ({
                    ...p,
                    category: p.categories?.name || 'Uncategorized',
                    images: [p.primary_image_url || '', p.hover_image_url || ''].filter(Boolean)
                }));
                setProductsData(mappedProducts);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    return (
        <div style={{ backgroundColor: '#f9f9f9', paddingBottom: '80px' }}>
            <div style={{ textAlign: 'center', padding: '60px 15px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
                <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
                    <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link> / 
                    <span style={{ color: '#333', fontWeight: '500', marginLeft: '5px' }}>All Product</span>
                </div>
                <h1 style={{ fontSize: '42px', color: '#333', fontWeight: 'bold', margin: 0 }}>All Product</h1>
            </div>

            <div className="container" style={{ maxWidth: '1200px', margin: '60px auto 0', padding: '0 15px' }}>
                {loading ? (
                    <div className="all-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                        {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : (
                <div className="all-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                    {currentProducts.map((product, idx) => (
                        <div key={idx} className="product-card" style={{ border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff', transition: 'transform 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <Link 
                                to={`/product/${product.slug}`} 
                                style={{ display: 'block', backgroundColor: '#fdfdfd', padding: '20px', borderBottom: '1px solid #f5f5f5' }}
                                onMouseEnter={() => setHoveredProductSlug(product.slug)}
                                onMouseLeave={() => setHoveredProductSlug(null)}
                            >
                                <img 
                                    src={hoveredProductSlug === product.slug && product.images[1] ? product.images[1] : product.images[0]} 
                                    alt={product.title} 
                                    className="product-img"
                                    style={{ width: '100%', height: '220px', objectFit: 'contain' }} 
                                />
                            </Link>
                            <div style={{ padding: '20px' }}>
                                <Link to={`/product/${product.slug}`} style={{ display: 'block', fontSize: '16px', color: '#333', textDecoration: 'none', fontWeight: '500', marginBottom: '5px' }}>{product.title}</Link>
                                <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>{product.category}</div>
                                <button 
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                    style={{ display: 'block', width: '100%', textAlign: 'center', backgroundColor: '#7c5847', color: '#fff', padding: '12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                                >
                                    Enquire Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
                        {/* Prev */}
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{
                                height: '36px',
                                padding: '0 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                color: currentPage === 1 ? '#ccc' : '#7c5847',
                                fontSize: '13px',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.5px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            ← Prev
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: currentPage === page ? '1px solid #7c5847' : '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    backgroundColor: currentPage === page ? '#7c5847' : 'transparent',
                                    color: currentPage === page ? '#fff' : '#666',
                                    fontSize: '13px',
                                    fontWeight: currentPage === page ? '600' : '400',
                                    cursor: 'pointer',
                                    letterSpacing: '0.5px',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next */}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                                height: '36px',
                                padding: '0 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                color: currentPage === totalPages ? '#ccc' : '#7c5847',
                                fontSize: '13px',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.5px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
            
            <ProductEnquiryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct} 
            />
        </div>
    );
}
