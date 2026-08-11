import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Briefcase, Package, Search, Calendar, Filter, X, Trash2, FileSpreadsheet, Download, CheckCircle2, Clock, MapPin, ArrowLeft } from 'lucide-react';

interface Enquiry {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  role: string;
  message: string;
  product_name: string;
  ingredients: any[];
  end_application: string[];
  documents_needed: string[];
  created_at: string;
  is_solved?: boolean;
}

const EnquiryRow = ({ 
  enquiry, 
  activeTab,
  onUpdate, 
  onDelete, 
  onClick 
}: { 
  enquiry: Enquiry; 
  activeTab: string;
  onUpdate: () => void; 
  onDelete: (id: string) => void; 
  onClick: () => void 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fallback for legacy contact form
  let phone = enquiry.phone || '';
  let messageText = enquiry.message || '';
  
  if (messageText.startsWith('Phone: ') && !enquiry.phone) {
    const parts = messageText.split('\n\n');
    if (parts.length > 1) {
      phone = parts[0].replace('Phone: ', '').trim();
      messageText = parts.slice(1).join('\n\n').trim();
    } else {
      phone = messageText.replace('Phone: ', '').trim();
      messageText = '';
    }
  }

  const isLongMessage = messageText.length > 80;
  const displayText = isExpanded || !isLongMessage 
    ? messageText 
    : messageText.substring(0, 80) + '...';

  const toggleSolved = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setUpdating(true);
    const { error } = await supabase
      .from('enquiries')
      .update({ is_solved: !enquiry.is_solved })
      .eq('id', enquiry.id);
      
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      onUpdate();
    }
    setUpdating(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(enquiry.id);
  };

  return (
    <tr 
      onClick={onClick}
      style={{ 
        opacity: enquiry.is_solved ? 0.75 : 1, 
        backgroundColor: enquiry.is_solved ? '#faf9f8' : '#ffffff', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease',
        borderBottom: '1px solid #eee7df'
      }}
      className="admin-table-row-hover"
    >
      {/* Contact Info */}
      <td style={{ verticalAlign: 'top', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: '700', color: '#2c2c2c', fontSize: '15px' }}>{enquiry.name}</span>
          <span style={{ 
            fontSize: '11px', 
            backgroundColor: enquiry.is_solved ? '#e6ffed' : '#fff4eb', 
            color: enquiry.is_solved ? '#38a169' : '#d97706', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {enquiry.is_solved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
            {enquiry.is_solved ? 'Solved' : 'Pending'}
          </span>
        </div>
        
        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <a 
            href={`mailto:${enquiry.email}`} 
            onClick={e => e.stopPropagation()} 
            style={{ color: '#7c5847', textDecoration: 'none', fontWeight: '500' }}
          >
            ✉ {enquiry.email}
          </a>
          {phone && (
            <a 
              href={`tel:${phone.replace(/\s+/g, '')}`} 
              onClick={e => e.stopPropagation()} 
              style={{ color: '#666', textDecoration: 'none', fontSize: '12px' }}
            >
              📞 {phone}
            </a>
          )}
        </div>
      </td>

      {/* Company & Country Details */}
      {activeTab !== 'contact' && (
        <td style={{ verticalAlign: 'top', padding: '16px 20px', fontSize: '13px', color: '#555' }}>
          {enquiry.company ? (
            <div style={{ fontWeight: '600', color: '#333' }}>{enquiry.company}</div>
          ) : (
            <span style={{ color: '#aaa', fontStyle: 'italic' }}>Individual</span>
          )}
          {enquiry.role && <div style={{ fontSize: '12px', color: '#777' }}>Role: {enquiry.role}</div>}
          {enquiry.country && (
            <div style={{ fontSize: '12px', color: '#555', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} color="#7c5847" /> {enquiry.country}
            </div>
          )}
        </td>
      )}

      {/* Specific Requirements / Product */}
      {(activeTab === 'product' || activeTab === 'general') && (
        <td style={{ verticalAlign: 'top', padding: '16px 20px', fontSize: '13px', maxWidth: '280px' }}>
          {activeTab === 'product' && (
            <span style={{ display: 'inline-block', backgroundColor: '#f3ece6', color: '#7c5847', padding: '4px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700' }}>
              🌿 {enquiry.product_name}
            </span>
          )}

          {activeTab === 'general' && (
            <div>
              {enquiry.ingredients && enquiry.ingredients.length > 0 && (
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ fontWeight: '700', color: '#7c5847', fontSize: '10px', letterSpacing: '0.5px' }}>INGREDIENTS:</span>
                  <div style={{ color: '#444', fontSize: '12.5px' }}>
                    {enquiry.ingredients.map(ing => `${ing.herb} (${ing.qty || 'Standard'})`).join(', ')}
                  </div>
                </div>
              )}
              {enquiry.end_application && enquiry.end_application.length > 0 && (
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#888', fontSize: '10px', letterSpacing: '0.5px' }}>USE:</span>
                  <span style={{ color: '#555', fontSize: '12px', marginLeft: '4px' }}>{enquiry.end_application.join(', ')}</span>
                </div>
              )}
              {enquiry.documents_needed && enquiry.documents_needed.length > 0 && (
                <div>
                  <span style={{ fontSize: '11px', backgroundColor: '#f0ece7', color: '#666', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                    📄 Docs: {enquiry.documents_needed.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </td>
      )}

      {/* Message / Comment */}
      <td style={{ verticalAlign: 'top', padding: '16px 20px' }}>
        <div style={{ backgroundColor: '#f8f6f3', padding: '10px 12px', borderRadius: '6px', fontSize: '12.5px', maxWidth: '300px', border: '1px solid #eee7df' }}>
          {messageText ? (
            <>
              <div style={{ whiteSpace: 'pre-wrap', color: '#333', lineHeight: '1.4' }}>{displayText}</div>
              {isLongMessage && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  style={{ background: 'none', border: 'none', color: '#7c5847', padding: 0, marginTop: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}
                >
                  {isExpanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </>
          ) : (
            <span style={{ color: '#aaa', fontStyle: 'italic' }}>No comment</span>
          )}
        </div>
      </td>

      {/* Date, Status Toggle & Delete Action */}
      <td style={{ verticalAlign: 'top', padding: '16px 20px', width: '150px' }}>
        <div style={{ fontSize: '12.5px', color: '#2c2c2c', fontWeight: '600' }}>
          {new Date(enquiry.created_at).toLocaleDateString()}
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>
          {new Date(enquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={toggleSolved}
            disabled={updating}
            style={{ 
              backgroundColor: enquiry.is_solved ? '#ffffff' : '#7c5847', 
              color: enquiry.is_solved ? '#555555' : '#ffffff', 
              border: enquiry.is_solved ? '1px solid #d5cfc7' : 'none', 
              padding: '6px 10px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '11.5px',
              fontWeight: '600',
              width: '100%',
              transition: 'all 0.15s ease'
            }}
          >
            {updating ? '...' : enquiry.is_solved ? 'Mark Unsolved' : 'Mark Solved'}
          </button>

          <button
            onClick={handleDelete}
            style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11.5px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              width: '100%',
              transition: 'all 0.15s ease'
            }}
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

const Enquiries = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  
  // Active Tab
  const [activeTab, setActiveTab] = useState<'contact' | 'general' | 'product'>('general');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'solved'|'unsolved'>('all');

  // Export Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<string>('general');
  const [exportStatus, setExportStatus] = useState<string>('all');
  const [exportDatePreset, setExportDatePreset] = useState<string>('all');
  const [exportStartDate, setExportStartDate] = useState<string>('');
  const [exportEndDate, setExportEndDate] = useState<string>('');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching enquiries:', error);
    } else {
      const typedData = (data || []).map(enq => ({
        ...enq,
        type: enq.type || 'contact'
      }));
      setEnquiries(typedData);
    }
    setLoading(false);
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) return;

    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (error) {
      alert('Error deleting enquiry: ' + error.message);
    } else {
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      fetchEnquiries();
    }
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    // Tab Filter
    if (enquiry.type !== activeTab) return false;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!enquiry.name?.toLowerCase().includes(q) && 
          !enquiry.email?.toLowerCase().includes(q) && 
          !enquiry.company?.toLowerCase().includes(q) && 
          !enquiry.product_name?.toLowerCase().includes(q) && 
          !enquiry.message?.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Status
    if (statusFilter === 'solved' && !enquiry.is_solved) return false;
    if (statusFilter === 'unsolved' && enquiry.is_solved) return false;

    // Date Range
    if (dateFrom && new Date(enquiry.created_at) < new Date(dateFrom)) return false;
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setDate(toDate.getDate() + 1);
      if (new Date(enquiry.created_at) > toDate) return false;
    }

    return true;
  });

  // Calculate filtered export list based on Export Modal settings
  const getExportRecords = () => {
    return enquiries.filter(enq => {
      // Category Filter (Strict single category)
      if (enq.type !== exportType) return false;

      // Status Filter
      if (exportStatus === 'solved' && !enq.is_solved) return false;
      if (exportStatus === 'unsolved' && enq.is_solved) return false;

      // Date Presets & Custom Dates
      const created = new Date(enq.created_at);
      const now = new Date();

      if (exportDatePreset === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (created < todayStart) return false;
      } else if (exportDatePreset === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (created < sevenDaysAgo) return false;
      } else if (exportDatePreset === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (created < thirtyDaysAgo) return false;
      } else if (exportDatePreset === 'custom') {
        if (exportStartDate && created < new Date(exportStartDate)) return false;
        if (exportEndDate) {
          const endDate = new Date(exportEndDate);
          endDate.setDate(endDate.getDate() + 1);
          if (created > endDate) return false;
        }
      }

      return true;
    });
  };

  const handleDownloadExcel = () => {
    const exportData = getExportRecords();

    if (exportData.length === 0) {
      alert('No enquiries match your selected export filter criteria.');
      return;
    }

    const typeLabel = exportType === 'general' 
      ? 'GENERAL FORMULATIONS' 
      : exportType === 'product' 
      ? 'PRODUCT QUOTES' 
      : 'DIRECT CONTACT MESSAGES';

    const statusLabel = exportStatus === 'all' 
      ? 'All Statuses (Solved & Unsolved)' 
      : exportStatus === 'solved' 
      ? 'Solved Only' 
      : 'Unsolved / Pending Only';

    const dateLabel = exportDatePreset === 'all' 
      ? 'All Time' 
      : exportDatePreset === 'today' 
      ? 'Today Only' 
      : exportDatePreset === '7days' 
      ? 'Last 7 Days' 
      : exportDatePreset === '30days' 
      ? 'Last 30 Days' 
      : `Custom Range (${exportStartDate || 'Start'} to ${exportEndDate || 'End'})`;

    // Petricor Custom Header Branding Rows
    const headerMetadata = [
      `"PETRICOR EXPORTS - ${typeLabel} REPORT"`,
      `"Report Generated: ${new Date().toLocaleString()}"`,
      `"Filters Applied: Category: ${typeLabel} | Status: ${statusLabel} | Date Range: ${dateLabel}"`,
      `"Total Records Exported: ${exportData.length}"`,
      '""' // Empty row spacing
    ];

    const headers = [
      'Enquiry ID',
      'Date & Time',
      'Enquiry Category',
      'Status',
      'Customer Name',
      'Email',
      'Phone',
      'Company',
      'Country',
      'Role',
      'Product Name',
      'Ingredients & Quantities',
      'Applications',
      'Documents Needed',
      'Message / Comment'
    ];

    const rows = exportData.map(enq => {
      let phone = enq.phone || '';
      let msg = enq.message || '';
      if (!phone && msg.startsWith('Phone: ')) {
        const parts = msg.split('\n\n');
        phone = parts[0].replace('Phone: ', '').trim();
        msg = parts.slice(1).join('\n\n').trim();
      }

      const ingredientsStr = enq.ingredients && Array.isArray(enq.ingredients)
        ? enq.ingredients.map((ing: any) => `${ing.herb || ''} ${ing.form ? `(${ing.form})` : ''} ${ing.qty ? `[${ing.qty}]` : ''}`.trim()).join('; ')
        : '';

      const appsStr = enq.end_application && Array.isArray(enq.end_application) ? enq.end_application.join(', ') : '';
      const docsStr = enq.documents_needed && Array.isArray(enq.documents_needed) ? enq.documents_needed.join(', ') : '';

      return [
        enq.id,
        new Date(enq.created_at).toLocaleString(),
        enq.type?.toUpperCase() || 'CONTACT',
        enq.is_solved ? 'SOLVED' : 'UNSOLVED',
        `"${(enq.name || '').replace(/"/g, '""')}"`,
        `"${(enq.email || '').replace(/"/g, '""')}"`,
        `"${phone.replace(/"/g, '""')}"`,
        `"${(enq.company || '').replace(/"/g, '""')}"`,
        `"${(enq.country || '').replace(/"/g, '""')}"`,
        `"${(enq.role || '').replace(/"/g, '""')}"`,
        `"${(enq.product_name || '').replace(/"/g, '""')}"`,
        `"${ingredientsStr.replace(/"/g, '""')}"`,
        `"${appsStr.replace(/"/g, '""')}"`,
        `"${docsStr.replace(/"/g, '""')}"`,
        `"${msg.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [...headerMetadata, headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Petricor_Enquiries_${exportType}_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
  };

  const getCount = (type: string) => enquiries.filter(e => e.type === type).length;

  if (loading) return <div style={{ padding: '30px' }}>Loading enquiries...</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="admin-back-btn">
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="admin-header-action" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-page-title" style={{ marginBottom: '4px' }}>Customer Enquiries</h1>
          <span style={{ fontSize: '13px', color: '#666' }}>
            Manage quote requests, formulation submissions & contact inquiries
          </span>
        </div>

        {/* Primary Export to Excel Button */}
        <button 
          onClick={() => {
            setExportType(activeTab);
            setShowExportModal(true);
          }}
          className="admin-btn admin-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(124, 88, 71, 0.25)' }}
        >
          <FileSpreadsheet size={18} />
          <span>Export Excel Report</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-container" style={{ display: 'flex', gap: '12px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '6px', WebkitOverflowScrolling: 'touch' }}>
        <button 
          onClick={() => setActiveTab('general')}
          style={{ ...tabStyle, ...(activeTab === 'general' ? activeTabStyle : {}) }}
        >
          <Briefcase size={18} /> General Formulations <span style={badgeStyle}>{getCount('general')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('product')}
          style={{ ...tabStyle, ...(activeTab === 'product' ? activeTabStyle : {}) }}
        >
          <Package size={18} /> Product Quotes <span style={badgeStyle}>{getCount('product')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('contact')}
          style={{ ...tabStyle, ...(activeTab === 'contact' ? activeTabStyle : {}) }}
        >
          <Mail size={18} /> Direct Messages <span style={badgeStyle}>{getCount('contact')}</span>
        </button>
      </div>
      
      {/* Search & Filter Control Panel */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid #eae5df', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999' }} />
          <input 
            type="text" 
            placeholder="Search name, email, company, product..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-form-input"
            style={{ width: '100%', paddingLeft: '38px', margin: 0 }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#7c5847" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="admin-form-input"
            style={{ width: '130px', margin: 0 }}
          >
            <option value="all">All Statuses</option>
            <option value="unsolved">Unsolved Only</option>
            <option value="solved">Solved Only</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#7c5847" />
          <input 
            type="date" 
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="admin-form-input"
            style={{ margin: 0, padding: '8px' }}
          />
          <span style={{ color: '#999', fontSize: '12px' }}>to</span>
          <input 
            type="date" 
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="admin-form-input"
            style={{ margin: 0, padding: '8px' }}
          />
        </div>

        {(searchQuery || statusFilter !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDateFrom('');
              setDateTo('');
            }}
            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Enquiries Table */}
      <div className="admin-table-container">
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '14px 20px', textAlign: 'left', backgroundColor: '#faf8f5', borderBottom: '2px solid #eae4dc', color: '#555', fontSize: '12px' }}>Contact Info</th>
              {activeTab !== 'contact' && <th style={{ padding: '14px 20px', textAlign: 'left', backgroundColor: '#faf8f5', borderBottom: '2px solid #eae4dc', color: '#555', fontSize: '12px' }}>Details</th>}
              {activeTab === 'product' && <th style={{ padding: '14px 20px', textAlign: 'left', backgroundColor: '#faf8f5', borderBottom: '2px solid #eae4dc', color: '#555', fontSize: '12px' }}>Product</th>}
              {activeTab === 'general' && <th style={{ padding: '14px 20px', textAlign: 'left', backgroundColor: '#faf8f5', borderBottom: '2px solid #eae4dc', color: '#555', fontSize: '12px' }}>Requirements</th>}
              <th style={{ padding: '14px 20px', textAlign: 'left', backgroundColor: '#faf8f5', borderBottom: '2px solid #eae4dc', color: '#555', fontSize: '12px' }}>Comment / Note</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', backgroundColor: '#faf8f5', borderBottom: '2px solid #eae4dc', color: '#555', fontSize: '12px' }}>Date & Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                  No {activeTab} enquiries match your selected filters.
                </td>
              </tr>
            ) : (
              filteredEnquiries.map((enquiry) => (
                <EnquiryRow 
                  key={enquiry.id} 
                  enquiry={enquiry} 
                  activeTab={activeTab}
                  onUpdate={fetchEnquiries} 
                  onDelete={handleDeleteEnquiry}
                  onClick={() => setSelectedEnquiry(enquiry)} 
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Export to Excel Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '28px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            border: '1px solid #eae5df'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileSpreadsheet size={22} color="#7c5847" />
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#2c2c2c' }}>Export Excel Report</h2>
              </div>
              <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            {/* Filter 1: Enquiry Category Selection (Single category forced) */}
            <div className="admin-form-group">
              <label className="admin-form-label">1. Select Category to Export</label>
              <select 
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="admin-form-input"
              >
                <option value="general">General Formulation Enquiries ({getCount('general')} records)</option>
                <option value="product">Product Specific Quotes ({getCount('product')} records)</option>
                <option value="contact">Direct Contact Messages ({getCount('contact')} records)</option>
              </select>
            </div>

            {/* Filter 2: Status */}
            <div className="admin-form-group">
              <label className="admin-form-label">2. Select Status</label>
              <select 
                value={exportStatus}
                onChange={(e) => setExportStatus(e.target.value)}
                className="admin-form-input"
              >
                <option value="all">All Statuses (Solved & Unsolved)</option>
                <option value="unsolved">Unsolved / Pending Only</option>
                <option value="solved">Solved Only</option>
              </select>
            </div>

            {/* Filter 3: Date Range */}
            <div className="admin-form-group">
              <label className="admin-form-label">3. Select Date Range</label>
              <select 
                value={exportDatePreset}
                onChange={(e) => setExportDatePreset(e.target.value)}
                className="admin-form-input"
                style={{ marginBottom: exportDatePreset === 'custom' ? '10px' : '0' }}
              >
                <option value="all">All Time (Everything)</option>
                <option value="today">Today Only</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Date Range</option>
              </select>

              {exportDatePreset === 'custom' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#666' }}>From Date:</span>
                    <input 
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#666' }}>To Date:</span>
                    <input 
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Filter Matching Counter */}
            <div style={{ backgroundColor: '#faf6f0', border: '1px solid #eee7df', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#555', fontWeight: '500' }}>Matching Records to Export:</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#7c5847' }}>
                {getExportRecords().length} enquiries
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowExportModal(false)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleDownloadExcel}
                className="admin-btn admin-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={18} />
                <span>Generate & Download Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001, backdropFilter: 'blur(2px)' }}
            onClick={() => setSelectedEnquiry(null)}
          ></div>
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '90%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', zIndex: 1002, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>{selectedEnquiry.name}</h2>
                  <span style={{ 
                    fontSize: '11px', 
                    backgroundColor: selectedEnquiry.is_solved ? '#e6ffed' : '#fff4eb', 
                    color: selectedEnquiry.is_solved ? '#38a169' : '#d97706', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontWeight: '700' 
                  }}>
                    {selectedEnquiry.is_solved ? 'Solved' : 'Pending'}
                  </span>
                </div>
                <div style={{ color: '#777', fontSize: '13px', marginTop: '4px' }}>
                  {new Date(selectedEnquiry.created_at).toLocaleString()} • <span style={{ textTransform: 'capitalize', fontWeight: '600', color: '#7c5847' }}>{selectedEnquiry.type} Enquiry</span>
                </div>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Email Address</div>
                <a href={`mailto:${selectedEnquiry.email}`} style={{ color: '#7c5847', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{selectedEnquiry.email}</a>
              </div>
              {(() => {
                let p = selectedEnquiry.phone;
                if (!p && selectedEnquiry.message?.startsWith('Phone: ')) {
                  p = selectedEnquiry.message.split('\n\n')[0].replace('Phone: ', '').trim();
                }
                return p ? (
                  <div>
                    <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Phone Number</div>
                    <a href={`tel:${p.replace(/\s+/g, '')}`} style={{ color: '#7c5847', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{p}</a>
                  </div>
                ) : null;
              })()}
              {selectedEnquiry.company && (
                <div>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Company</div>
                  <div style={{ fontSize: '14px', color: '#444' }}>{selectedEnquiry.company}</div>
                </div>
              )}
              {selectedEnquiry.country && (
                <div>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Country / Region</div>
                  <div style={{ fontSize: '14px', color: '#444' }}>📍 {selectedEnquiry.country}</div>
                </div>
              )}
              {selectedEnquiry.role && (
                <div>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Role</div>
                  <div style={{ fontSize: '14px', color: '#444' }}>{selectedEnquiry.role}</div>
                </div>
              )}
              {selectedEnquiry.product_name && (
                <div>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Product Requested</div>
                  <div style={{ fontSize: '14px', color: '#7c5847', fontWeight: '600' }}>🌿 {selectedEnquiry.product_name}</div>
                </div>
              )}
            </div>
            
            {selectedEnquiry.ingredients && selectedEnquiry.ingredients.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>Requested Ingredients</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#faf6f0', borderBottom: '1px solid #eae5df' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#7c5847' }}>Herb / Extract</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#7c5847' }}>Form</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#7c5847' }}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEnquiry.ingredients.map((ing, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '8px 12px', color: '#333', fontWeight: '500' }}>{ing.herb}</td>
                        <td style={{ padding: '8px 12px', color: '#666' }}>{ing.form || '-'}</td>
                        <td style={{ padding: '8px 12px', color: '#666' }}>{ing.qty || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {(selectedEnquiry.end_application?.length > 0 || selectedEnquiry.documents_needed?.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', backgroundColor: '#faf8f5', padding: '15px', borderRadius: '8px', border: '1px solid #eee7df' }}>
                {selectedEnquiry.end_application?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: '6px' }}>Applications</div>
                    <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.4' }}>{selectedEnquiry.end_application.join(', ')}</div>
                  </div>
                )}
                {selectedEnquiry.documents_needed?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: '6px' }}>Documents</div>
                    <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.4' }}>{selectedEnquiry.documents_needed.join(', ')}</div>
                  </div>
                )}
              </div>
            )}
            
            {(() => {
              let msg = selectedEnquiry.message || '';
              if (msg.startsWith('Phone: ') && !selectedEnquiry.phone) {
                const parts = msg.split('\n\n');
                if (parts.length > 1) {
                  msg = parts.slice(1).join('\n\n').trim();
                } else {
                  msg = '';
                }
              }
              return msg ? (
                <div style={{ marginBottom: '25px' }}>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>Additional Message</div>
                  <div style={{ backgroundColor: '#faf8f5', padding: '15px', borderRadius: '8px', fontSize: '14px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap', border: '1px solid #eee7df' }}>
                    {msg}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #eee' }}>
              <button
                onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                className="admin-btn admin-btn-danger"
              >
                <Trash2 size={16} />
                <span>Delete Enquiry</span>
              </button>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="admin-btn admin-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Styles for Tabs
const tabStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  backgroundColor: 'white',
  border: '1px solid #eae5df',
  borderRadius: '8px',
  color: '#555',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const activeTabStyle = {
  backgroundColor: '#7c5847',
  color: 'white',
  borderColor: '#7c5847',
  boxShadow: '0 4px 10px rgba(124, 88, 71, 0.2)'
};

const badgeStyle = {
  backgroundColor: 'rgba(0,0,0,0.08)',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  marginLeft: '4px'
};

export default Enquiries;
