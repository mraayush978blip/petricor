import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { clientBotCheck, verifyRecaptchaToken, getFormOpenTime } from '../lib/botProtection';

export default function ContactUs() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Bot protection
    const honeypotRef = useRef('');
    const formOpenedAt = useRef(getFormOpenTime());
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        // Email format validation requiring @ and domain dot
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            setError('Please enter a valid email address containing @ and a valid domain (e.g., name@domain.com)');
            setLoading(false);
            return;
        }

        if (!phone || !phone.trim()) {
            setError('Please enter a valid phone number.');
            setLoading(false);
            return;
        }

        // Layer 1 & 2: Honeypot + Time check
        const botCheck = clientBotCheck(honeypotRef.current, formOpenedAt.current);
        if (botCheck.blocked) {
            // Silently drop — don't tell bots they were caught
            setLoading(false);
            setSuccess(true); // fake success to fool bots
            return;
        }

        // Layer 3: reCAPTCHA v3
        if (executeRecaptcha) {
            const token = await executeRecaptcha('contact_form');
            const isHuman = await verifyRecaptchaToken(token);
            if (!isHuman) {
                setError('Verification failed. Please try again.');
                setLoading(false);
                return;
            }
        }

        const { error: submitError } = await supabase
            .from('enquiries')
            .insert([{ 
                type: 'contact',
                name: name.trim(), 
                email: email.trim(), 
                phone: phone.trim(),
                message: message.trim() 
            }]);

        if (submitError) {
            setError('There was an error sending your message. Please try again.');
        } else {
            setSuccess(true);
            setName('');
            setEmail('');
            setPhone('');
            setMessage('');
        }
        setLoading(false);
    };

    return (
        <div className="container contact-container" style={{ padding: '60px 15px', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
            <div className="contact-flex-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
                {/* Left Column - Contact Info */}
                <div className="contact-info-col" style={{ flex: '1 1 40%', minWidth: '300px' }}>
                    <h1 style={{ fontSize: '36px', color: '#7c5847', marginBottom: '20px', fontWeight: '600' }}>
                        Reach Out to Petricor
                    </h1>
                    <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.8', marginBottom: '40px' }}>
                        We'd love to hear from you. Whether you're a brand, manufacturer, or formulator looking for high-quality botanical extracts, standardized powders, or custom ingredients - our team is ready to help.
                    </p>

                    <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ color: '#7c5847', fontSize: '20px', marginBottom: '15px', fontWeight: '600' }}>Office Location</h4>
                        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>
                            <strong>Corporate Office:</strong><br />
                            Unit No. 602 &amp; 600B, Building No. 6, Ground Floor, <br />
                            Solitaire Corporate Park, Andheri Kurla Road, <br />
                            Andheri East, Mumbai - 400093.
                        </p>
                        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginTop: '15px' }}>
                            <strong>Head Office:</strong><br />
                            20, Shastri Nagar, <br />
                            Neemuch - 458441, Madhya Pradesh
                        </p>
                    </div>

                    <div>
                        <h4 style={{ color: '#7c5847', fontSize: '20px', marginBottom: '15px', fontWeight: '600' }}>Contact Info</h4>
                        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '5px' }}>
                            <strong>Phone:</strong> <a href="tel:+919589794989" style={{ color: '#7c5847', textDecoration: 'none', fontWeight: '600' }}>+91 9589794989</a>
                        </p>
                        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>
                            <strong>Email:</strong> <a href="mailto:contact@petricor.co.in" style={{ color: '#7c5847', textDecoration: 'none' }}>contact@petricor.co.in</a>
                        </p>
                    </div>
                </div>

                {/* Right Column - Contact Form */}
                <div className="contact-form-col" style={{ flex: '1 1 50%', minWidth: '300px', backgroundColor: '#f9f9f9', padding: '40px', borderRadius: '8px', boxSizing: 'border-box' }}>
                    <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '10px', fontWeight: '600' }}>
                        Get in Touch
                    </h2>
                    <p style={{ color: '#666', marginBottom: '30px', fontSize: '15px' }}>
                        Drop us a message and we'll respond within 24 hours.
                    </p>
                    
                    {success && (
                        <div style={{ padding: '15px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '20px' }}>
                            Thank you for your message. We will get back to you shortly!
                        </div>
                    )}
                    {error && (
                        <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Honeypot field — hidden from real users, bots will fill it */}
                        <input
                            type="text"
                            name="website"
                            onChange={(e) => { honeypotRef.current = e.target.value; }}
                            style={{ display: 'none' }}
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                        />

                        <input 
                            type="text" 
                            placeholder="Name" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ padding: '12px 15px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '15px', width: '100%', boxSizing: 'border-box' }}
                        />
                        <input 
                            type="email" 
                            placeholder="Email" 
                            required 
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                            title="Please enter a valid email address with an @ symbol"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '12px 15px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '15px', width: '100%', boxSizing: 'border-box' }}
                        />
                        <PhoneInput
                            international
                            defaultCountry="IN"
                            limitMaxLength={true}
                            placeholder="Phone Number *"
                            value={phone}
                            onChange={(value: any) => setPhone(value || '')}
                            required
                        />
                        <textarea 
                            placeholder="Your Message" 
                            rows={5} 
                            required 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{ padding: '12px 15px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '15px', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                        ></textarea>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                backgroundColor: '#7c5847', 
                                color: 'white', 
                                padding: '15px 30px', 
                                border: 'none', 
                                borderRadius: '3px', 
                                fontSize: '16px', 
                                fontWeight: '600', 
                                cursor: loading ? 'not-allowed' : 'pointer',
                                marginTop: '10px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
