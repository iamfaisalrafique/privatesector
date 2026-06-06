import React from 'react';
import { Calendar, Users, BarChart3 } from 'lucide-react';

export default function CompanyCard({ company, onClick }) {
  const logoInitial = company.name ? company.name.charAt(0) : 'C';

  const formatSwissNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") : '0';
  };

  return (
    <div 
      className="company-card" 
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid var(--light-border)',
        borderTop: company.premium === 1 ? '3px solid var(--primary-gold)' : '0.5px solid var(--light-border)'
      }}
    >
      {company.premium === 1 && (
        <div className="premium-ribbon">Premium</div>
      )}

      {/* Top Details */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-start' }}>
        {/* Company Logo placeholder */}
        <div 
          style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: company.logo_bg || 'var(--surface-warm)',
            border: '0.5px solid var(--light-border)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: '"Playfair Display", Georgia, serif',
            flexShrink: 0
          }}
        >
          {logoInitial}
        </div>

        <div style={{ overflow: 'hidden', flex: 1 }}>
          <h3 
            style={{ 
              fontSize: '16px', 
              fontFamily: '"Playfair Display", Georgia, serif', 
              fontWeight: 700, 
              color: 'var(--text-ink)',
              marginBottom: '6px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {company.name}
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
            <span className="badge badge-canton">{company.canton}</span>
            <span className="badge badge-industry">{company.industry}</span>
            {company.verified === 1 && (
              <span className="badge badge-verified" style={{ fontSize: '9px', padding: '2px 6px' }}>✓ Verified</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p 
        style={{ 
          fontSize: '13px', 
          color: 'var(--text-charcoal)', 
          lineHeight: 1.5, 
          fontFamily: 'Inter, sans-serif',
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {company.description}
      </p>

      {/* Info Row */}
      <div 
        style={{ 
          marginTop: 'auto',
          display: 'flex', 
          justifyContent: 'space-between', 
          borderTop: '0.5px solid var(--light-border)', 
          paddingTop: '12px',
          fontSize: '11px',
          color: 'var(--text-charcoal)',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={12} style={{ color: 'var(--primary-gold)' }} />
          <span>Gegr. {company.founded}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users size={12} style={{ color: 'var(--primary-gold)' }} />
          <span className="mono-data">{formatSwissNumber(company.employees)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <BarChart3 size={12} style={{ color: 'var(--primary-gold)' }} />
          <span className="mono-data">{company.revenue_band}</span>
        </div>
      </div>

      {/* View profile CTA link */}
      <div style={{ marginTop: '12px', textAlign: 'right' }}>
        <span style={{ color: 'var(--primary-gold)', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
          Profile ansehen →
        </span>
      </div>
    </div>
  );
}
