import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Database, HardDrive, RefreshCw, CheckCircle2, Server, ArrowLeft } from 'lucide-react';

export default function Settings() {
    const navigate = useNavigate();
    const [settingsId, setSettingsId] = useState<string | null>(null);
    const [adminEmail, setAdminEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    
    // Security / Password state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Storage & DB Usage state
    const [dbCounts, setDbCounts] = useState({
        products: 0,
        categories: 0,
        enquiries: 0
    });
    const [storageMetrics, setStorageMetrics] = useState({
        imageCount: 0,
        totalSizeBytes: 0,
        totalSizeMB: '0.00',
        usedPercent: 0,
        loadingMetrics: true
    });

    useEffect(() => {
        fetchSettings();
        fetchStorageAndDbUsage();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('settings').select('*').limit(1).single();
        if (data) {
            setSettingsId(data.id);
            setAdminEmail(data.admin_email);
        } else if (error) {
            console.error('Error fetching settings:', error);
        }
        setLoading(false);
    };

    const fetchStorageAndDbUsage = async () => {
        try {
            // DB counts
            const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
            const { count: cCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
            const { count: eCount } = await supabase.from('enquiries').select('*', { count: 'exact', head: true });

            setDbCounts({
                products: pCount || 0,
                categories: cCount || 0,
                enquiries: eCount || 0
            });

            let bytes = 0;
            let fileCount = 0;

            // 1. Scan root directory
            const { data: rootData } = await supabase.storage.from('product-images').list('', { limit: 1000 });
            if (rootData) {
                rootData.forEach(file => {
                    if (file.metadata && file.metadata.size) {
                        bytes += file.metadata.size;
                        fileCount++;
                    }
                });
            }

            // 2. Scan products subfolder (where uploaded images reside)
            const { data: folderData } = await supabase.storage.from('product-images').list('products', { limit: 1000 });
            if (folderData) {
                folderData.forEach(file => {
                    if (file.metadata && file.metadata.size) {
                        bytes += file.metadata.size;
                        fileCount++;
                    }
                });
            }

            // 3. Scan database image records
            const { data: dbProducts } = await supabase.from('products').select('primary_image_url, hover_image_url, images');
            let dbImageCount = 0;
            if (dbProducts) {
                dbProducts.forEach(p => {
                    if (p.primary_image_url) dbImageCount++;
                    if (p.hover_image_url) dbImageCount++;
                    if (Array.isArray(p.images)) dbImageCount += p.images.length;
                });
            }

            const finalImageCount = Math.max(fileCount, dbImageCount);
            const finalBytes = bytes > 0 ? bytes : (finalImageCount * 350 * 1024);
            const mb = (finalBytes / (1024 * 1024)).toFixed(2);
            const percent = Math.min(100, Math.max(1, Math.round((parseFloat(mb) / 500) * 100)));

            setStorageMetrics({
                imageCount: finalImageCount,
                totalSizeBytes: finalBytes,
                totalSizeMB: mb,
                usedPercent: percent,
                loadingMetrics: false
            });
        } catch (err) {
            console.error('Error fetching storage usage:', err);
            setStorageMetrics(prev => ({ ...prev, loadingMetrics: false }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        if (settingsId) {
            const { error } = await supabase
                .from('settings')
                .update({ admin_email: adminEmail, updated_at: new Date().toISOString() })
                .eq('id', settingsId);
                
            if (error) {
                setMessage('Error updating settings.');
            } else {
                setMessage('Settings saved successfully!');
            }
        } else {
            const { data, error } = await supabase
                .from('settings')
                .insert([{ admin_email: adminEmail }])
                .select()
                .single();
                
            if (data) {
                setSettingsId(data.id);
                setMessage('Settings saved successfully!');
            } else {
                setMessage('Error creating settings.');
                console.error(error);
            }
        }
        
        setSaving(false);
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage('');
        
        if (newPassword !== confirmPassword) {
            setPasswordMessage('Error: Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage('Error: Password must be at least 6 characters.');
            return;
        }

        setUpdatingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        
        if (error) {
            setPasswordMessage(`Error updating password: ${error.message}`);
        } else {
            setPasswordMessage('Password updated successfully!');
            setNewPassword('');
            setConfirmPassword('');
        }
        setUpdatingPassword(false);
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading settings...</div>;

    return (
        <div style={{ maxWidth: '850px' }}>
            <button onClick={() => navigate(-1)} className="admin-back-btn">
                <ArrowLeft size={16} />
                <span>Back</span>
            </button>

            <h1 className="admin-page-title">Settings</h1>
            
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eaeaea', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Email Notifications</h2>
                
                {message && (
                    <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '6px', backgroundColor: message.includes('Error') ? '#fef2f2' : '#e6ffed', color: message.includes('Error') ? '#dc2626' : '#38a169', border: `1px solid ${message.includes('Error') ? '#fecaca' : '#b7ebc6'}` }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSave}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">
                            Admin Email Address (Receives new enquiry alerts)
                        </label>
                        <input 
                            type="email" 
                            required
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            className="admin-form-input"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={saving}
                        className="admin-btn admin-btn-primary"
                        style={{ opacity: saving ? 0.7 : 1 }}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>
            </div>

            {/* Security Section (Change Password) */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eaeaea', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Security</h2>
                
                {passwordMessage && (
                    <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '6px', backgroundColor: passwordMessage.includes('Error') ? '#fef2f2' : '#e6ffed', color: passwordMessage.includes('Error') ? '#dc2626' : '#38a169', border: `1px solid ${passwordMessage.includes('Error') ? '#fecaca' : '#b7ebc6'}` }}>
                        {passwordMessage}
                    </div>
                )}

                <form onSubmit={handlePasswordUpdate}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">New Password</label>
                        <input 
                            type="password" 
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="admin-form-input"
                            placeholder="Enter new password (min 6 chars)"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Confirm New Password</label>
                        <input 
                            type="password" 
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="admin-form-input"
                            placeholder="Re-enter new password"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={updatingPassword}
                        className="admin-btn admin-btn-primary"
                        style={{ opacity: updatingPassword ? 0.7 : 1, backgroundColor: '#333' }}
                    >
                        {updatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Database & Supabase Storage Usage Health Section */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eaeaea' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Server size={22} style={{ color: '#7c5847' }} />
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', margin: 0 }}>Database & Storage Usage Health</h2>
                    </div>
                    <button 
                        onClick={fetchStorageAndDbUsage}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                        <RefreshCw size={14} /> Refresh Usage
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                    {/* Media Storage Bucket */}
                    <div style={{ backgroundColor: '#faf8f5', padding: '20px', borderRadius: '8px', border: '1px solid #eee6df' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#2c2c2c' }}>
                                <HardDrive size={18} color="#7c5847" />
                                <span>Supabase Storage Bucket</span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#38a169', backgroundColor: '#e6ffed', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                                Free Tier (500MB)
                            </span>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
                                <span>Used: <strong>{storageMetrics.totalSizeMB} MB</strong></span>
                                <span>Limit: <strong>500 MB</strong></span>
                            </div>
                            
                            <div style={{ height: '10px', backgroundColor: '#e5dec', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ 
                                    height: '100%', 
                                    width: `${Math.max(3, storageMetrics.usedPercent)}%`, 
                                    backgroundColor: storageMetrics.usedPercent > 90 ? '#dc2626' : storageMetrics.usedPercent > 75 ? '#d97706' : '#7c5847', 
                                    borderRadius: '5px',
                                    transition: 'width 0.4s ease' 
                                }} />
                            </div>
                        </div>

                        <div style={{ fontSize: '12px', color: '#666', display: 'flex', justifyContent: 'space-between', paddingTop: '6px' }}>
                            <span>Product Images Uploaded: <strong>{storageMetrics.imageCount} files</strong></span>
                            <span>Usage Ratio: <strong>{storageMetrics.usedPercent}%</strong></span>
                        </div>
                    </div>

                    {/* Database Health Breakdown */}
                    <div style={{ backgroundColor: '#faf8f5', padding: '20px', borderRadius: '8px', border: '1px solid #eee6df' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#2c2c2c' }}>
                                <Database size={18} color="#4f46e5" />
                                <span>PostgreSQL Database Records</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#38a169', fontWeight: '700' }}>
                                <CheckCircle2 size={14} /> Active
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 10px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #eee' }}>
                                <span>Products Table Records:</span>
                                <strong>{dbCounts.products} rows</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 10px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #eee' }}>
                                <span>Categories Table Records:</span>
                                <strong>{dbCounts.categories} rows</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 10px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #eee' }}>
                                <span>Enquiries Table Records:</span>
                                <strong>{dbCounts.enquiries} rows</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
