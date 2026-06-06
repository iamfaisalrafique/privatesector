import React from 'react';
import { 
  Building, 
  MapPin, 
  Calendar, 
  Users, 
  Globe, 
  FileCode,
  Layers,
  Sparkles,
  Link,
  Mail
} from 'lucide-react';

export default function KnowledgePanel({ company }) {
  if (!company) return null;

  const logoInitial = company.name ? company.name.charAt(0) : 'C';

  const formatSwissNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") : '0';
  };

  return (
    <div 
      style={{
        backgroundColor: '#FFFFFF',
        border: '0.5px solid var(--light-border)',
        borderTop: '3px solid var(--primary-gold)',
        borderRadius: '6px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'sticky',
        top: '88px'
      }}
    >
      {/* Logo and Name Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
        <div 
          style={{ 
            width: '120px', 
            height: '120px', 
            backgroundColor: company.logo_bg || 'var(--surface-warm)',
            border: '0.5px solid var(--light-border)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '48px',
            fontWeight: 700,
            fontFamily: '"Playfair Display", Georgia, serif'
          }}
        >
          {logoInitial}
        </div>
        
        <div>
          <h2 style={{ fontSize: '26px', fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: 'var(--text-ink)', margin: '0 0 6px 0' }}>
            {company.name}
          </h2>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {company.verified === 1 && (
              <span className="badge badge-verified" style={{ fontSize: '10px' }}>Verified ✓</span>
            )}
            <span className="badge badge-canton">{company.canton}</span>
            <span className="badge badge-industry">{company.industry}</span>
          </div>
        </div>
      </div>

      {/* 3-Col Quick Stats Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '8px', 
          borderTop: '0.5px solid var(--light-border)', 
          borderBottom: '0.5px solid var(--light-border)', 
          padding: '16px 0',
          textAlign: 'center'
        }}
      >
        <div>
          <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-charcoal)', textTransform: 'uppercase', fontWeight: 500 }}>Founded</span>
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-ink)' }}>{company.founded}</span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-charcoal)', textTransform: 'uppercase', fontWeight: 500 }}>Employees</span>
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-ink)' }}>{formatSwissNumber(company.employees)}</span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-charcoal)', textTransform: 'uppercase', fontWeight: 500 }}>Revenue</span>
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-ink)' }}>{company.revenue_band}</span>
        </div>
      </div>

      {/* Zefix Field Layout: Firmendaten */}
      <div>
        <span 
          className="caps-label" 
          style={{ 
            fontSize: '11px', 
            fontWeight: 600, 
            display: 'block', 
            marginBottom: '12px' 
          }}
        >
          Firmendaten
        </span>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
          <div style={{ display: 'flex', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
            <span style={{ width: '120px', color: 'var(--text-charcoal)', fontWeight: 500 }}>📍 Standort</span>
            <span style={{ color: 'var(--text-ink)', fontWeight: 600 }}>Canton {company.canton}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
            <span style={{ width: '120px', color: 'var(--text-charcoal)', fontWeight: 500 }}>📅 Gründung</span>
            <span style={{ color: 'var(--text-ink)', fontWeight: 600 }}>{company.founded}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
            <span style={{ width: '120px', color: 'var(--text-charcoal)', fontWeight: 500 }}>👥 Mitarbeiter</span>
            <span style={{ color: 'var(--text-ink)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatSwissNumber(company.employees)}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
            <span style={{ width: '120px', color: 'var(--text-charcoal)', fontWeight: 500 }}>🏭 Branche</span>
            <span style={{ color: 'var(--text-ink)', fontWeight: 600 }}>{company.industry}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
            <span style={{ width: '120px', color: 'var(--text-charcoal)', fontWeight: 500 }}>💰 Umsatz</span>
            <span style={{ color: 'var(--text-ink)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{company.revenue_band}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
            <span style={{ width: '120px', color: 'var(--text-charcoal)', fontWeight: 500 }}>🌐 Sprachen</span>
            <span style={{ color: 'var(--text-ink)', fontWeight: 600 }}>DE, FR, IT, EN</span>
          </div>
        </div>
      </div>

      {/* Badges and Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span 
            className="badge" 
            style={{ 
              backgroundColor: 'rgba(74, 103, 65, 0.1)', 
              color: 'var(--accent-green)', 
              border: '0.5px solid var(--accent-green)',
              fontSize: '11px',
              padding: '4px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textTransform: 'none',
              letterSpacing: 'normal'
            }}
          >
            <FileCode size={12} />
            Structured Data ✓
          </span>
        </div>

        {/* Buttons: Website, LinkedIn, Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <a 
            href={company.website} 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-gold-fill"
            style={{ display: 'flex', gap: '8px', fontSize: '13px', padding: '10px 16px', minHeight: '40px', width: '100%' }}
          >
            <Globe size={14} />
            <span>Website ↗</span>
          </a>
          
          <a 
            href={company.linkedin} 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-gold-outline"
            style={{ display: 'flex', gap: '8px', fontSize: '13px', padding: '10px 16px', minHeight: '40px', width: '100%' }}
          >
            <Link size={14} />
            <span>LinkedIn ↗</span>
          </a>

          <button 
            className="btn"
            style={{ 
              backgroundColor: 'var(--surface-warm)', 
              color: 'var(--text-ink)',
              border: '0.5px solid var(--light-border)',
              display: 'flex', 
              gap: '8px', 
              fontSize: '13px', 
              padding: '10px 16px', 
              minHeight: '40px', 
              width: '100%',
              cursor: 'pointer' 
            }}
            onClick={() => alert(`Kontakt mit ${company.name} wird initiiert. Ein Verifizierungscode wurde an ${company.contact_email} gesendet.`)}
          >
            <Mail size={14} />
            <span>Kontakt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
