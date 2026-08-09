import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Settings() {
    const [settingsId, setSettingsId] = useState<string | null>(null);
    const [adminEmail, setAdminEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
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
            // If no settings exist yet, create one
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

    if (loading) return <div>Loading settings...</div>;

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 className="admin-page-title">Settings</h1>
            
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eaeaea' }}>
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
        </div>
    );
}
