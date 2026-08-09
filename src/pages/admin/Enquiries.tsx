import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Briefcase, Package, Search, Calendar, Filter } from 'lucide-react';

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

const EnquiryRow = ({ enquiry, onUpdate }: { enquiry: Enquiry, onUpdate: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fallback for legacy contact form (where phone was in message)
  let phone = enquiry.phone || 'N/A';
  let messageText = enquiry.message || '';
  
  if (messageText.startsWith('Phone: ') && !enquiry.phone) {
    const parts = messageText.split('\n\n');
    if (parts.length > 1) {
      phone = parts[0].replace('Phone: ', '').trim();
      messageText = parts.slice(1).join('\n\n').trim();
    } else {
      // Sometimes it was submitted without \n\n, just "Phone: <phone> <message>" or just "Phone: <phone>"
      // In latest version it trims empty message so it becomes just "Phone: <phone>"
      phone = messageText.replace('Phone: ', '').trim();
      messageText = '';
    }
  }

  const isLongMessage = messageText.length > 80;
  const displayText = isExpanded || !isLongMessage 
    ? messageText 
    : messageText.substring(0, 80) + '...';

  const toggleSolved = async () => {
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

  return (
    <tr style={{ opacity: enquiry.is_solved ? 0.7 : 1, backgroundColor: enquiry.is_solved ? '#fcfcfc' : 'white' }}>
      
      {/* Contact Column */}
      <td style={{ verticalAlign: 'top' }}>
        <div style={{ fontWeight: '600', color: '#333', fontSize: '15px' }}>
          {enquiry.name}
          {enquiry.is_solved && <span style={{ marginLeft: '8px', fontSize: '10px', backgroundColor: '#e6ffed', color: '#38a169', padding: '2px 6px', borderRadius: '10px', verticalAlign: 'middle' }}>Solved</span>}
        </div>
        <div style={{ marginTop: '4px', fontSize: '13px' }}>
          <a href={`mailto:${enquiry.email}`} style={{ color: '#7c5847', textDecoration: 'none', display: 'block', marginBottom: '2px' }}>{enquiry.email}</a>
          {phone !== 'N/A' && <a href={`tel:${phone.replace(/\\s+/g, '')}`} style={{ color: '#666', textDecoration: 'none' }}>{phone}</a>}
        </div>
      </td>

      {/* Details Column (Company/Country/Role) - Only for General/Product */}
      {enquiry.type !== 'contact' && (
        <td style={{ verticalAlign: 'top', fontSize: '13px', color: '#555' }}>
          {enquiry.company && <div style={{ fontWeight: '500', color: '#333' }}>{enquiry.company}</div>}
          {enquiry.role && <div>Role: {enquiry.role}</div>}
          {enquiry.country && <div>📍 {enquiry.country}</div>}
        </td>
      )}

      {/* Product Column - Only for Product */}
      {enquiry.type === 'product' && (
        <td style={{ verticalAlign: 'top' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#f0e6d2', color: '#7c5847', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: '500' }}>
            {enquiry.product_name}
          </div>
        </td>
      )}

      {/* Requirements Column - Only for General */}
      {enquiry.type === 'general' && (
        <td style={{ verticalAlign: 'top', fontSize: '13px', maxWidth: '300px' }}>
          {enquiry.ingredients && enquiry.ingredients.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: '#7c5847', fontSize: '11px', textTransform: 'uppercase' }}>Ingredients:</span>
              <div style={{ color: '#555' }}>{enquiry.ingredients.map(ing => `${ing.herb} (${ing.qty || '-'})`).join(', ')}</div>
            </div>
          )}
          {enquiry.end_application && enquiry.end_application.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: '#7c5847', fontSize: '11px', textTransform: 'uppercase' }}>Applications:</span>
              <div style={{ color: '#555' }}>{enquiry.end_application.join(', ')}</div>
            </div>
          )}
          {enquiry.documents_needed && enquiry.documents_needed.length > 0 && (
            <div>
              <span style={{ fontWeight: '600', color: '#7c5847', fontSize: '11px', textTransform: 'uppercase' }}>Documents:</span>
              <div style={{ color: '#555' }}>{enquiry.documents_needed.join(', ')}</div>
            </div>
          )}
        </td>
      )}

      {/* Message Column */}
      <td style={{ verticalAlign: 'top' }}>
        <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '6px', fontSize: '13px', maxWidth: '350px', border: '1px solid #f0f0f0' }}>
          {messageText ? (
            <>
              <div style={{ whiteSpace: 'pre-wrap', color: '#444', lineHeight: '1.5' }}>{displayText}</div>
              {isLongMessage && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{ background: 'none', border: 'none', color: '#7c5847', padding: 0, marginTop: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                >
                  {isExpanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </>
          ) : (
            <span style={{ color: '#999', fontStyle: 'italic' }}>No comment</span>
          )}
        </div>
      </td>

      {/* Date & Actions */}
      <td style={{ verticalAlign: 'top', width: '120px' }}>
        <div style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>
          {new Date(enquiry.created_at).toLocaleDateString()}
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '15px' }}>
          {new Date(enquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <button
          onClick={toggleSolved}
          disabled={updating}
          style={{ 
            backgroundColor: enquiry.is_solved ? '#f4f4f4' : '#7c5847', 
            color: enquiry.is_solved ? '#666' : 'white', 
            border: enquiry.is_solved ? '1px solid #ddd' : 'none', 
            padding: '6px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            width: '100%',
            transition: 'all 0.2s'
          }}
        >
          {updating ? '...' : enquiry.is_solved ? 'Mark Unsolved' : 'Mark Solved'}
        </button>
      </td>
    </tr>
  );
};

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'contact' | 'general' | 'product'>('general');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'solved'|'unsolved'>('all');

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
      // For older entries that don't have a type, we assume they are 'contact'
      const typedData = (data || []).map(enq => ({
        ...enq,
        type: enq.type || 'contact'
      }));
      setEnquiries(typedData);
    }
    setLoading(false);
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

    // Date
    if (dateFrom) {
      if (new Date(enquiry.created_at) < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setDate(toDate.getDate() + 1);
      if (new Date(enquiry.created_at) > toDate) return false;
    }

    return true;
  });

  const getCount = (type: string) => enquiries.filter(e => e.type === type).length;

  if (loading) return <div>Loading enquiries...</div>;

  return (
    <div>
      <h1 className="admin-page-title" style={{ marginBottom: '25px' }}>Enquiries Dashboard</h1>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <button 
          onClick={() => setActiveTab('contact')}
          style={{ ...tabStyle, ...(activeTab === 'contact' ? activeTabStyle : {}) }}
        >
          <Mail size={18} /> Contact Enquiries <span style={badgeStyle}>{getCount('contact')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('general')}
          style={{ ...tabStyle, ...(activeTab === 'general' ? activeTabStyle : {}) }}
        >
          <Briefcase size={18} /> General Enquiries <span style={badgeStyle}>{getCount('general')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('product')}
          style={{ ...tabStyle, ...(activeTab === 'product' ? activeTabStyle : {}) }}
        >
          <Package size={18} /> Product Enquiries <span style={badgeStyle}>{getCount('product')}</span>
        </button>
      </div>
      
      {/* Filters */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eaeaea', marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999' }} />
          <input 
            type="text" 
            placeholder="Search name, email, company..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-form-input"
            style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box', margin: 0 }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} color="#777" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="admin-form-input"
            style={{ width: '140px', margin: 0 }}
          >
            <option value="all">All Status</option>
            <option value="unsolved">Unsolved</option>
            <option value="solved">Solved</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={16} color="#777" />
          <input 
            type="date" 
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="admin-form-input"
            style={{ margin: 0 }}
          />
          <span style={{ color: '#999' }}>to</span>
          <input 
            type="date" 
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="admin-form-input"
            style={{ margin: 0 }}
          />
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', backgroundColor: '#f9f9f9', borderBottom: '2px solid #eaeaea', color: '#555' }}>Contact Info</th>
              {activeTab !== 'contact' && <th style={{ padding: '15px', textAlign: 'left', backgroundColor: '#f9f9f9', borderBottom: '2px solid #eaeaea', color: '#555' }}>Details</th>}
              {activeTab === 'product' && <th style={{ padding: '15px', textAlign: 'left', backgroundColor: '#f9f9f9', borderBottom: '2px solid #eaeaea', color: '#555' }}>Product</th>}
              {activeTab === 'general' && <th style={{ padding: '15px', textAlign: 'left', backgroundColor: '#f9f9f9', borderBottom: '2px solid #eaeaea', color: '#555' }}>Requirements</th>}
              <th style={{ padding: '15px', textAlign: 'left', backgroundColor: '#f9f9f9', borderBottom: '2px solid #eaeaea', color: '#555' }}>Comment</th>
              <th style={{ padding: '15px', textAlign: 'left', backgroundColor: '#f9f9f9', borderBottom: '2px solid #eaeaea', color: '#555' }}>Date / Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                  No {activeTab} enquiries found matching your filters.
                </td>
              </tr>
            ) : (
              filteredEnquiries.map((enquiry) => (
                <EnquiryRow key={enquiry.id} enquiry={enquiry} onUpdate={fetchEnquiries} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles for Tabs
const tabStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 24px',
  backgroundColor: 'white',
  border: '1px solid #eaeaea',
  borderRadius: '8px',
  color: '#666',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
};

const activeTabStyle = {
  backgroundColor: '#7c5847',
  color: 'white',
  borderColor: '#7c5847',
  boxShadow: '0 4px 10px rgba(124, 88, 71, 0.2)'
};

const badgeStyle = {
  backgroundColor: 'rgba(0,0,0,0.1)',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  marginLeft: '5px'
};

export default Enquiries;
