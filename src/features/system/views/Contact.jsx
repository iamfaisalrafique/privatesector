import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function Contact({ navigate }) {
  const { t, isRtl } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '40px 0 64px' }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '24px', display: 'flex', gap: '6px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{t('Home', 'Home')}</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>Contact</span>
        </div>

        {/* Editorial Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="caps-label" style={{ color: 'var(--primary-red)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Connect With Us</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 700, color: 'var(--text-ink)', margin: '0 0 16px' }}>
            Get In Touch
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-charcoal)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Have questions regarding directories, premium profile activation, or Southern California transatlantic partnerships? Speak with our team today.
          </p>
        </div>

        {/* Contact Layout: Twin Offices Left, Contact Form Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }} className="home-news-row">
          
          {/* Twin Offices Desk */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid #000', paddingBottom: '8px' }}>Our Office Desks</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Zurich desk */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--light-border)', padding: '24px' }}>
                <span style={{ fontSize: '10px', backgroundColor: 'var(--red-light)', color: 'var(--primary-red)', padding: '2px 6px', fontWeight: 600, textTransform: 'uppercase', display: 'inline-block', marginBottom: '8px' }}>Switzerland HQ</span>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--text-ink)', marginBottom: '12px' }}>Zurich Office Desk</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-charcoal)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /><span>Bahnhofstrasse 100, 8001 Zürich</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /><span>+41 44 200 0000</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /><span>zurich@privatesector.ch</span></div>
                </div>
              </div>

              {/* California desk */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--light-border)', padding: '24px' }}>
                <span style={{ fontSize: '10px', backgroundColor: 'var(--red-light)', color: 'var(--primary-red)', padding: '2px 6px', fontWeight: 600, textTransform: 'uppercase', display: 'inline-block', marginBottom: '8px' }}>United States Desk</span>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--text-ink)', marginBottom: '12px' }}>Los Angeles Office Desk</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-charcoal)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /><span>750 Figueroa St, Los Angeles, CA 90017</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /><span>+1 213 555 0199</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /><span>la@privatesector.ch</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form panel */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--light-border)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Inquiry Dispatcher</h2>
            
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle size={48} style={{ color: 'var(--accent-green)', marginBottom: '16px' }} />
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--text-ink)', marginBottom: '8px' }}>Message Received</strong>
                <p style={{ fontSize: '14px', color: 'var(--text-charcoal)', lineHeight: '1.6' }}>
                  Thank you for reaching out. A trade officer representing your region's desk will follow up with you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-ink)', marginBottom: '6px' }}>Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--light-border)', fontSize: '13px' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-ink)', marginBottom: '6px' }}>Corporate Email *</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--light-border)', fontSize: '13px' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-ink)', marginBottom: '6px' }}>Company Name</label>
                  <input 
                    type="text" 
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--light-border)', fontSize: '13px' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-ink)', marginBottom: '6px' }}>Your Inquiry *</label>
                  <textarea 
                    rows={5} 
                    required 
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--light-border)', fontSize: '13px', fontFamily: 'var(--font-sans)', lineHeight: '1.5' }} 
                  />
                </div>

                <button type="submit" className="btn btn-gold-fill" style={{ width: '100%', marginTop: '12px' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
