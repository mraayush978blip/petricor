import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) console.error('Error fetching categories:', error);
    else setCategories(data || []);
    setLoading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCategoryName.trim() }]);

    if (error) {
      alert('Error adding category: ' + error.message);
    } else {
      setNewCategoryName('');
      fetchCategories();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting category: ' + error.message);
    } else {
      fetchCategories();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) {
      setEditingId(null);
      return;
    }

    const { error } = await supabase
      .from('categories')
      .update({ name: editName.trim() })
      .eq('id', editingId);

    if (error) {
      alert('Error updating category: ' + error.message);
    } else {
      setEditingId(null);
      fetchCategories();
    }
  };

  if (loading) return <div>Loading categories...</div>;

  return (
    <div>
      <h1 className="admin-page-title">Categories</h1>

      {/* Add Category Form */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eaeaea', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Add New Category</h2>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '15px' }}>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category Name"
            className="admin-form-input"
            style={{ flex: 1 }}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="admin-btn admin-btn-primary"
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            <Plus size={20} />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', color: '#888' }}>No categories found.</td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td style={{ fontWeight: '500' }}>
                    {editingId === category.id ? (
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="admin-form-input" 
                        style={{ padding: '6px 10px' }} 
                        autoFocus 
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {editingId === category.id ? (
                        <>
                          <button onClick={handleSaveEdit} style={{ background: '#e6ffed', border: 'none', color: '#38a169', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} title="Save">
                            <Check size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} style={{ background: '#f4f4f4', border: 'none', color: '#666', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} title="Cancel">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(category)}
                            style={{ background: 'none', border: 'none', color: '#7c5847', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                            title="Edit Category"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                            title="Delete Category"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
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

export default Categories;
