import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { clientBotCheck, verifyRecaptchaToken, getFormOpenTime } from '../lib/botProtection';

const END_APPLICATIONS = [
  'Dietary supplement', 'Functional food & beverage', 'Cosmetics / skincare',
  'Ayurvedic product', 'Pharma / OTC', 'R&D / testing', 'Animal / pet nutrition', 'Other'
];

const DOCUMENTS = [
  'Certificate of Analysis (CoA)', 'MSDS', 'Certificate of Origin',
  'Phytosanitary', 'Allergen Declaration', 'Not sure yet'
];

export default function GeneralEnquiry() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Bot protection
  const honeypotRef = useRef('');
  const formOpenedAt = useRef(getFormOpenTime());
  const isSubmittingRef = useRef(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    message: ''
  });

  const [ingredients, setIngredients] = useState([{ herb: '', herbCustom: '', form: '', formCustom: '', qty: '', qtyCustom: '' }]);
  const [endApplications, setEndApplications] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [productOptions, setProductOptions] = useState<{title: string}[]>([]);

  useEffect(() => {
    supabase.from('products').select('title').order('title').then(({ data }) => {
      if (data) setProductOptions(data);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addIngredientRow = () => {
    if (ingredients.length < 10) {
      setIngredients([...ingredients, { herb: '', herbCustom: '', form: '', formCustom: '', qty: '', qtyCustom: '' }]);
    }
  };

  const removeIngredientRow = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const togglePill = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Email format validation requiring @ and domain dot
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert('Please enter a valid business email address containing @ and a valid domain (e.g. name@domain.com)');
      isSubmittingRef.current = false;
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      alert('Please enter a valid WhatsApp / Phone number.');
      isSubmittingRef.current = false;
      return;
    }

    setLoading(true);

    // Layer 1 & 2: Honeypot + Time check
    const botCheck = clientBotCheck(honeypotRef.current, formOpenedAt.current);
    if (botCheck.blocked) {
      isSubmittingRef.current = false;
      setLoading(false);
      setSuccess(true); // fake success
      return;
    }

    // Layer 3: reCAPTCHA v3
    if (executeRecaptcha) {
      const token = await executeRecaptcha('general_enquiry');
      const isHuman = await verifyRecaptchaToken(token);
      if (!isHuman) {
        alert('Verification failed. Please try again.');
        isSubmittingRef.current = false;
        setLoading(false);
        return;
      }
    }

    const finalIngredients = ingredients.map(ing => ({
      herb: ing.herb === 'Other' ? ing.herbCustom : ing.herb,
      form: ing.form === 'Other' ? ing.formCustom : ing.form,
      qty: ing.qty === 'Other' ? ing.qtyCustom : ing.qty,
    })).filter(ing => ing.herb && ing.herb.trim() !== '');

    const { error } = await supabase.from('enquiries').insert([
      {
        type: 'general',
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        message: formData.message,
        ingredients: finalIngredients,
        end_application: endApplications,
        documents_needed: documents
      }
    ]);

    if (error) {
      alert('Error submitting enquiry: ' + error.message);
    } else {
      setSuccess(true);
    }
    isSubmittingRef.current = false;
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ backgroundColor: '#fdfbf7', padding: '100px 15px', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '36px', color: '#7c5847', marginBottom: '20px' }}>Thank You!</h2>
        <p style={{ fontSize: '18px', color: '#555', marginBottom: '30px' }}>Your enquiry has been submitted. We will get back to you shortly.</p>
        <Link to="/" style={{ display: 'inline-block', backgroundColor: '#7c5847', color: 'white', padding: '12px 30px', borderRadius: '4px', textDecoration: 'none' }}>Return to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fdfbf7', padding: '60px 15px', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="ge-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 className="ge-title" style={{ fontSize: '42px', color: '#333', marginBottom: '15px' }}>Tell us what you're looking for.</h1>
          <p style={{ fontSize: '18px', color: '#7c5847', fontStyle: 'italic' }}>
            "Tell us what you need even a partial inquiry helps us connect with the right dimensions for you."
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

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

          {/* Section 1: Basic Info */}
          <div className="ge-section" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#7c5847', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Basic Info <span style={{ backgroundColor: '#f0e6d2', color: '#7c5847', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>REQUIRED</span>
            </h3>

            <div className="ge-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} placeholder="Your full name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>Company</label>
                <input type="text" name="company" value={formData.company} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} placeholder="Brand or company name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>Business Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please enter a valid email address" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} placeholder="you@company.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>WhatsApp / Phone *</label>
                <PhoneInput
                  international
                  defaultCountry="IN"
                  limitMaxLength={true}
                  value={formData.phone}
                  onChange={(value: any) => setFormData({ ...formData, phone: value || '' })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} placeholder="e.g. United States" />
              </div>
            </div>
          </div>

          {/* Section 2: Ingredients Needed */}
          <div className="ge-section" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#7c5847', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Ingredients Needed <span style={{ backgroundColor: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>OPTIONAL</span>
            </h3>
            <p style={{ fontSize: '14px', color: '#777', marginBottom: '25px' }}>Select the herbs you need. Add up to 10 rows — you can leave form or quantity blank if you're not sure yet.</p>

            <div className="ge-ingredient-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '15px', marginBottom: '15px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', letterSpacing: '1px' }}>HERB</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', letterSpacing: '1px' }}>FORM</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', letterSpacing: '1px' }}>EST. QUANTITY</div>
              <div></div>
            </div>

            {ingredients.map((ing, idx) => (
              <div key={idx} className="ge-ingredient-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '15px', marginBottom: '15px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select value={ing.herb} onChange={(e) => handleIngredientChange(idx, 'herb', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#f9f9f9', appearance: 'auto', outline: 'none' }}>
                    <option value="">Select product...</option>
                    <option value="Other">Other (Please specify)</option>
                    {productOptions.map(p => (
                      <option key={p.title} value={p.title}>{p.title}</option>
                    ))}
                  </select>
                  {ing.herb === 'Other' && (
                    <input type="text" value={ing.herbCustom} onChange={(e) => handleIngredientChange(idx, 'herbCustom', e.target.value)} placeholder="Type custom herb..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select value={ing.form} onChange={(e) => handleIngredientChange(idx, 'form', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#f9f9f9', appearance: 'auto', outline: 'none' }}>
                    <option value="">Select form...</option>
                    <option value="Dried whole / raw">Dried whole / raw</option>
                    <option value="Powder">Powder</option>
                    <option value="Standardised extract">Standardised extract</option>
                    <option value="Ratio extract (e.g. 10:1)">Ratio extract (e.g. 10:1)</option>
                    <option value="Oil / oleoresin">Oil / oleoresin</option>
                    <option value="Other">Other</option>
                  </select>
                  {ing.form === 'Other' && (
                    <input type="text" value={ing.formCustom} onChange={(e) => handleIngredientChange(idx, 'formCustom', e.target.value)} placeholder="Specify form..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select value={ing.qty} onChange={(e) => handleIngredientChange(idx, 'qty', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#f9f9f9', appearance: 'auto', outline: 'none' }}>
                    <option value="">Select qty...</option>
                    <option value="< 25 kg">&lt; 25 kg</option>
                    <option value="25-100 kg">25-100 kg</option>
                    <option value="100-500 kg">100-500 kg</option>
                    <option value="500 kg-1 MT">500 kg-1 MT</option>
                    <option value="1 MT+">1 MT+</option>
                    <option value="Other">Other</option>
                  </select>
                  {ing.qty === 'Other' && (
                    <input type="text" value={ing.qtyCustom} onChange={(e) => handleIngredientChange(idx, 'qtyCustom', e.target.value)} placeholder="Specify qty..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                  )}
                </div>
                
                {idx > 0 ? (
                  <button type="button" onClick={() => removeIngredientRow(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', marginTop: '12px' }}><X size={20} /></button>
                ) : <div />}
              </div>
            ))}

            {ingredients.length < 10 && (
              <button type="button" onClick={addIngredientRow} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px dashed #7c5847', color: '#7c5847', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }}>
                <Plus size={16} /> Add another herb
              </button>
            )}
          </div>

          {/* Section 3: End Application */}
          <div className="ge-section" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#7c5847', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              End Application <span style={{ backgroundColor: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>OPTIONAL</span>
            </h3>

            <div className="ge-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {END_APPLICATIONS.map(app => (
                <button
                  key={app}
                  type="button"
                  onClick={() => togglePill(app, endApplications, setEndApplications)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '30px',
                    border: endApplications.includes(app) ? '1px solid #7c5847' : '1px solid #ddd',
                    backgroundColor: endApplications.includes(app) ? '#fdfbf7' : 'white',
                    color: endApplications.includes(app) ? '#7c5847' : '#555',
                    cursor: 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {app}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Documents Needed */}
          <div className="ge-section" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#7c5847', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Documents Needed <span style={{ backgroundColor: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>OPTIONAL</span>
            </h3>

            <div className="ge-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {DOCUMENTS.map(doc => (
                <button
                  key={doc}
                  type="button"
                  onClick={() => togglePill(doc, documents, setDocuments)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '30px',
                    border: documents.includes(doc) ? '1px solid #7c5847' : '1px solid #ddd',
                    backgroundColor: documents.includes(doc) ? '#fdfbf7' : 'white',
                    color: documents.includes(doc) ? '#7c5847' : '#555',
                    cursor: 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {doc}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Anything Else */}
          <div className="ge-section" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#7c5847', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Anything Else <span style={{ backgroundColor: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>OPTIONAL</span>
            </h3>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              placeholder="Custom spec, extract grade, packaging preference, or any question you have for us..."
              style={{ width: '100%', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '15px', backgroundColor: '#f9f9f9', resize: 'vertical' }}
            ></textarea>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#7c5847',
                color: 'white',
                padding: '16px 40px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                width: '100%',
                maxWidth: '400px'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
