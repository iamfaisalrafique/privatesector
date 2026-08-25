import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Building2, 
  Rocket, 
  BarChart3, 
  Target, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Zap, 
  Edit3, 
  TrendingUp, 
  Shield, 
  LogOut, 
  User 
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import logo from '../../assets/logo_highres.png';

// Pixel-perfect SVG Flags for crisp rendering on all platforms
export const SwissFlag = ({ size = 16, style = {} }) => (
  <svg 
    width={size} 
    height={Math.round(size * 0.75)} 
    viewBox="0 0 32 24" 
    style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    <rect width="32" height="24" fill="#D52B1E" />
    <rect x="13" y="4" width="6" height="16" fill="#FFFFFF" />
    <rect x="7" y="9" width="18" height="6" fill="#FFFFFF" />
  </svg>
);

export const USAFlag = ({ size = 16, style = {} }) => (
  <svg 
    width={size} 
    height={Math.round(size * 0.75)} 
    viewBox="0 0 32 24" 
    style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    <rect width="32" height="24" fill="#B22234" />
    <rect y="3.69" width="32" height="1.85" fill="#FFFFFF" />
    <rect y="7.38" width="32" height="1.85" fill="#FFFFFF" />
    <rect y="11.08" width="32" height="1.85" fill="#FFFFFF" />
    <rect y="14.77" width="32" height="1.85" fill="#FFFFFF" />
    <rect y="18.46" width="32" height="1.85" fill="#FFFFFF" />
    <rect y="22.15" width="32" height="1.85" fill="#FFFFFF" />
    <rect width="13" height="13" fill="#3C3B6E" />
    <circle cx="3.5" cy="3.5" r="1" fill="#FFFFFF" />
    <circle cx="9.5" cy="3.5" r="1" fill="#FFFFFF" />
    <circle cx="6.5" cy="6.5" r="1" fill="#FFFFFF" />
    <circle cx="3.5" cy="9.5" r="1" fill="#FFFFFF" />
    <circle cx="9.5" cy="9.5" r="1" fill="#FFFFFF" />
  </svg>
);

