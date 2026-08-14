import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductEnquiryModal from '../components/ProductEnquiryModal';
import { ProductSkeleton } from '../components/Skeleton';
import ProgressiveImage from '../components/ProgressiveImage';
import { ChevronDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSEO } from '../hooks/useSEO';

export default function AllProducts() {
    useSEO({
        title: "All Products | Petricor Botanical Extracts",
        description: "Browse Petricor's complete catalog of premium botanical extracts. High-quality, ethically sourced ingredients for your manufacturing needs.",
        url: "https://petricor.co.in/products"
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [productsData, setProductsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data } = await supabase.from('products').select(`*, categories!products_category_id_fkey(name), product_categories(categories(name))`);
            if (data) {
                const mappedProducts = data.map(p => {
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
        fetchProducts();
    }, []);

    // Filter by category if URL has ?category=...
    const queryParams = new URLSearchParams(location.search);
    const categoryFilter = queryParams.get('category');
    
    const filteredProducts = useMemo(() => {
        let result = productsData;
        if (categoryFilter) {
            result = result.filter(p => p.categoryArray?.includes(categoryFilter) || p.category === categoryFilter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.title?.toLowerCase().includes(query) || 
                p.name?.toLowerCase().includes(query) || 
                p.description?.toLowerCase().includes(query)
            );
        }
        return result;
    }, [productsData, categoryFilter, searchQuery]);

    // Reset pagination when category or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, searchQuery]);

    const uniqueCategories = useMemo(() => {
        const cats = new Set<string>();
        productsData.forEach(p => {
            if (p.categoryArray) p.categoryArray.forEach((c: string) => cats.add(c));
            else if (p.category) cats.add(p.category);
        });
        return Array.from(cats).sort();
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
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px', position: 'relative' }}>
                    <div 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontSize: 'clamp(28px, 4vw, 42px)',
                            color: '#333',
                            fontWeight: 'bold',
                        }}
                    >
                        <span>{categoryFilter ? categoryFilter : 'View All Products'}</span>
                        <motion.div 
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }} 
                            transition={{ duration: 0.3 }}
                            style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}
                        >
                            <ChevronDown size={36} color="#333" />
                        </motion.div>
                    </div>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    margin: '0 auto',
                                    backgroundColor: '#fff',
                                    border: '1px solid #eaeaea',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                    zIndex: 50,
                                    width: '320px',
                                    maxWidth: 'calc(100vw - 30px)',
                                    overflow: 'hidden',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}
                            >
                                <div 
                                    onClick={() => {
                                        navigate(`/products`);
                                        setIsDropdownOpen(false);
                                    }}
                                    style={{
                                        padding: '12px 20px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f0f0f0',
                                        fontWeight: categoryFilter ? 'normal' : '600',
                                        backgroundColor: categoryFilter ? 'transparent' : '#f9f9f9',
                                        color: '#333',
                                        fontSize: '15px',
                                        textAlign: 'center',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f4f4f4'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = categoryFilter ? 'transparent' : '#f9f9f9'}
                                >
                                    View All Products
                                </div>
                                {uniqueCategories.map(cat => (
                                    <div 
                                        key={cat}
                                        onClick={() => {
                                            navigate(`/products?category=${encodeURIComponent(cat)}`);
                                            setIsDropdownOpen(false);
                                        }}
                                        style={{
                                            padding: '12px 20px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f0f0f0',
                                            fontWeight: categoryFilter === cat ? '600' : 'normal',
                                            backgroundColor: categoryFilter === cat ? '#f9f9f9' : 'transparent',
                                            color: '#333',
                                            fontSize: '15px',
                                            textAlign: 'center',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f4f4f4'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = categoryFilter === cat ? '#f9f9f9' : 'transparent'}
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                    <motion.div 
                        initial={false}
                        animate={{ 
                            width: (!isMobile || isSearchOpen) ? (isMobile ? 'calc(100vw - 30px)' : '400px') : '44px',
                            backgroundColor: (!isMobile || isSearchOpen) ? '#fff' : 'transparent',
                            borderColor: (!isMobile || isSearchOpen) ? '#ddd' : 'transparent',
                            boxShadow: (!isMobile || isSearchOpen) ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'
                        }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '44px',
                            borderRadius: '22px',
                            border: '1px solid',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        <div 
                            style={{ 
                                padding: '0 12px', 
                                display: 'flex', 
                                alignItems: 'center',
                                cursor: isMobile && !isSearchOpen ? 'pointer' : 'default',
                                height: '100%',
                                zIndex: 2
                            }}
                            onClick={() => {
                                if (isMobile && !isSearchOpen) {
                                    setIsSearchOpen(true);
                                }
                            }}
                        >
                            <Search size={20} color={isMobile && !isSearchOpen ? '#666' : '#999'} />
                        </div>
                        
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                height: '100%',
                                padding: '0 10px 0 0',
                                fontSize: '15px',
                                color: '#333',
                                backgroundColor: 'transparent',
                                opacity: (!isMobile || isSearchOpen) ? 1 : 0,
                                pointerEvents: (!isMobile || isSearchOpen) ? 'auto' : 'none',
                                transition: 'opacity 0.2s',
                            }}
                        />
                        
                        {isMobile && isSearchOpen && (
                            <div 
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    if (!searchQuery) {
                                        // just close
                                    }
                                }}
                                style={{
                                    padding: '0 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    height: '100%'
                                }}
                            >
                                <X size={18} color="#999" />
                            </div>
                        )}
                        {!isMobile && searchQuery && (
                            <div 
                                onClick={() => setSearchQuery('')}
                                style={{
                                    padding: '0 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    height: '100%'
                                }}
                            >
                                <X size={18} color="#999" />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '1150px', width: '95%', margin: '60px auto 0', padding: '0' }}>
                {loading ? (
                    <div className="all-products-grid">
                        {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 20px', color: '#666' }}>
                        <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '10px' }}>No products found</h2>
                        <p style={{ fontSize: '16px' }}>There are no products matching your current search. Please check out our other products!</p>
                        <button 
                            onClick={() => {
                                setSearchQuery('');
                                if (categoryFilter) {
                                    navigate('/products');
                                }
                            }}
                            style={{
                                marginTop: '20px',
                                padding: '10px 24px',
                                backgroundColor: '#1a1a1a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '25px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
                        >
                            View All Products
                        </button>
                    </div>
                ) : (
                <div className="all-products-grid">
                    {currentProducts.map((product, idx) => (
                        <div key={idx} className="product-card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff', transition: 'transform 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', height: '100%' }}>
                            <Link 
                                to={`/product/${product.slug}`} 
                                style={{ display: 'block', backgroundColor: '#f9f9f9', padding: '0' }}
                            >
                                <div className="product-image-wrapper" style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
                                    <div className="product-img-primary">
                                        <ProgressiveImage 
                                            src={product.images[0]} 
                                            alt={product.title} 
                                        />
                                    </div>
                                    {product.images && product.images[1] && (
                                        <div className="product-img-secondary">
                                            <ProgressiveImage 
                                                src={product.images[1]} 
                                                alt={product.title} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="product-card-content" style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <Link to={`/product/${product.slug}`} className="product-card-title" style={{ display: 'block', fontSize: '15px', color: '#222', textDecoration: 'none', fontWeight: '700', marginBottom: '3px', lineHeight: '1.3' }}>
                                    {product.title}
                                </Link>
                                <Link to={`/products?category=${encodeURIComponent(categoryFilter && product.categoryArray?.includes(categoryFilter) ? categoryFilter : (product.categoryArray?.[0] || product.category))}`} className="product-card-category" style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '0', lineHeight: '1.4', textDecoration: 'none', flexGrow: 1 }}>
                                    {product.categoryArray?.length > 1 ? `${categoryFilter && product.categoryArray.includes(categoryFilter) ? categoryFilter : product.categoryArray[0]} +${product.categoryArray.length - 1}` : (product.categoryArray?.[0] || product.category)}
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
