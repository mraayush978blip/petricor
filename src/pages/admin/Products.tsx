import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { slugify } from '../../lib/utils';

interface Product {
  id: string;
  title: string;
  primary_image_url: string;
  categories: { name: string };
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        categories (name)
      `)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching products:', error);
    else setProducts(data as any || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting product: ' + error.message);
    } else {
      fetchProducts();
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

    const { error } = await supabase.from('products').insert(productsToInsert);
    
    if (error) {
      alert('Error adding products: ' + error.message);
    } else {
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
      <div className="admin-header-action">
        <h1 className="admin-page-title">Products</h1>
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>No products found.</td>
              </tr>
            ) : (
              products.map((product) => (
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
                    <span className="admin-badge gray">{product.categories?.name || 'Uncategorized'}</span>
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
