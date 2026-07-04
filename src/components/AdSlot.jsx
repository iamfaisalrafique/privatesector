import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AdSlot({ position, adData, adminPreview = false }) {
  const { t } = useLanguage();
  const [ad, setAd] = useState(adData || null);
  const [loading, setLoading] = useState(!adData);
  const [consentGranted, setConsentGranted] = useState(
    localStorage.getItem('privatesector_cookie_consent') === 'true'
  );

  // Monitor cookie consent changes in localStorage
  useEffect(() => {
    const checkConsent = () => {
      const current = localStorage.getItem('privatesector_cookie_consent') === 'true';
      if (current !== consentGranted) {
        setConsentGranted(current);
      }
    };
    const interval = setInterval(checkConsent, 500);
    window.addEventListener('storage', checkConsent);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkConsent);
    };
  }, [consentGranted]);

  // Fetch ad data from API if not provided via props and consent is granted
  useEffect(() => {
    if (adData) {
      setAd(adData);
      setLoading(false);
      return;
    }

    if (!consentGranted) {
      setAd(null);
      setLoading(false);
      return;
    }

    async function fetchAd() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/ads');
        if (res.ok) {
          const list = await res.json();
          // Map descriptive position names to target zones
          let targetPosition = position;
          if (position === 'leaderboard') targetPosition = 'A';
          if (position === 'sidebar') targetPosition = 'C';
          if (position === 'spotlight') targetPosition = 'F';
          if (position === 'native') targetPosition = 'E';

          const matched = list.find(
            a => (a.position === targetPosition || a.position === position) && a.status === 'active'
          );
          if (matched) {
            setAd(matched);
            if (!adminPreview) {
              fetch(`/api/admin/ads/${matched.id}/impression`, { method: 'POST' });
            }
          } else {
            setAd(null);
          }
        }
      } catch (e) {
        console.error('Failed to load ad slot for', position, e);
      } finally {
        setLoading(false);
      }
    }
    fetchAd();
  }, [position, adData, adminPreview, consentGranted]);

  const handleAdClick = () => {
    if (ad && ad.id && !adminPreview) {
      fetch(`/api/admin/ads/${ad.id}/click`, { method: 'POST' });
    }
  };

  if (loading) {
    return <div style={{ height: '40px', backgroundColor: 'transparent' }} />;
  }

  // Determine Zone Letter and Labels
  let zoneLetter = 'A';
  let zoneDesc = 'Leaderboard';
  let width = '100%';
  let height = '90px';

  if (position === 'A' || position === 'leaderboard') {
    zoneLetter = 'A';
    zoneDesc = 'Leaderboard';
    width = '100%';
    height = '90px';
  } else if (position === 'B') {
    zoneLetter = 'B';
    zoneDesc = 'Leaderboard 2';
    width = '100%';
    height = '90px';
  } else if (position === 'C' || position === 'sidebar') {
    zoneLetter = 'C';
    zoneDesc = 'Rectangle';
    width = '300px';
    height = '250px';
  } else if (position === 'D') {
    zoneLetter = 'D';
    zoneDesc = 'Half Page';
    width = '300px';
    height = '600px';
  } else if (position === 'E' || position === 'native') {
    zoneLetter = 'E';
    zoneDesc = 'In-feed Native';
    width = '100%';
    height = 'auto';
  } else if (position === 'F' || position === 'spotlight') {
    zoneLetter = 'F';
    zoneDesc = 'Company Spotlight';
    width = '100%';
    height = 'auto';
  } else if (position === 'G') {
    zoneLetter = 'G';
    zoneDesc = 'Article Native';
    width = '100%';
    height = 'auto';
  } else if (position === 'H') {
    zoneLetter = 'H';
    zoneDesc = 'Mobile Sticky Footer';
    width = '320px';
    height = '50px';
  }

  // Render empty state if consent is not granted OR no active ad is fetched
  const showEmpty = !consentGranted || !ad;

  if (showEmpty) {
    const borderStyle = adminPreview 
      ? '1px dashed var(--primary-red)' // Admin view: dashed gold
      : '1px dashed #E8E0C8'; // Public view: dashed light border

    const labelText = adminPreview 
      ? `${t('Werbung', 'Werbung')} - Zone ${zoneLetter} (${zoneDesc})` 
      : t('Werbung', 'Werbung');

    // Spotlight has a card empty state
    if (zoneLetter === 'F') {
      return (
        <div 
          className="company-card"
          style={{
            border: borderStyle,
            minHeight: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            position: 'relative'
          }}
        >
          <span style={{ position: 'absolute', top: '9px', right: '12px', fontSize: '9px', color: 'var(--text-charcoal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {labelText}
          </span>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-charcoal)', display: 'block', marginBottom: '8px' }}>
              {t('Spotlight-Unternehmen', 'Spotlight-Unternehmen')}
            </span>
            <span style={{ fontSize: '10px', color: '#888' }}>
              {t('Sponsor-Dossier hier platzieren.', 'Sponsor-Dossier hier platzieren.')}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div 
        style={{
          width: width,
          height: height === 'auto' ? '120px' : height,
          border: borderStyle,
          margin: '24px auto',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          boxSizing: 'border-box'
        }}
      >
        <span 
          style={{ 
            position: 'absolute', 
            top: '4px', 
            right: '8px', 
            fontSize: '9px', 
            color: adminPreview ? 'var(--primary-red)' : 'var(--text-charcoal)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            fontWeight: adminPreview ? '600' : 'normal'
          }}
        >
          {labelText}
        </span>
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-charcoal)' }}>
            {zoneDesc} ({width} × {height})
          </span>
          {!consentGranted && (
            <span style={{ display: 'block', fontSize: '9px', color: '#888', marginTop: '2px' }}>
              {t('(Erfordert Cookie-Zustimmung)', '(Erfordert Cookie-Zustimmung)')}
            </span>
          )}
        </div>
      </div>
    );
  }

  // RENDER FILLED AD ZONES (no border shown)
  
  // 1. Leaderboard (Zone A & B) or Mobile sticky banner (Zone H)
  if (zoneLetter === 'A' || zoneLetter === 'B' || zoneLetter === 'H') {
    return (
      <a rel="nofollow noopener noreferrer" 
        href={ad.company_id ? `#/unternehmen/${ad.company_id}` : '#'}
        onClick={handleAdClick}
        style={{ display: 'block', textDecoration: 'none', margin: '24px auto', maxWidth: width }}
      >
        <div 
          style={{ 
            width: '100%', 
            height: height, 
            backgroundColor: '#FFFFFF', 
            backgroundImage: ad.image_url ? `url(${ad.image_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '0.5px solid var(--light-border)',
            position: 'relative'
          }}
        >
          <span style={{ position: 'absolute', top: '4px', right: '8px', fontSize: '8px', color: 'var(--primary-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('Sponsored', 'Sponsored')}</span>
          {!ad.image_url && (
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-ink)' }}>{t(ad.name, ad.name)}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--text-charcoal)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('Click to view profile', 'Click to view profile')}</div>
            </div>
          )}
        </div>
      </a>
    );
  }

  // 2. Rectangle (Zone C & D)
  if (zoneLetter === 'C' || zoneLetter === 'D') {
    return (
      <a rel="nofollow noopener noreferrer" 
        href={ad.company_id ? `#/unternehmen/${ad.company_id}` : '#'}
        onClick={handleAdClick}
        style={{ display: 'block', textDecoration: 'none', margin: '24px auto', width: width }}
      >
        <div 
          style={{ 
            width: width, 
            height: height, 
            backgroundColor: '#FFFFFF', 
            backgroundImage: ad.image_url ? `url(${ad.image_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            border: '0.5px solid var(--light-border)',
            borderRadius: '6px',
            textAlign: 'center',
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
          <span style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '8px', color: 'var(--primary-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('Sponsored Spotlight', 'Sponsored Spotlight')}</span>
          {!ad.image_url && (
            <div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', fontWeight: 600, color: 'var(--text-ink)', marginBottom: '8px' }}>{t(ad.name, ad.name)}</div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '16px', lineHeight: 1.4 }}>{t('Discover our premium verified solutions tailored for Swiss industry leaders.', 'Discover our premium verified solutions tailored for Swiss industry leaders.')}</p>
              <span className="btn btn-gold-fill" style={{ fontSize: '11px', padding: '6px 12px', minHeight: '32px' }}>{t('Visit Profile', 'Visit Profile')}</span>
            </div>
          )}
        </div>
      </a>
    );
  }

  // 3. Company Spotlight Card (Zone F)
  if (zoneLetter === 'F') {
    return (
      <div 
        className="company-card"
        style={{
          border: '0.5px solid var(--primary-gold)',
          borderTop: '3px solid var(--primary-gold)',
          backgroundColor: '#FFFFFF',
          position: 'relative'
        }}
      >
        <div className="premium-ribbon">{t('Featured', 'Featured')}</div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-gold)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1A1A', fontWeight: 700, fontSize: '18px' }}>
            {ad.name ? ad.name.charAt(0) : 'S'}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', color: 'var(--text-ink)', fontWeight: 700 }}>{t(ad.name, ad.name)}</h3>
            <span className="badge badge-verified" style={{ marginTop: '4px', fontSize: '9px' }}>{t('✓ Verified Partner', '✓ Verified Partner')}</span>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.6, marginBottom: '16px' }}>
          {t('Learn more about the leading B2B financial and reinsurance structures operating out of Zurich.', 'Learn more about the leading B2B financial and reinsurance structures operating out of Zurich.')}
        </p>
        <div style={{ marginTop: 'auto' }}>
          <a rel="nofollow noopener noreferrer" 
            href={ad.company_id ? `#/unternehmen/${ad.company_id}` : '#'}
            onClick={handleAdClick}
            className="btn btn-gold-fill"
            style={{ width: '100%', fontSize: '11px', padding: '8px 12px', minHeight: '36px' }}
          >
            {t('Explore Corporate Dossier', 'Explore Corporate Dossier')}
          </a>
        </div>
      </div>
    );
  }

  // 4. Native In-Feed / Article Native (Zone E & G)
  if (zoneLetter === 'E' || zoneLetter === 'G') {
    return (
      <div 
        style={{
          backgroundColor: 'var(--surface-warm)',
          padding: '24px',
          margin: '24px 0',
          position: 'relative',
          border: '0.5px solid var(--light-border)',
          borderLeft: '4px solid var(--primary-gold)'
        }}
      >
        <span style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-gold)', fontWeight: 600 }}>{t('Sponsored Content', 'Sponsored Content')}</span>
        <h4 style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', marginBottom: '8px', color: 'var(--text-ink)', fontWeight: 700 }}>{t("How Switzerland's Private Sector Navigates Evolving Global Compliance Standards", "How Switzerland's Private Sector Navigates Evolving Global Compliance Standards")}</h4>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.6, marginBottom: '12px' }}>
          {t('Sponsored by', 'Sponsored by')} {t(ad.name || 'Google B2B Services', ad.name || 'Google B2B Services')}. {t("Learn about modern cloud compliance infrastructures designed to align with FINMA's latest technical directives.", "Learn about modern cloud compliance infrastructures designed to align with FINMA's latest technical directives.")}
        </p>
        <a rel="nofollow noopener noreferrer" 
          href={ad.company_id ? `#/unternehmen/${ad.company_id}` : '#'} 
          style={{ color: 'var(--primary-gold)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
          onClick={handleAdClick}
        >
          {t('Read the Whitepaper ↗', 'Read the Whitepaper ↗')}
        </a>
      </div>
    );
  }

  return null;
}