export default function Navbar({ currentPath, navigate, currentUser, onLogout }) {
  const { t, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'open' | null
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);
  const [currentTime, setCurrentTime] = useState('08:30 AM CET');
  const megaMenuTimeoutRef = useRef(null);

  const defaultTicker = [
    { flag: 'swiss', label: 'SMI', value: '12,123.42', change: '+0.45%', positive: true },
    { flag: 'usa', label: 'S&P 500', value: '5,344.16', change: '-0.31%', positive: false },
    { label: 'NASDAQ', value: '16,745.30', change: '-0.22%', positive: false },
    { label: 'USD/CHF', value: '0.8742', change: '+0.21%', positive: true },
    { label: 'EUR/CHF', value: '0.9431', change: '+0.18%', positive: true },
    { label: 'GOLD', value: '$2,345.10', change: '+0.35%', positive: true },
    { label: 'BRENT', value: '$82.56', change: '-0.12%', positive: false },
    { label: 'U.S. 10Y', value: '4.25%', change: '+0.03%', positive: true }
  ];

  const [marketTickerData, setMarketTickerData] = useState(defaultTicker);

  useEffect(() => {
    // Dynamic live Zurich/CET time formatter
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Zurich',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).format(now);
        setCurrentTime(`${formatted} CET`);
      } catch (e) {
        setCurrentTime('08:30 AM CET');
      }
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 60000);

    // Live Real-Time Financial API Fetcher
    const fetchLiveMarketData = async () => {
      try {
        const res = await fetch('/api/markets/ticker');
        if (res.ok) {
          const liveData = await res.json();
          if (Array.isArray(liveData) && liveData.length > 0) {
            setMarketTickerData(liveData);
          }
        }
      } catch (err) {
        // Keeps graceful fallback
      }
    };

    fetchLiveMarketData();
    const marketInterval = setInterval(fetchLiveMarketData, 60000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(marketInterval);
    };
  }, []);

  const sectionsData = [
    {
      id: 'home',
      label: 'HOME',
      icon: Home,
      flag: null,
      path: '/',
      subtitle: "Today's top intelligence",
      items: [
        { label: 'Top Story', path: '/news', icon: FileText },
        { label: 'Latest Intelligence', path: '/news', icon: Search },
        { label: 'Breaking News', path: '/news', icon: Zap },
        { label: "Editor's Picks", path: '/blogs', icon: Edit3 },
        { label: 'Most Read', path: '/ranking', icon: TrendingUp }
      ]
    },
    {
      id: 'switzerland',
      label: 'SWITZERLAND',
      flag: 'swiss',
      path: '/trade-policy-pulse',
      subtitle: 'Swiss business & economy',
      items: [
        { label: 'Swiss Economy', path: '/news' },
        { label: 'Swiss Companies', path: '/unternehmen' },
        { label: 'Swiss Industries', path: '/unternehmen' },
        { label: 'Trade & Policy', path: '/trade-policy-pulse' },
        { label: 'Swiss Startups', path: '/statistiken' },
        { label: 'Regional Focus', path: '/socal-gateway' }
      ]
    },
    {
      id: 'usa',
      label: 'USA',
      flag: 'usa',
      path: '/socal-gateway',
      subtitle: 'U.S. business & policy',
      items: [
        { label: 'U.S. Economy', path: '/news' },
        { label: 'Federal News', path: '/trade-policy-pulse' },
        { label: 'States & Cities', path: '/socal-gateway' },
        { label: 'U.S. Companies', path: '/unternehmen?country=usa' },
        { label: 'Trade & Policy', path: '/trade-policy-pulse' },
        { label: 'Regional Focus', path: '/translatic-transcript' }
      ]
    },
    {
      id: 'companies',
      label: 'COMPANIES',
      icon: Building2,
      flag: null,
      path: '/unternehmen',
      subtitle: 'Company intelligence',
      items: [
        { label: 'Company Intelligence', path: '/unternehmen' },
        { label: 'Swiss Companies', path: '/unternehmen' },
        { label: 'U.S. Companies', path: '/unternehmen?country=usa' },
        { label: 'Industries', path: '/unternehmen' },
        { label: 'Rankings', path: '/cross-border-ranking' },
        { label: 'Company Directory', path: '/unternehmen' }
      ]
    },
    {
      id: 'startups',
      label: 'STARTUPS',
      icon: Rocket,
      flag: null,
      path: '/statistiken',
      subtitle: 'Innovation on both sides',
      items: [
        { label: 'U.S. Startup Radar', path: '/news' },
        { label: 'Swiss Startup Radar', path: '/news' },
        { label: 'Startup of the Week', path: '/interviews' },
        { label: 'Top Founders', path: '/interviews' },
        { label: 'Funding & VC', path: '/statistiken' },
        { label: 'Startup Directory', path: '/unternehmen' }
      ]
    },
    {
      id: 'markets',
      label: 'MARKETS',
      icon: BarChart3,
      flag: null,
      path: '/statistiken',
      subtitle: 'Markets & financial insights',
      items: [
        { label: 'Markets Today', path: '/statistiken' },
        { label: 'Investment', path: '/ranking' },
        { label: 'Banking & Finance', path: '/news' },
        { label: 'Technology', path: '/news' },
        { label: 'Life Sciences', path: '/news' },
        { label: 'Commodities', path: '/statistiken' }
      ]
    },
    {
      id: 'opportunities',
      label: 'OPPORTUNITIES',
      icon: Target,
      flag: null,
      path: '/cross-border-ranking',
      subtitle: 'Where opportunity meets action',
      items: [
        { label: 'Swiss → U.S.', path: '/socal-gateway' },
        { label: 'U.S. → Switzerland', path: '/translatic-transcript' },
        { label: 'Investment Opportunities', path: '/cross-border-ranking' },
        { label: 'Partnerships', path: '/karriere' },
        { label: 'Market Expansion', path: '/trade-policy-pulse' },
        { label: 'U.S. States & Cities', path: '/socal-gateway' }
      ]
    }
  ];

  const handleMouseEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setActiveMegaMenu(true);
  };

  const handleMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(false);
    }, 250);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/unternehmen?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="site-header-container" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#FFFFFF' }}>
      
      {/* 1. TOP BAR: Dark Live Market Update Bar */}
      <div 
        className="top-market-bar"
        style={{
          backgroundColor: '#06101E',
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: 500,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0 16px',
          height: '34px',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div 
          style={{
            maxWidth: '1600px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            minWidth: 'max-content'
          }}
        >
          {/* Market Update Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ 
              backgroundColor: '#0E1F38', 
              color: '#93C5FD', 
              padding: '2px 8px', 
              borderRadius: '3px', 
              fontWeight: 700, 
              letterSpacing: '0.05em',
              fontSize: '10px',
              border: '1px solid rgba(147, 197, 253, 0.2)'
            }}>
              MARKET UPDATE
            </span>
            <span style={{ color: '#9CA3AF', fontSize: '11px' }}>
              {currentTime}
            </span>
          </div>

          {/* Tickers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'nowrap' }}>
            {marketTickerData.map((item, idx) => (
              <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                {item.flag === 'swiss' && <SwissFlag size={14} />}
                {item.flag === 'usa' && <USAFlag size={14} />}
                <span style={{ color: '#E5E7EB', fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: '#9CA3AF' }}>{item.value}</span>
                <span style={{ 
                  color: item.positive ? '#10B981' : '#EF4444', 
                  fontWeight: 600,
                  fontSize: '11px' 
                }}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR: Desktop & Mobile Header */}
      <nav 
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          position: 'relative'
        }}
      >
        <div 
          style={{
            maxWidth: '1600px',
            width: '100%',
            margin: '0 auto',
            padding: '0 24px',
            height: '76px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          {/* Mobile Hamburger (Left on mobile) */}
          <div className="mobile-only" style={{ display: 'none' }}>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#111827'
              }}
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

          {/* Brand Logo */}
          <div 
            onClick={() => {
              navigate('/');
              setActiveMegaMenu(false);
              setMobileMenuOpen(false);
            }} 
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              userSelect: 'none'
            }}
          >
            <img 
              src={logo} 
              alt="PrivateSector" 
              style={{ 
                height: '46px', 
                width: 'auto', 
                objectFit: 'contain', 
                display: 'block' 
              }} 
            />
          </div>

          {/* Desktop Navigation Links */}
          <div 
            className="desktop-only"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              height: '76px'
            }}
          >
            {sectionsData.map((sec) => {
              const IconComp = sec.icon;
              const isSecActive = currentPath === sec.path || (sec.id === 'home' && currentPath === '/');
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    navigate(sec.path);
                    setActiveMegaMenu(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 12px',
                    height: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: isSecActive ? 700 : 600,
                    color: isSecActive ? '#0A0A0A' : '#374151',
                    cursor: 'pointer',
                    position: 'relative',
                    borderBottom: isSecActive ? '3px solid #D52B1E' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSecActive) e.currentTarget.style.color = '#D52B1E';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSecActive) e.currentTarget.style.color = '#374151';
                  }}
                >
                  {sec.flag === 'swiss' && <SwissFlag size={15} />}
                  {sec.flag === 'usa' && <USAFlag size={15} />}
                  {IconComp && <IconComp size={16} style={{ color: isSecActive ? '#D52B1E' : '#6B7280' }} />}
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Deck: Search, Language, Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Search Trigger Button (Circular) */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D52B1E';
                e.currentTarget.style.color = '#D52B1E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.color = '#374151';
              }}
            >
              <Search size={17} />
            </button>

            {/* Language Switcher (Desktop) */}
            <div className="desktop-only">
              <LanguageSwitcher />
            </div>

            {/* Auth / Admin Deck (Desktop) */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentUser ? (
                <>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      title="Admin Dashboard"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: '#0A0A0A',
                        color: '#FFFDF7',
                        border: '1px solid rgba(213, 43, 30, 0.5)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <Shield size={14} style={{ color: '#D52B1E' }} /> Admin
                    </button>
                  )}
                  <button
                    onClick={onLogout}
                    title={`Logged in as ${currentUser.email}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#D52B1E',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={14} /> {t('logout', 'Logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#0A0A0A',
                    color: '#FFFDF7',
                    border: '1px solid rgba(213, 43, 30, 0.4)',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <User size={14} /> {t('login', 'Login')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. DESKTOP MEGA MENU DROPDOWN (7 Columns) */}
        {activeMegaMenu && (
          <div 
            className="desktop-mega-menu desktop-only"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
              borderBottom: '1px solid #D1D5DB',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
              zIndex: 999,
              padding: '28px 24px 36px 24px',
              animation: 'megaMenuFadeIn 0.2s ease-out'
            }}
          >
            <div 
              style={{
                maxWidth: '1600px',
                width: '100%',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '16px'
              }}
            >
              {sectionsData.map((sec, secIdx) => {
                const SecIcon = sec.icon;
                return (
                  <div 
                    key={sec.id}
                    style={{
                      borderRight: secIdx < sectionsData.length - 1 ? '1px solid #F3F4F6' : 'none',
                      paddingRight: '14px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Column Header */}
                    <div 
                      onClick={() => {
                        navigate(sec.path);
                        setActiveMegaMenu(false);
                      }}
                      style={{ cursor: 'pointer', marginBottom: '14px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {sec.flag === 'swiss' && <SwissFlag size={16} />}
                        {sec.flag === 'usa' && <USAFlag size={16} />}
                        {SecIcon && <SecIcon size={16} style={{ color: '#D52B1E' }} />}
                        <span style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontSize: '13px', 
                          fontWeight: 700, 
                          color: '#111827',
                          letterSpacing: '0.02em'
                        }}>
                          {sec.label}
                        </span>
                      </div>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '11px', 
                        color: '#2563EB', 
                        fontWeight: 500,
                        lineHeight: 1.3
                      }}>
                        {sec.subtitle}
                      </p>
                    </div>

                    {/* Links List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {sec.items.map((item, itemIdx) => {
                        const ItemIcon = item.icon;
                        return (
                          <a
                            key={itemIdx}
                            href={`#${item.path}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(item.path);
                              setActiveMegaMenu(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              color: '#4B5563',
                              textDecoration: 'none',
                              fontSize: '12.5px',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 500,
                              padding: '4px 0',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#D52B1E';
                              e.currentTarget.style.transform = 'translateX(2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#4B5563';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {ItemIcon && <ItemIcon size={14} style={{ color: '#9CA3AF' }} />}
                              {item.label}
                            </span>
                            <ChevronRight size={13} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* 4. SEARCH OVERLAY BAR */}
      {searchOpen && (
        <div 
          style={{
            backgroundColor: '#0F172A',
            borderBottom: '1px solid #1E293B',
            padding: '14px 24px',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 998,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
          }}
        >
          <form 
            onSubmit={handleSearchSubmit} 
            style={{ 
              maxWidth: '720px', 
              margin: '0 auto', 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'center' 
            }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="text" 
                placeholder={t('search_placeholder', 'Search intelligence, companies, executive interviews...')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 14px 10px 42px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button 
              type="submit" 
              style={{
                backgroundColor: '#D52B1E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                whiteSpace: 'nowrap'
              }}
            >
              {t('search', 'Search')}
            </button>
            <button 
              type="button" 
              onClick={() => setSearchOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <X size={20} />
            </button>
          </form>
        </div>
      )}

      {/* 5. MOBILE EXPANDED DRAWER MENU */}
      {mobileMenuOpen && (
        <div 
          className="mobile-drawer-overlay mobile-only"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}
        >
          {/* Mobile Drawer Header */}
          <div 
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #E5E7EB'
            }}
          >
            <button 
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                background: 'none',
                border: 'none',
                color: '#111827',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <X size={26} />
            </button>

            {/* Centered Brand in Mobile Drawer */}
            <div 
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
            >
              <img 
                src={logo} 
                alt="PrivateSector" 
                style={{ 
                  height: '38px', 
                  width: 'auto', 
                  objectFit: 'contain', 
                  display: 'block' 
                }} 
              />
            </div>

            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              aria-label="Search"
              style={{
                background: 'none',
                border: 'none',
                color: '#111827',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <Search size={22} />
            </button>
          </div>

          {/* Mobile Clean Focus Note */}
          <div style={{ backgroundColor: '#F0F9FF', borderBottom: '1px solid #E0F2FE', padding: '12px 20px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#0369A1' }}>
              Clean. Simple. Focused.
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#0284C7' }}>
              7 main sections that power our Switzerland ↔ U.S. intelligence.
            </p>
          </div>

          {/* Mobile Navigation List with Accordions */}
          <div style={{ padding: '12px 16px', flex: 1 }}>
            {sectionsData.map((sec) => {
              const SecIcon = sec.icon;
              const isExpanded = mobileExpandedSection === sec.id;

              return (
                <div key={sec.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      if (sec.id === 'home') {
                        navigate('/');
                        setMobileMenuOpen(false);
                      } else {
                        setMobileExpandedSection(isExpanded ? null : sec.id);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {sec.flag === 'swiss' && <SwissFlag size={18} />}
                      {sec.flag === 'usa' && <USAFlag size={18} />}
                      {SecIcon && <SecIcon size={18} style={{ color: '#D52B1E' }} />}
                      <span style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontSize: '15px', 
                        fontWeight: 600, 
                        color: '#111827' 
                      }}>
                        {sec.label}
                      </span>
                    </div>
                    {sec.id !== 'home' && (
                      <ChevronDown 
                        size={18} 
                        style={{ 
                          color: '#9CA3AF', 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }} 
                      />
                    )}
                  </div>

                  {/* Sub-items accordion */}
                  {isExpanded && (
                    <div style={{ backgroundColor: '#F9FAFB', padding: '8px 16px 14px 40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ margin: '4px 0 8px 0', fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>
                        {sec.subtitle}
                      </p>
                      {sec.items.map((item, idx) => (
                        <a
                          key={idx}
                          href={`#${item.path}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(item.path);
                            setMobileMenuOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: '#4B5563',
                            textDecoration: 'none',
                            fontSize: '13px',
                            padding: '6px 0',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        >
                          <span>{item.label}</span>
                          <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Drawer Footer: Language & Auth */}
          <div style={{ padding: '20px', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Language</span>
              <LanguageSwitcher />
            </div>

            {currentUser ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFDF7',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#D52B1E',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFDF7',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Login / Member Access
              </button>
            )}
          </div>
        </div>
      )}

      {/* Global CSS Styles for Responsiveness and Animations */}
      <style>{`
        @keyframes megaMenuFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .top-market-bar::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 1025px) {
          .desktop-only {
            display: flex !important;
          }
          .mobile-only {
            display: none !important;
          }
        }

        @media (max-width: 1024px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
