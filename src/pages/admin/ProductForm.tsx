import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Upload, Loader } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  // Images
  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [hoverImage, setHoverImage] = useState<File | null>(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null);
  const [hoverImagePreview, setHoverImagePreview] = useState<string | null>(null);
  const [compressingImage, setCompressingImage] = useState<'primary' | 'hover' | null>(null);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) {
      setTitle(data.title);
      setSlug(data.slug);
      setDescription(data.description || '');
      setCategoryId(data.category_id || '');
      setPrimaryImagePreview(data.primary_image_url);
      setHoverImagePreview(data.hover_image_url);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'primary' | 'hover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressingImage(type);
    
    try {
      const options = {
        maxSizeMB: 1, // Compress to max 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      const previewUrl = URL.createObjectURL(compressedFile);
      
      if (type === 'primary') {
        setPrimaryImage(compressedFile);
        setPrimaryImagePreview(previewUrl);
      } else {
        setHoverImage(compressedFile);
        setHoverImagePreview(previewUrl);
      }
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Error compressing image. Please try another file.');
    } finally {
      setCompressingImage(null);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalPrimaryUrl = primaryImagePreview;
      let finalHoverUrl = hoverImagePreview;

      // Upload new images if selected
      if (primaryImage) {
        const url = await uploadImage(primaryImage);
        if (url) finalPrimaryUrl = url;
      }
      if (hoverImage) {
        const url = await uploadImage(hoverImage);
        if (url) finalHoverUrl = url;
      }

      const productData = {
        title,
        slug,
        description,
        category_id: categoryId || null,
        primary_image_url: finalPrimaryUrl,
        hover_image_url: finalHoverUrl,
      };

      if (isEditing) {
        await supabase.from('products').update(productData).eq('id', id);
      } else {
        await supabase.from('products').insert([productData]);
      }

      navigate('/petricor-hq/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="admin-header-action">
        <h1 className="admin-page-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eaeaea' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
          
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={!isEditing ? generateSlug : undefined}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label className="admin-form-label">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="admin-form-input"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label className="admin-form-label">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-form-input admin-form-textarea"
            />
          </div>

          {/* Image Uploads */}
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">Primary Image (Auto-compressed to &lt; 1MB)</label>
            <div style={{ border: '2px dashed #ddd', borderRadius: '6px', padding: '30px', textAlign: 'center', backgroundColor: '#fcfcfc', position: 'relative' }}>
              <div style={{ marginBottom: '15px' }}>
                {primaryImagePreview ? (
                  <img src={primaryImagePreview} alt="Preview" style={{ maxHeight: '150px', objectFit: 'contain' }} />
                ) : (
                  <Upload size={40} color="#ccc" style={{ margin: '0 auto' }} />
                )}
              </div>
              <label style={{ cursor: compressingImage === 'primary' ? 'not-allowed' : 'pointer', color: '#7c5847', fontWeight: '500', display: 'inline-block' }}>
                <span>{compressingImage === 'primary' ? 'Compressing...' : 'Upload a file'}</span>
                <input type="file" style={{ display: 'none' }} accept="image/*" disabled={compressingImage === 'primary'} onChange={(e) => handleImageChange(e, 'primary')} />
              </label>
              {compressingImage === 'primary' && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <Loader size={24} className="animate-spin" color="#7c5847" />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#7c5847' }}>Compressing image...</span>
                </div>
              )}
            </div>
          </div>

          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">Hover Image (Auto-compressed to &lt; 1MB)</label>
            <div style={{ border: '2px dashed #ddd', borderRadius: '6px', padding: '30px', textAlign: 'center', backgroundColor: '#fcfcfc', position: 'relative' }}>
              <div style={{ marginBottom: '15px' }}>
                {hoverImagePreview ? (
                  <img src={hoverImagePreview} alt="Preview" style={{ maxHeight: '150px', objectFit: 'contain' }} />
                ) : (
                  <Upload size={40} color="#ccc" style={{ margin: '0 auto' }} />
                )}
              </div>
              <label style={{ cursor: compressingImage === 'hover' ? 'not-allowed' : 'pointer', color: '#7c5847', fontWeight: '500', display: 'inline-block' }}>
                <span>{compressingImage === 'hover' ? 'Compressing...' : 'Upload a file'}</span>
                <input type="file" style={{ display: 'none' }} accept="image/*" disabled={compressingImage === 'hover'} onChange={(e) => handleImageChange(e, 'hover')} />
              </label>
              {compressingImage === 'hover' && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <Loader size={24} className="animate-spin" color="#7c5847" />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#7c5847' }}>Compressing image...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', paddingTop: '20px', borderTop: '1px solid #eaeaea' }}>
          <button
            type="button"
            onClick={() => navigate('/petricor-hq/products')}
            className="admin-btn admin-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
