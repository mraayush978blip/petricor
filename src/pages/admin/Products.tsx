import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Upload, X, Search, Filter, ArrowLeft } from 'lucide-react';
import { slugify } from '../../lib/utils';

interface Product {
  id: string;
  title: string;
  primary_image_url: string;
  categories: { name: string };
  product_categories?: { categories: { name: string } }[];
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Bulk add state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkTitles, setBulkTitles] = useState('');
  const [isBulking, setIsBulking] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        primary_image_url,
        categories (name),
        product_categories (categories (name))
      `)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching products:', error);
    else setProducts(data as any || []);
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const cats = new Set<string>();
    if (product.categories?.name) cats.add(product.categories.name);
    if (product.product_categories) {
      product.product_categories.forEach((pc: any) => {
        if (pc.categories?.name) cats.add(pc.categories.name);
      });
    }
    const categoryString = Array.from(cats).join(', ');

    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          categoryString.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? cats.has(selectedCategory) : true;

    return matchesSearch && matchesCategory;
  });

  const extractStoragePath = (url: string): string | null => {
    if (!url) return null;
    const bucketName = 'product-images';
    if (url.includes(`/${bucketName}/`)) {
      const parts = url.split(`/${bucketName}/`);
      if (parts[1]) {
        return decodeURIComponent(parts[1].split('?')[0]);
      }
    }
    return null;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? All attached images will also be removed from storage.')) return;
    
    try {
      // 1. Fetch product image URLs from database
      const { data: product } = await supabase
        .from('products')
        .select('primary_image_url, hover_image_url, images')
        .eq('id', id)
        .single();

      if (product) {
        const imagePaths: string[] = [];

        if (product.primary_image_url) {
          const path = extractStoragePath(product.primary_image_url);
          if (path) imagePaths.push(path);
        }

        if (product.hover_image_url) {
          const path = extractStoragePath(product.hover_image_url);
          if (path) imagePaths.push(path);
        }

        if (Array.isArray(product.images)) {
          product.images.forEach((imgUrl: string) => {
            const path = extractStoragePath(imgUrl);
            if (path && !imagePaths.includes(path)) imagePaths.push(path);
          });
        }

        // 2. Remove files from Supabase Storage bucket
        if (imagePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove(imagePaths);

          if (storageError) {
            console.warn('Storage file deletion note:', storageError.message);
          }
        }
      }

      // 3. Delete database record
      const { error: dbError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (dbError) {
        alert('Error deleting product: ' + dbError.message);
      } else {
        fetchProducts();
      }
    } catch (err: any) {
      console.error('Error deleting product and images:', err);
      alert('Error during deletion: ' + (err.message || err));
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkTitles.trim()) {
      alert('Please enter at least one product title.');
      return;
    }
    
    setIsBulking(true);
    const titles = bulkTitles.split('\n').map(t => t.trim()).filter(t => t.length > 0);
    
    const productsToInsert = titles.map(title => ({
      title,
      slug: slugify(title),
      category_id: bulkCategory || null
    }));
    const { data, error } = await supabase.from('products').insert(productsToInsert).select('id');

    if (error) {
      alert('Error adding products: ' + error.message);
    } else {
      if (data && bulkCategory) {
        const relations = data.map(p => ({ product_id: p.id, category_id: bulkCategory }));
        await supabase.from('product_categories').insert(relations);
      }
      setShowBulkModal(false);
      setBulkTitles('');
      setBulkCategory('');
      fetchProducts();
    }
    setIsBulking(false);
  };

  if (loading && products.length === 0) return <div>Loading products...</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="admin-back-btn">
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="admin-header-action">
        <div>
          <h1 className="admin-page-title" style={{ marginBottom: '4px' }}>Products</h1>
          <span style={{ fontSize: '13px', color: '#666' }}>
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowBulkModal(true)} 
            className="admin-btn admin-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Upload size={20} />
            <span>Bulk Add</span>
          </button>
          <Link to="/ad/products/new" className="admin-btn admin-btn-primary">
            <Plus size={20} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Product Search & Category Filter Bar */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '12px', 
        marginBottom: '20px', 
        backgroundColor: '#ffffff', 
        padding: '16px', 
        borderRadius: '8px', 
        border: '1px solid #eaeaea', 
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)' 
      }}>
        <div style={{ flex: '1', minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: '#999' }} />
          <input 
            type="text"
            placeholder="Search products by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-form-input"
            style={{ paddingLeft: '38px', paddingRight: searchQuery ? '36px' : '12px' }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
          <Filter size={18} style={{ color: '#7c5847' }} />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="admin-form-input"
            style={{ padding: '10px 12px' }}
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Title</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                  {searchQuery || selectedCategory ? 'No matching products found.' : 'No products found.'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ height: '50px', width: '50px', backgroundColor: '#f4f4f4', borderRadius: '4px', overflow: 'hidden' }}>
                      {product.primary_image_url ? (
                        <img src={product.primary_image_url} alt={product.title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '10px', textAlign: 'center' }}>No Img</div>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: '500' }}>{product.title}</td>
                  <td>
                    <span className="admin-badge gray">
                      {(() => {
                        const cats = new Set<string>();
                        if (product.categories?.name) cats.add(product.categories.name);
                        if (product.product_categories) {
                          product.product_categories.forEach((pc: any) => {
                            if (pc.categories?.name) cats.add(pc.categories.name);
                          });
                        }
                        return Array.from(cats).join(', ') || 'Uncategorized';
                      })()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <Link to={`/ad/products/edit/${product.id}`} className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px' }}>
                        <Edit size={16} />
                        Edit
                      </Link>
                      <button
                         onClick={() => {
                          if(window.confirm('Clone this product?')) {
                            // Minimal clone support: navigate to new with query param?
                            // For simplicity, we just have bulk add for now.
                          }
                         }}
                         className="admin-btn admin-btn-secondary"
                         style={{ padding: '6px 12px', display: 'none' }}
                      >
                         Clone
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '6px 12px' }}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '12px',
            width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#333' }}>Bulk Add Products</h2>
              <button onClick={() => setShowBulkModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#666" />
              </button>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Select Category (Optional)</label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="admin-form-input"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Product Titles (One per line)</label>
              <textarea
                rows={10}
                value={bulkTitles}
                onChange={(e) => setBulkTitles(e.target.value)}
                className="admin-form-input admin-form-textarea"
                placeholder="Ashwagandha Extract&#10;Turmeric Extract&#10;Green Tea Extract"
                style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Enter the names of the products you want to create. Slugs will be automatically generated.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setShowBulkModal(false)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkAdd}
                disabled={isBulking || !bulkTitles.trim()}
                className="admin-btn admin-btn-primary"
                style={{ opacity: (isBulking || !bulkTitles.trim()) ? 0.7 : 1 }}
              >
                {isBulking ? 'Adding...' : 'Add Products'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
