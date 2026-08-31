import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Trash2, HardDrive, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert, Clock, ArrowUpDown, Calendar, CheckCircle2, XCircle, Link2, ArrowLeft, Lock } from 'lucide-react';

interface StorageFile {
  name: string;
  fullPath: string;
  sizeBytes: number;
  sizeMB: string;
  publicUrl: string;
  createdAtDate: string;
  createdAtTime: string;
  rawCreatedAt: string;
  isUsed: boolean;
  linkedProductTitle: string | null;
  bucket: string;
}

const StorageCleanup = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [allStorageFiles, setAllStorageFiles] = useState<StorageFile[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unused' | 'used'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    scanStorageImages();
  }, []);

  const scanStorageImages = async () => {
    setScanning(true);
    setMessage(null);
    setSelectedPaths([]);
    try {
      // 1. Fetch ALL active products from database
      const { data: dbProducts, error: dbError } = await supabase
        .from('products')
        .select('id, title, primary_image_url, hover_image_url');

      if (dbError) {
        console.error('Error fetching database products:', dbError.message);
      }

      // Fetch ALL active events from database
      const { data: dbEvents, error: dbEventsError } = await supabase
        .from('events')
        .select('id, title, image_url');

      if (dbEventsError) {
        console.error('Error fetching database events:', dbEventsError.message);
      }

      // Map of image identifier -> title
      const productMap = new Map<string, string>();

      const registerUrlToProduct = (rawUrl: string, title: string) => {
        if (!rawUrl) return;
        
        // Exact raw URL
        productMap.set(rawUrl.trim(), title);
        
        // Decoded URL
        const decoded = decodeURIComponent(rawUrl).trim();
        productMap.set(decoded, title);

        // Extract filename from URL
        const cleanPath = decoded.split('?')[0];
        const fileName = cleanPath.split('/').pop();
        if (fileName) {
          productMap.set(fileName.trim(), title);
          productMap.set(decodeURIComponent(fileName).trim(), title);
        }

        // Extract relative path if includes bucket name
        if (cleanPath.includes('product-images/')) {
          const relPath = cleanPath.split('product-images/')[1];
          if (relPath) productMap.set(relPath.trim(), title);
        }
        if (cleanPath.includes('site-assets/')) {
          const relPath = cleanPath.split('site-assets/')[1];
          if (relPath) productMap.set(relPath.trim(), title);
        }
      };

      if (dbProducts) {
        dbProducts.forEach(p => {
          const title = p.title || 'Untitled Product';
          if (p.primary_image_url) registerUrlToProduct(p.primary_image_url, `Product: ${title}`);
          if (p.hover_image_url) registerUrlToProduct(p.hover_image_url, `Product: ${title}`);
        });
      }

      if (dbEvents) {
        dbEvents.forEach(e => {
          const title = e.title || 'Untitled Event';
          if (e.image_url) registerUrlToProduct(e.image_url, `Event: ${title}`);
        });
      }

      // 2. Fetch storage files from product-images and site-assets buckets
      const rawFileList: { name: string; fullPath: string; size: number; created: string; bucket: string }[] = [];

      const { data: rootFiles } = await supabase.storage.from('product-images').list('', { limit: 1000 });
      if (rootFiles) {
        rootFiles.forEach(f => {
          if (f.metadata && f.metadata.size) {
            rawFileList.push({ name: f.name, fullPath: f.name, size: f.metadata.size, created: f.created_at || f.updated_at || new Date().toISOString(), bucket: 'product-images' });
          }
        });
      }

      const { data: subFiles } = await supabase.storage.from('product-images').list('products', { limit: 1000 });
      if (subFiles) {
        subFiles.forEach(f => {
          if (f.metadata && f.metadata.size) {
            rawFileList.push({ name: f.name, fullPath: `products/${f.name}`, size: f.metadata.size, created: f.created_at || f.updated_at || new Date().toISOString(), bucket: 'product-images' });
          }
        });
      }
      
      const { data: eventFiles } = await supabase.storage.from('site-assets').list('events', { limit: 1000 });
      if (eventFiles) {
        eventFiles.forEach(f => {
          if (f.metadata && f.metadata.size) {
            rawFileList.push({ name: f.name, fullPath: `events/${f.name}`, size: f.metadata.size, created: f.created_at || f.updated_at || new Date().toISOString(), bucket: 'site-assets' });
          }
        });
      }

      // 3. Process every storage file & test against DB map
      const processedFiles: StorageFile[] = [];

      rawFileList.forEach(file => {
        const { data } = supabase.storage.from(file.bucket).getPublicUrl(file.fullPath);
        const publicUrl = data.publicUrl;

        const fileName = file.name.trim();
        const decodedFileName = decodeURIComponent(file.name).trim();
        const fullPath = file.fullPath.trim();

        // Check if linked to any product
        let linkedTitle: string | null = null;

        if (productMap.has(publicUrl)) linkedTitle = productMap.get(publicUrl)!;
        else if (productMap.has(fullPath)) linkedTitle = productMap.get(fullPath)!;
        else if (productMap.has(fileName)) linkedTitle = productMap.get(fileName)!;
        else if (productMap.has(decodedFileName)) linkedTitle = productMap.get(decodedFileName)!;
        else {
          // Substring search fallback
          for (const [key, title] of productMap.entries()) {
            if (key.includes(fileName) || key.includes(decodedFileName) || (fullPath && key.includes(fullPath)) || publicUrl.includes(key)) {
              linkedTitle = title;
              break;
            }
          }
        }

        const isUsed = !!linkedTitle;
        const createdObj = new Date(file.created);

        processedFiles.push({
          name: file.name,
          fullPath: file.fullPath,
          sizeBytes: file.size,
          sizeMB: (file.size / (1024 * 1024)).toFixed(2),
          publicUrl,
          createdAtDate: createdObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          createdAtTime: createdObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          rawCreatedAt: file.created,
          isUsed,
          linkedProductTitle: linkedTitle,
          bucket: file.bucket
        });
      });

      // Default Sort: Newest First
      processedFiles.sort((a, b) => new Date(b.rawCreatedAt).getTime() - new Date(a.rawCreatedAt).getTime());

      setAllStorageFiles(processedFiles);
    } catch (err: any) {
      console.error('Error scanning storage:', err);
      setMessage({ type: 'error', text: 'Error scanning storage: ' + err.message });
    }
    setScanning(false);
  };

  const handleToggleSort = () => {
    const newOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
    setSortOrder(newOrder);

    const sorted = [...allStorageFiles].sort((a, b) => {
      const timeA = new Date(a.rawCreatedAt).getTime();
      const timeB = new Date(b.rawCreatedAt).getTime();
      return newOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    setAllStorageFiles(sorted);
  };

  // Filtered files list
  const filteredFiles = allStorageFiles.filter(file => {
    // Filter Tab
    if (activeFilter === 'unused' && file.isUsed) return false;
    if (activeFilter === 'used' && !file.isUsed) return false;

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesPath = file.fullPath.toLowerCase().includes(q);
      const matchesProduct = file.linkedProductTitle?.toLowerCase().includes(q);
      if (!matchesPath && !matchesProduct) return false;
    }

    return true;
  });

  const unusedFiles = allStorageFiles.filter(f => !f.isUsed);
  const usedFiles = allStorageFiles.filter(f => f.isUsed);

  const totalUnusedBytes = unusedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const totalUnusedMB = (totalUnusedBytes / (1024 * 1024)).toFixed(2);

  const totalBucketBytes = allStorageFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const totalBucketMB = (totalBucketBytes / (1024 * 1024)).toFixed(2);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // ONLY select unused files (in-use images are protected)
      const selectables = filteredFiles.filter(f => !f.isUsed).map(f => f.fullPath);
      setSelectedPaths(selectables);
    } else {
      setSelectedPaths([]);
    }
  };

  const toggleSelect = (fullPath: string, isUsed: boolean) => {
    if (isUsed) return; // Prevent selecting in-use images
    setSelectedPaths(prev => 
      prev.includes(fullPath) ? prev.filter(p => p !== fullPath) : [...prev, fullPath]
    );
  };

  const deleteFiles = async (pathsToDelete: string[]) => {
    if (pathsToDelete.length === 0) return;

    // STRICT PROTECTION GUARD: Filter out any in-use paths
    const inUseSet = new Set(allStorageFiles.filter(f => f.isUsed).map(f => f.fullPath));
    const safePaths = pathsToDelete.filter(p => !inUseSet.has(p));

    if (safePaths.length < pathsToDelete.length) {
      alert('Action Blocked: Images currently linked to active products are protected and CANNOT be deleted! Please delete or edit the product first.');
    }

    if (safePaths.length === 0) return;

    if (!window.confirm(`Are you sure you want to permanently delete ${safePaths.length} unused image(s) from Supabase Storage?`)) {
      return;
    }

    setDeleting(true);
    let hasError = false;
    let successCount = 0;

    try {
      // Group paths by bucket
      const byBucket = safePaths.reduce((acc, path) => {
        const file = allStorageFiles.find(f => f.fullPath === path);
        if (file) {
          if (!acc[file.bucket]) acc[file.bucket] = [];
          acc[file.bucket].push(path);
        }
        return acc;
      }, {} as Record<string, string[]>);

      for (const [bucket, paths] of Object.entries(byBucket)) {
        const { error } = await supabase.storage.from(bucket).remove(paths);
        if (error) {
          hasError = true;
          setMessage({ type: 'error', text: 'Error deleting images: ' + error.message });
        } else {
          successCount += paths.length;
        }
      }

      if (successCount > 0 && !hasError) {
        setMessage({ type: 'success', text: `Successfully purged ${successCount} unused image(s)!` });
        scanStorageImages();
      } else if (successCount > 0 && hasError) {
        setMessage({ type: 'error', text: `Partially purged ${successCount} images, but some failed.` });
        scanStorageImages();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error deleting images: ' + err.message });
    }
    setDeleting(false);
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="admin-back-btn">
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="admin-header-action" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-page-title" style={{ marginBottom: '4px' }}>Storage Bucket Manager</h1>
          <span style={{ fontSize: '13px', color: '#666' }}>
            Audit all bucket images & safely purge orphaned media files
          </span>
        </div>

        <button 
          onClick={scanStorageImages} 
          disabled={scanning}
          className="admin-btn admin-btn-secondary"
        >
          <RefreshCw size={18} className={scanning ? 'animate-spin' : ''} />
          <span>Rescan Storage Bucket</span>
        </button>
      </div>

      {message && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.type === 'error' ? '#fef2f2' : '#e6ffed',
          color: message.type === 'error' ? '#dc2626' : '#276749',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#b7ebc6'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {message.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Active / In Use Images */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #dcfce7',
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Media Files
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2c2c2c', margin: '4px 0' }}>
              {scanning ? <div className="skeleton skeleton-title" style={{ width: '100px', height: '24px' }} /> : `${usedFiles.length} files`}
            </div>
            <span style={{ fontSize: '12px', color: '#888' }}>
              Linked to active DB records
            </span>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '10px', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Card 2: Unused Images (Purge Target) */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #fee2e2',
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Unused Images (Purge Target)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2c2c2c', margin: '4px 0' }}>
              {scanning ? <div className="skeleton skeleton-title" style={{ width: '100px', height: '24px' }} /> : `${unusedFiles.length} files`}
            </div>
            <span style={{ fontSize: '12px', color: '#888' }}>
              {scanning ? '...' : `${totalUnusedMB} MB recoverable space`}
            </span>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '10px', color: '#dc2626' }}>
            <XCircle size={24} />
          </div>
        </div>

        {/* Card 3: Total Storage */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #eae5df',
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#7c5847', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Storage Usage
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2c2c2c', margin: '4px 0' }}>
              {scanning ? <div className="skeleton skeleton-title" style={{ width: '100px', height: '24px' }} /> : `${allStorageFiles.length} files`}
            </div>
            <span style={{ fontSize: '12px', color: '#888' }}>
              {scanning ? '...' : `${totalBucketMB} MB total size`}
            </span>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#fff4eb', borderRadius: '10px', color: '#7c5847' }}>
            <HardDrive size={24} />
          </div>
        </div>
      </div>

      {/* Filter Tabs, Search & Bulk Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeFilter === 'all' ? '1px solid #7c5847' : '1px solid #eaeaea',
              backgroundColor: activeFilter === 'all' ? '#7c5847' : '#ffffff',
              color: activeFilter === 'all' ? '#ffffff' : '#555555',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <span>All Images ({allStorageFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('used')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeFilter === 'used' ? '1px solid #16a34a' : '1px solid #eaeaea',
              backgroundColor: activeFilter === 'used' ? '#f0fdf4' : '#ffffff',
              color: activeFilter === 'used' ? '#16a34a' : '#555555',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={15} />
            <span>In-Use Images ({usedFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('unused')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeFilter === 'unused' ? '1px solid #dc2626' : '1px solid #eaeaea',
              backgroundColor: activeFilter === 'unused' ? '#fef2f2' : '#ffffff',
              color: activeFilter === 'unused' ? '#dc2626' : '#555555',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <XCircle size={15} />
            <span>Unused Images ({unusedFiles.length})</span>
          </button>
        </div>

        {/* Action Controls & Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search filename or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-form-input"
            style={{ margin: 0, padding: '7px 12px', fontSize: '13px', width: '200px' }}
          />

          <button
            onClick={handleToggleSort}
            className="admin-btn admin-btn-secondary"
            style={{ padding: '8px 14px', fontSize: '12.5px' }}
          >
            <ArrowUpDown size={15} />
            <span>Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
          </button>

          {selectedPaths.length > 0 && (
            <button
              onClick={() => deleteFiles(selectedPaths)}
              disabled={deleting}
              className="admin-btn admin-btn-danger"
              style={{ padding: '8px 14px', fontSize: '12.5px' }}
            >
              <Trash2 size={15} />
              <span>Delete Selected ({selectedPaths.length})</span>
            </button>
          )}

          {unusedFiles.length > 0 && (
            <button
              onClick={() => deleteFiles(unusedFiles.map(f => f.fullPath))}
              disabled={deleting}
              className="admin-btn admin-btn-primary"
              style={{ padding: '8px 14px', fontSize: '12.5px', backgroundColor: '#dc2626', borderColor: '#dc2626' }}
            >
              <ShieldAlert size={15} />
              <span>Purge Unused Images ({unusedFiles.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Storage Table with Skeleton Loader */}
      {scanning ? (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><div className="skeleton" style={{ width: '18px', height: '18px' }} /></th>
                <th>Preview</th>
                <th>File Path</th>
                <th>Database Usage Status</th>
                <th>Size</th>
                <th>Date & Time</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td><div className="skeleton" style={{ width: '18px', height: '18px' }} /></td>
                  <td><div className="skeleton skeleton-avatar" /></td>
                  <td>
                    <div className="skeleton skeleton-title" style={{ width: '70%', height: '18px', marginBottom: '6px' }} />
                    <div className="skeleton skeleton-text" style={{ width: '40%', height: '12px' }} />
                  </td>
                  <td><div className="skeleton" style={{ width: '110px', height: '24px', borderRadius: '12px' }} /></td>
                  <td><div className="skeleton" style={{ width: '60px', height: '22px', borderRadius: '12px' }} /></td>
                  <td><div className="skeleton" style={{ width: '100px', height: '18px' }} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="skeleton" style={{ width: '70px', height: '30px', borderRadius: '6px' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          padding: '50px 20px',
          borderRadius: '10px',
          textAlign: 'center',
          border: '1px solid #eaeaea'
        }}>
          <CheckCircle size={44} color="#38a169" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#2c2c2c', margin: '0 0 6px 0' }}>No Images Found!</h3>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>No image files match your selected filter ({activeFilter}).</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox"
                    checked={selectedPaths.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Preview</th>
                <th>File Path</th>
                <th>Database Usage Status</th>
                <th>Size</th>
                <th style={{ cursor: 'pointer' }} onClick={handleToggleSort}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#7c5847" />
                    <span>Upload Date & Time</span>
                    <ArrowUpDown size={12} color="#7c5847" />
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map(file => (
                <tr key={file.fullPath} style={{ backgroundColor: file.isUsed ? '#ffffff' : '#fffcfb' }}>
                  <td>
                    <input 
                      type="checkbox"
                      disabled={file.isUsed}
                      title={file.isUsed ? "In-use images cannot be deleted" : "Select to delete"}
                      checked={selectedPaths.includes(file.fullPath)}
                      onChange={() => toggleSelect(file.fullPath, file.isUsed)}
                    />
                  </td>
                  <td>
                    <div style={{ width: '52px', height: '52px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f4f4f4', border: '1px solid #eee' }}>
                      <img src={file.publicUrl} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td style={{ fontWeight: '500', fontSize: '13px', color: '#333' }}>
                    <div>{file.fullPath}</div>
                    <a href={file.publicUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#7c5847', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                      <Link2 size={11} /> Open Image URL
                    </a>
                  </td>
                  <td>
                    {file.isUsed ? (
                      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ 
                          fontSize: '11.5px', 
                          backgroundColor: '#e6ffed', 
                          color: '#276749', 
                          padding: '3px 10px', 
                          borderRadius: '12px', 
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <CheckCircle2 size={13} />
                          <span>IN USE</span>
                        </span>
                        {file.linkedProductTitle && (
                          <span style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginLeft: '4px' }}>
                            {file.linkedProductTitle}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ 
                        fontSize: '11.5px', 
                        backgroundColor: '#fef2f2', 
                        color: '#dc2626', 
                        padding: '3px 10px', 
                        borderRadius: '12px', 
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <XCircle size={13} />
                        <span>NOT IN USE (Unused)</span>
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', backgroundColor: '#f5f5f5', padding: '3px 8px', borderRadius: '12px' }}>
                      {file.sizeMB} MB
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12.5px', color: '#2c2c2c', fontWeight: '600' }}>
                      {file.createdAtDate}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Clock size={11} color="#7c5847" />
                      <span>{file.createdAtTime}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {file.isUsed ? (
                      <button
                        disabled
                        className="admin-btn"
                        style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#f4f4f4', color: '#888', cursor: 'not-allowed', border: '1px solid #e2e2e2' }}
                        title="Protected: Image is currently linked to an active record"
                      >
                        <Lock size={13} />
                        <span>Protected</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteFiles([file.fullPath])}
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StorageCleanup;
