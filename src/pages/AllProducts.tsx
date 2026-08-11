import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductEnquiryModal from '../components/ProductEnquiryModal';
import { ProductSkeleton } from '../components/Skeleton';

export default function AllProducts() {
    const [currentPage, setCurrentPage] = useState(1);
    const [productsData, setProductsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [hoveredProductSlug, setHoveredProductSlug] = useState<string | null>(null);

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

    // Filter by category if URL has ?category=...
    const queryParams = new URLSearchParams(location.search);
    const categoryFilter = queryParams.get('category');
    
    const filteredProducts = useMemo(() => {
        if (!categoryFilter) return productsData;
        return productsData.filter(p => p.category === categoryFilter);
    }, [productsData, categoryFilter]);

    // Reset pagination when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter]);

    const uniqueCategories = useMemo(() => {
        const cats = productsData.map(p => p.category);
        return [...new Set(cats)].sort();
    }, [productsData]);

    const productsPerPage = 16;
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    return (
        <div style={{ backgroundColor: '#f9f9f9', paddingBottom: '80px' }}>
            <div style={{ textAlign: 'center', padding: '60px 15px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
                <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
                    <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link> / 
                    <span style={{ color: '#333', fontWeight: '500', marginLeft: '5px' }}>{categoryFilter ? categoryFilter : 'All Products'}</span>
                </div>
                <h1 style={{ fontSize: '42px', color: '#333', fontWeight: 'bold', margin: '0 0 20px 0' }}>{categoryFilter ? categoryFilter : 'All Products'}</h1>
                
                <select 
                    value={categoryFilter || ''}
                    onChange={(e) => {
                        if (e.target.value) {
                            navigate(`/products?category=${encodeURIComponent(e.target.value)}`);
                        } else {
                            navigate(`/products`);
                        }
                    }}
                    style={{
                        padding: '12px 20px',
                        fontSize: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '30px',
                        backgroundColor: '#fdfdfd',
                        color: '#4a4a4a',
                        outline: 'none',
                        cursor: 'pointer',
                        minWidth: '220px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                        transition: 'border-color 0.2s',
                        appearance: 'none', 
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234a4a4a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 15px top 50%',
                        backgroundSize: '10px auto',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#7c5847'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#ddd'}
                >
                    <option value="">View All Products</option>
                    {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="container" style={{ maxWidth: '100%', width: '95%', margin: '60px auto 0', padding: '0' }}>
                {loading ? (
                    <div className="all-products-grid">
                        {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : (
                <div className="all-products-grid">
                    {currentProducts.map((product, idx) => (
                        <div key={idx} className="product-card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff', transition: 'transform 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', height: '100%' }}>
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
                            <div className="product-card-content" style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <Link to={`/product/${product.slug}`} className="product-card-title" style={{ display: 'block', fontSize: '15px', color: '#222', textDecoration: 'none', fontWeight: '700', marginBottom: '3px', lineHeight: '1.3' }}>
                                    {product.title}
                                </Link>
                                <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="product-card-category" style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '0', lineHeight: '1.4', textDecoration: 'none', flexGrow: 1 }}>
                                    {product.category}
                                </Link>
                                <button 
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                    className="product-card-button"
                                    style={{ display: 'block', width: '100%', textAlign: 'center', backgroundColor: '#6b4236', color: '#fff', padding: '12px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}
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
