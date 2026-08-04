import React, { useState } from 'react';
import { 
  Building2, 
  Newspaper, 
  TrendingUp, 
  LayoutDashboard, 
  Home, 
  Search, 
  Menu, 
  X,
  Mic,
  MessageSquare,
  GraduationCap,
  ChevronDown,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo_highres.png';

export default function Navbar({ currentPath, navigate, currentUser, onLogout }) {
  const { t, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  const topNavItems = [
    { label: t('Home', 'Home'), path: '/' },
    { label: t('Translatic Transcript', 'Translatic Transcript'), path: '/translatic-transcript' },
    { label: t('The SoCal Gateway', 'The SoCal Gateway'), path: '/socal-gateway' },
    { label: t('Trade & Policy Pulse', 'Trade & Policy Pulse'), path: '/trade-policy-pulse' },
    { label: t('Cross-Border Ranking', 'Cross-Border Ranking'), path: '/cross-border-ranking' }
  ];

  const resourceItems = [
    { label: t('Unternehmen', 'Unternehmen'), path: '/unternehmen' },
    { label: t('News', 'News'), path: '/news' },
    { label: t('Blog', 'Blog'), path: '/blogs' },
    { label: t('Statistiken', 'Statistiken'), path: '/statistiken' },
    { label: t('Interviews', 'Interviews'), path: '/interviews' },
    { label: t('Podcasts', 'Podcasts'), path: '/podcasts' },
    { label: t('Talent', 'Talent'), path: '/karriere' },
    { label: t('Ranking', 'Ranking'), path: '/ranking' },
    { label: t('About', 'About'), path: '/about' },
    { label: t('Contact', 'Contact'), path: '/contact' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/unternehmen?search=${encodeURIComponent(searchVal)}`);
      setSearchBarOpen(false);
    }
  };

  return (
    <>
      {/* Top Sticky Dark Navbar */}
      <nav 
        style={{
          backgroundColor: '#f3f4f6',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1.5px solid rgba(213, 43, 30, 0.25)',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          padding: '0 24px',
          boxSizing: 'border-box'
        }}
      >
        <div 
          style={{
            maxWidth: '1280px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: isRtl ? 'row-reverse' : 'row'
          }}
        >
          {/* Logo Left */}
          <div 
            onClick={() => navigate('/')} 
            style={{ 
              cursor: 'pointer', 
              display: 'flex',
              alignItems: 'center',
              height: '100px'
            }}
          >
            <img 
              src={logo} 
              alt="privatesector.ch Logo" 
              style={{ 
                height: '70px', 
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </div>

          {/* Nav Links Center */}
          <div 
            className="desktop-only"
            style={{ 
              display: 'flex', 
              gap: '20px', 
              alignItems: 'center',
              flexDirection: isRtl ? 'row-reverse' : 'row'
            }}
          >
            {topNavItems.map((item) => (
              <a
                key={item.path}
                href={`#${item.path}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
                style={{
                  color: currentPath === item.path ? 'var(--primary-red)' : '#4b5563',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </a>
            ))}

            {/* Resources Dropdown Trigger */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setResourcesDropdownOpen(true)}
              onMouseLeave={() => setResourcesDropdownOpen(false)}
            >
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: resourceItems.some(i => currentPath === i.path) ? 'var(--primary-red)' : '#4b5563',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                  margin: 0,
                  lineHeight: 'inherit'
                }}
              >
                <span>{t('Resources', 'Resources')}</span>
                <ChevronDown size={14} />
              </button>

              {resourcesDropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: isRtl ? 'auto' : 0,
                    right: isRtl ? 0 : 'auto',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--light-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '8px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '160px',
                    zIndex: 1000
                  }}
                >
                  {resourceItems.map((item) => (
                    <a
                      key={item.path}
                      href={`#${item.path}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.path);
                        setResourcesDropdownOpen(false);
                      }}
                      style={{
                        padding: '8px 16px',
                        color: currentPath === item.path ? 'var(--primary-red)' : '#4b5563',
                        textDecoration: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#F9F9F9'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions Deck */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
            {/* Search Trigger */}
            <button 
              onClick={() => setSearchBarOpen(!searchBarOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-red)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px'
              }}
            >
              <Search size={18} />
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Auth Actions (Login / Logout / Admin) */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    <Shield size={14} style={{ color: 'var(--primary-red)' }} /> Admin
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
                    backgroundColor: 'var(--primary-red)',
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
              </div>
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

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'none'
              }}
              className="mobile-hamburger"
            >
              {mobileMenuOpen ? <X size={24} style={{ color: 'var(--primary-red)' }} /> : <Menu size={24} style={{ color: 'var(--primary-red)' }} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Search Bar */}
      {searchBarOpen && (
        <div 
          style={{
            backgroundColor: '#0A0A0A',
            borderBottom: '1px solid #2A2A2A',
            padding: '12px 24px',
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            zIndex: 998
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '12px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
            <input 
              type="text" 
              placeholder={t('Search...', 'Search...')} 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="input-field"
              style={{ flex: 1, backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}
              autoFocus
            />
            <button type="submit" className="btn btn-gold-fill" style={{ fontSize: '13px', padding: '8px 16px', minHeight: '44px' }}>
              {t('Search', 'Search')}
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0A0A0A',
            zIndex: 997,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto'
          }}
        >
          {topNavItems.map((item) => (
            <a
              key={item.path}
              href={`#${item.path}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              style={{
                color: '#FFFFFF',
                fontSize: '16px',
                textDecoration: 'none',
                fontFamily: 'Inter, sans-serif',
                padding: '10px 0',
                borderBottom: '0.5px solid #2A2A2A',
                display: 'block',
                textAlign: isRtl ? 'right' : 'left'
              }}
            >
              {item.label}
            </a>
          ))}

          {/* Resources Accordion (Mobile) */}
          <div>
            <button
              onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
              style={{
                background: 'none',
                border: 'none',
                width: '100%',
                color: '#FFFFFF',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                padding: '10px 0',
                borderBottom: '0.5px solid #2A2A2A',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span>{t('Resources', 'Resources')}</span>
              <ChevronDown size={16} style={{ transform: mobileResourcesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            {mobileResourcesOpen && (
              <div style={{ paddingLeft: '16px', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {resourceItems.map((item) => (
                  <a
                    key={item.path}
                    href={`#${item.path}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      color: '#CCC',
                      fontSize: '14px',
                      textDecoration: 'none',
                      fontFamily: 'Inter, sans-serif',
                      padding: '8px 0',
                      display: 'block',
                      textAlign: isRtl ? 'right' : 'left'
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>


        </div>
      )}

      {/* CSS overrides for mobile bottom bar */}
      <style>{`
        @media (min-width: 769px) {
          .mobile-hamburger { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-hamburger { display: flex !important; }
          .mobile-bottom-nav { 
            display: flex !important; 
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 56px;
            background-color: #0A0A0A;
            border-top: 1px solid #2A2A2A;
            z-index: 996;
            align-items: center;
            justify-content: space-around;
            padding: 0 8px;
            box-sizing: border-box;
          }
        }
      `}</style>

      {/* Sticky Bottom Nav Bar (Mobile Only) */}
      <div className="mobile-bottom-nav">
        <button 
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: currentPath === '/' ? 'var(--primary-red)' : '#888888', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', gap: '3px', cursor: 'pointer' }}
        >
          <Home size={18} />
          <span>{t('Home', 'Home')}</span>
        </button>
        <button 
          onClick={() => navigate('/unternehmen')}
          style={{ background: 'none', border: 'none', color: currentPath === '/unternehmen' ? 'var(--primary-red)' : '#888888', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', gap: '3px', cursor: 'pointer' }}
        >
          <Building2 size={18} />
          <span>{t('Directory', 'Directory')}</span>
        </button>
        <button 
          onClick={() => navigate('/news')}
          style={{ background: 'none', border: 'none', color: currentPath === '/news' ? 'var(--primary-red)' : '#888888', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', gap: '3px', cursor: 'pointer' }}
        >
          <Newspaper size={18} />
          <span>{t('News', 'News')}</span>
        </button>
        <button 
          onClick={() => navigate('/interviews')}
          style={{ background: 'none', border: 'none', color: currentPath === '/interviews' ? 'var(--primary-red)' : '#888888', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', gap: '3px', cursor: 'pointer' }}
        >
          <MessageSquare size={18} />
          <span>{t('Interviews', 'Interviews')}</span>
        </button>
        <button 
          onClick={() => navigate('/karriere')}
          style={{ background: 'none', border: 'none', color: currentPath === '/karriere' ? 'var(--primary-red)' : '#888888', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', gap: '3px', cursor: 'pointer' }}
        >
          <GraduationCap size={18} />
          <span>{t('Talent', 'Talent')}</span>
        </button>
      </div>
    </>
  );
}
