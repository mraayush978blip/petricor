import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Upload, Loader, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../lib/cropImage';
import { useCallback } from 'react';

interface Event {
  id: string;
  title: string | null;
  image_url: string;
  created_at: string;
}

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) console.error('Error fetching events:', error);
    else setEvents(data || []);
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImageToCrop(objectUrl);
    setShowCropper(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    
    setCompressing(true);
    try {
      const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (!croppedFile) throw new Error("Failed to crop image");
      
      const options = {
        maxSizeMB: 1, 
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.9
      };
      
      const compressedFile = await imageCompression(croppedFile, options);
      setImage(compressedFile);
      setImagePreview(URL.createObjectURL(compressedFile));
      setShowCropper(false);
      setImageToCrop(null);
    } catch (error) {
      console.error('Error cropping/compressing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setCompressing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const syntheticEvent = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleImageChange(syntheticEvent);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert('Please upload an image.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('events')
        .insert([{ title: title.trim() || null, image_url: publicUrl }]);

      if (dbError) throw dbError;

      setTitle('');
      setImage(null);
      setImagePreview(null);
      fetchEvents();
    } catch (error: any) {
      console.error('Error adding event:', error);
      alert('Error adding event: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (event: Event) => {
    if (!window.confirm('Are you sure you want to delete this event? The image will be moved to the Storage Bucket Manager unused tab for cleanup.')) return;
    
    try {
      // Intentionally NOT deleting the storage file here so it can be managed by the Storage Bucket Manager
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;
      fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert('Error deleting event: ' + error.message);
    }
  };

  if (loading) return <div>Loading events...</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="admin-back-btn">
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <h1 className="admin-page-title">Events & Exhibitions</h1>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eaeaea', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Add New Event</h2>
        <form onSubmit={handleAddEvent}>
          <div className="admin-form-grid">
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CPHI Frankfurt 2023"
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <label className="admin-form-label">Event Image * (Required)</label>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{ 
                  border: dragActive ? '2px dashed #7c5847' : '2px dashed #ddd', 
                  backgroundColor: dragActive ? '#fdfaf8' : '#fcfcfc',
                  borderRadius: '6px', 
                  padding: '30px', 
                  textAlign: 'center', 
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ marginBottom: '15px', pointerEvents: 'none' }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ maxHeight: '150px', objectFit: 'contain' }} />
                  ) : (
                    <Upload size={40} color="#ccc" style={{ margin: '0 auto' }} />
                  )}
                </div>
                <label style={{ cursor: compressing ? 'not-allowed' : 'pointer', color: '#7c5847', fontWeight: '500', display: 'inline-block' }}>
                  <span>{compressing ? 'Compressing...' : 'Drag & drop or Upload a file'}</span>
                  <input type="file" style={{ display: 'none' }} accept="image/*" disabled={compressing} onChange={handleImageChange} required={!image} />
                </label>
                {compressing && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <Loader size={24} className="animate-spin" color="#7c5847" />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#7c5847' }}>Compressing image...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={isSubmitting || !image}
              className="admin-btn admin-btn-primary"
              style={{ opacity: isSubmitting || !image ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>Add Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Date Added</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>No events found.</td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <img src={event.image_url} alt={event.title || 'Event'} style={{ height: '50px', width: '80px', objectFit: 'contain' }} />
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {event.title || <span style={{ color: '#aaa', fontStyle: 'italic' }}>No title</span>}
                  </td>
                  <td>
                    {new Date(event.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(event)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                      title="Delete Event"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCropper && imageToCrop && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div style={{ padding: '20px', backgroundColor: 'white', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#555' }}>Zoom:</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ width: '200px' }}
            />
            <button 
              type="button"
              onClick={() => { setShowCropper(false); setImageToCrop(null); }}
              className="admin-btn admin-btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleConfirmCrop}
              disabled={compressing}
              className="admin-btn admin-btn-primary"
            >
              {compressing ? (
                <>
                  <Loader size={16} className="animate-spin" /> Processing...
                </>
              ) : 'Confirm Crop'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
