import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Upload, Loader, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { slugify } from '../../lib/utils';

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
  const [specification, setSpecification] = useState('');
  const [plantAndOrigin, setPlantAndOrigin] = useState('');
  const [usesAndBenefits, setUsesAndBenefits] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  
  // Images
  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [hoverImage, setHoverImage] = useState<File | null>(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null);
  const [hoverImagePreview, setHoverImagePreview] = useState<string | null>(null);
  const [compressingImage, setCompressingImage] = useState<'primary' | 'hover' | null>(null);
  const [dragActive, setDragActive] = useState<'primary' | 'hover' | null>(null);

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
    const { data } = await supabase.from('products').select('*, product_categories(category_id)').eq('id', id).single();
    if (data) {
      setTitle(data.title);
      setSlug(data.slug);
      setDescription(data.description || '');
      setSpecification(data.specification || '');
      setPlantAndOrigin(data.plant_and_origin || '');
      setUsesAndBenefits(data.uses_and_benefits || '');
      
      const cats = new Set<string>();
      if (data.category_id) cats.add(data.category_id);
      if (data.product_categories) {
        data.product_categories.forEach((pc: any) => cats.add(pc.category_id));
      }
      setCategoryIds(Array.from(cats));

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
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.9
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

  const handleDrag = (e: React.DragEvent, type: 'primary' | 'hover') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(type);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, type: 'primary' | 'hover') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const syntheticEvent = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleImageChange(syntheticEvent, type);
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
        slug: slugify(slug), // ensure it's sanitized before saving
        description,
        specification,
        plant_and_origin: plantAndOrigin,
        uses_and_benefits: usesAndBenefits,
        category_id: categoryIds.length > 0 ? categoryIds[0] : null,
        primary_image_url: finalPrimaryUrl,
        hover_image_url: finalHoverUrl,
      };

      let productId = id;
      if (isEditing) {
        await supabase.from('products').update(productData).eq('id', id);
        await supabase.from('product_categories').delete().eq('product_id', id);
      } else {
        const { data, error } = await supabase.from('products').insert([productData]).select('id').single();
        if (error) throw error;
        productId = data.id;
      }

      if (categoryIds.length > 0 && productId) {
        const relations = categoryIds.map(catId => ({
          product_id: productId,
          category_id: catId
        }));
        await supabase.from('product_categories').insert(relations);
      }

      navigate('/ad/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    if (title && !slug) {
      setSlug(slugify(title));
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="admin-back-btn">
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="admin-header-action">
        <h1 className="admin-page-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eaeaea' }}>
        <div className="admin-form-grid">
          
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
              onBlur={(e) => setSlug(slugify(e.target.value))}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label className="admin-form-label">Categories</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '10px 0' }}>
              {categories.map((cat) => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCategoryIds([...categoryIds, cat.id]);
                      } else {
                        setCategoryIds(categoryIds.filter(id => id !== cat.id));
                      }
                    }}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#7c5847' }}
                  />
                  <span style={{ fontSize: '14px' }}>{cat.name}</span>
                </label>
              ))}
            </div>
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

          <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label className="admin-form-label">Specification</label>
            <textarea
              rows={4}
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              className="admin-form-input admin-form-textarea"
              placeholder="e.g. &#10;• Dried fruit powder&#10;• Standardised extract — 20% tannins"
            />
          </div>

          <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label className="admin-form-label">Plant Part & Origin</label>
            <input
              type="text"
              value={plantAndOrigin}
              onChange={(e) => setPlantAndOrigin(e.target.value)}
              className="admin-form-input"
              placeholder="e.g. Fruit (dried) — Neemuch / Madhya Pradesh, India"
            />
          </div>

          <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label className="admin-form-label">Uses & Benefits</label>
            <textarea
              rows={4}
              value={usesAndBenefits}
              onChange={(e) => setUsesAndBenefits(e.target.value)}
              className="admin-form-input admin-form-textarea"
              placeholder="e.g. &#10;• Natural Vitamin C&#10;• Immune system support"
            />
          </div>

          {/* Image Uploads */}
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-form-label">Primary Image (Auto-compressed to &lt; 1MB)</label>
            <div 
              onDragEnter={(e) => handleDrag(e, 'primary')}
              onDragOver={(e) => handleDrag(e, 'primary')}
              onDragLeave={(e) => handleDrag(e, 'primary')}
              onDrop={(e) => handleDrop(e, 'primary')}
              style={{ 
                border: dragActive === 'primary' ? '2px dashed #7c5847' : '2px dashed #ddd', 
                backgroundColor: dragActive === 'primary' ? '#fdfaf8' : '#fcfcfc',
                borderRadius: '6px', 
                padding: '30px', 
                textAlign: 'center', 
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ marginBottom: '15px', pointerEvents: 'none' }}>
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
            <div 
              onDragEnter={(e) => handleDrag(e, 'hover')}
              onDragOver={(e) => handleDrag(e, 'hover')}
              onDragLeave={(e) => handleDrag(e, 'hover')}
              onDrop={(e) => handleDrop(e, 'hover')}
              style={{ 
                border: dragActive === 'hover' ? '2px dashed #7c5847' : '2px dashed #ddd', 
                backgroundColor: dragActive === 'hover' ? '#fdfaf8' : '#fcfcfc',
                borderRadius: '6px', 
                padding: '30px', 
                textAlign: 'center', 
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ marginBottom: '15px', pointerEvents: 'none' }}>
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
            onClick={() => navigate('/ad/products')}
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
