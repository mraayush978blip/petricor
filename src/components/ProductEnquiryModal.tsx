import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { clientBotCheck, verifyRecaptchaToken, getFormOpenTime } from '../lib/botProtection';

interface ProductEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export default function ProductEnquiryModal({ isOpen, onClose, product }: ProductEnquiryModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Bot protection
  const honeypotRef = useRef('');
  const formOpenedAt = useRef(getFormOpenTime());
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    role: '',
    message: ''
  });

  if (!isOpen || !product) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Layer 1 & 2: Honeypot + Time check
    const botCheck = clientBotCheck(honeypotRef.current, formOpenedAt.current);
    if (botCheck.blocked) {
      setLoading(false);
      setSuccess(true); // fake success
      return;
    }

    // Layer 3: reCAPTCHA v3
    if (executeRecaptcha) {
      const token = await executeRecaptcha('product_enquiry');
      const isHuman = await verifyRecaptchaToken(token);
      if (!isHuman) {
        alert('Verification failed. Please try again.');
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from('enquiries').insert([
      {
        type: 'product',
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        role: formData.role,
        message: formData.message,
        product_name: product.title,
        product_id: product.id
      }
    ]);

    if (error) {
      alert('Error submitting enquiry: ' + error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
      }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10, color: '#999' }}
        >
          <X size={24} />
        </button>

        {success ? (
          <div style={{ padding: '80px 40px', textAlign: 'center', width: '100%' }}>
            <h2 style={{ fontSize: '30px', color: '#7c5847', marginBottom: '20px' }}>Enquiry Sent!</h2>
            <p style={{ fontSize: '16px', color: '#555', marginBottom: '30px' }}>Thank you for your interest in {product.title}. We will get back to you shortly.</p>
            <button 
              onClick={onClose}
              style={{ backgroundColor: '#7c5847', color: 'white', padding: '12px 30px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '16px' }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Left Side: Product Details (Hidden on mobile) */}
            <div className="modal-left-pane" style={{ flex: '1', backgroundColor: '#fcfcfc', borderRight: '1px solid #eee', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img src={product.images && product.images[0] ? product.images[0] : ''} alt={product.title} style={{ width: '100%', maxWidth: '300px', height: 'auto', objectFit: 'contain', marginBottom: '20px' }} />
              <h2 style={{ fontSize: '24px', color: '#333', textAlign: 'center', margin: 0 }}>{product.title}</h2>
              {product.category && <p style={{ color: '#888', marginTop: '5px' }}>{product.category}</p>}
            </div>

            {/* Right Side: Form */}
            <div style={{ flex: '1.5', padding: '40px', overflowY: 'auto', maxHeight: '90vh' }}>
              <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '25px', fontWeight: '500' }}>Enquire about this product</h3>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Honeypot — hidden from real users */}
                <input
                  type="text"
                  name="website"
                  onChange={(e) => { honeypotRef.current = e.target.value; }}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Name *" style={inputStyle} />
                <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Company" style={inputStyle} />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please enter a valid email address" placeholder="Business Email *" style={inputStyle} />
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={formData.phone}
                  onChange={(value: any) => setFormData({ ...formData, phone: value || '' })}
                  required
                />
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} required placeholder="Country *" style={inputStyle} />
                <input type="text" name="role" value={formData.role} onChange={handleInputChange} placeholder="Your Role" style={inputStyle} />
                
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleInputChange} 
                  rows={4} 
                  placeholder="Comment" 
                  style={{ ...inputStyle, resize: 'vertical' }} 
                />

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#7c5847',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    marginTop: '10px'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 768px) {
            .modal-left-pane { display: none !important; }
          }
        `}} />
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  boxSizing: 'border-box' as const,
  fontSize: '15px'
};
