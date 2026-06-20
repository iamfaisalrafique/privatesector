import React from 'react';
import { Calendar, Users, BarChart3 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CompanyCard({ company, onClick }) {
  const { t } = useLanguage();
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
        <div className="premium-ribbon">{t('Premium', 'Premium')}</div>
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
            <span className="badge badge-industry">{t(company.industry, company.industry)}</span>
            {company.verified === 1 && (
              <span className="badge badge-verified" style={{ fontSize: '9px', padding: '2px 6px' }}>{t('✓ Verified', '✓ Verified')}</span>
            )}
            {company.esg_rating >= 80 && (
              <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', border: '0.5px solid rgba(46, 125, 50, 0.3)' }}>{t('🍃 Eco-Leader', '🍃 Eco-Leader')}</span>
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
        {t(company.description, company.description)}
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
          <span>{t('card_founded', 'Est.')} {company.founded}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users size={12} style={{ color: 'var(--primary-gold)' }} />
          <span className="mono-data">{formatSwissNumber(company.employees)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <BarChart3 size={12} style={{ color: 'var(--primary-gold)' }} />
          <span className="mono-data">{t(company.revenue_band, company.revenue_band)}</span>
        </div>
      </div>

      {/* View profile CTA link */}
      <div style={{ marginTop: '12px', textAlign: 'right' }}>
        <span style={{ color: 'var(--primary-gold)', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
          {t('card_view_profile', 'View Profile →')}
        </span>
      </div>
    </div>
  );
}
