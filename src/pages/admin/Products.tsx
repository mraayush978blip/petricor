import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  primary_image_url: string;
  categories: { name: string };
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <div className="admin-header-action">
        <h1 className="admin-page-title">Products</h1>
        <Link to="/admin/products/new" className="admin-btn admin-btn-primary">
          <Plus size={20} />
          <span>Add New Product</span>
        </Link>
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
                        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '10px' }}>No Img</div>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: '500' }}>{product.title}</td>
                  <td>
                    <span className="admin-badge gray">{product.categories?.name || 'Uncategorized'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <Link to={`/admin/products/edit/${product.id}`} className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px' }}>
                        <Edit size={16} />
                        Edit
                      </Link>
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
    </div>
  );
};

export default Products;
