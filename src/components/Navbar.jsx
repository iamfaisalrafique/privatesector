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
  MessageSquare
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ currentPath, navigate }) {
  const { t, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const navItems = [
    { label: t('nav_companies', 'Unternehmen'), path: '/unternehmen' },
    { label: t('nav_news', 'News'), path: '/news' },
    { label: t('nav_statistics', 'Statistiken'), path: '/statistiken' },
    { label: t('nav_interviews', 'Interviews'), path: '/interviews' },
    { label: t('nav_podcasts', 'Podcasts'), path: '/podcasts' },
    { label: t('nav_careers', 'Karriere'), path: '/karriere' }
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
          backgroundColor: '#0A0A0A',
          height: '64px',
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
              fontFamily: '"Playfair Display", Georgia, serif', 
              fontSize: '22px', 
              fontWeight: 700, 
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'baseline'
            }}
          >
            <span style={{ color: 'var(--primary-red)' }}>privatesector</span>
            <span style={{ color: '#8B0000', fontSize: '18px', fontWeight: 800 }}>.ch</span>
          </div>

          {/* Nav Links Center */}
          <div 
            className="desktop-only"
            style={{ 
              display: 'flex', 
              gap: '28px', 
              alignItems: 'center',
              flexDirection: isRtl ? 'row-reverse' : 'row'
            }}
          >
            {navItems.map((item) => (
              <a
                key={item.path}
                href={`#${item.path}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
                style={{
                  color: currentPath === item.path ? 'var(--primary-red)' : '#888888',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {item.label}
              </a>
            ))}
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

            {/* Admin Quick Entry */}
            <button
              onClick={() => navigate('/admin')}
              style={{
                background: 'none',
                border: '0.5px solid var(--primary-red)',
                color: 'var(--primary-red)',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
              }}
              className="desktop-only"
            >
              {t('Admin', 'Admin')}
            </button>

            {/* Login & Register (Desktop Only) */}
            <button 
              className="desktop-only" 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#FFFFFF', 
                cursor: 'pointer', 
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                padding: '6px 12px'
              }}
              onClick={() => navigate('/login')}
            >
              {t('nav_login', 'Login')}
            </button>
            
            <button 
              className="btn btn-gold-fill desktop-only" 
              style={{ padding: '6px 14px', fontSize: '12px', minHeight: '36px' }}
              onClick={() => navigate('/register')}
            >
              {t('nav_register', 'Register')}
            </button>

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
              placeholder={t('search_placeholder_short', 'Search...')} 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="input-field"
              style={{ flex: 1, backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}
              autoFocus
            />
            <button type="submit" className="btn btn-gold-fill" style={{ fontSize: '13px', padding: '8px 16px', minHeight: '44px' }}>
              {t('search_button', 'Search')}
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
            gap: '16px'
          }}
        >
          {navItems.map((item) => (
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
                fontSize: '18px',
                textDecoration: 'none',
                fontFamily: '"Playfair Display", serif',
                padding: '12px 0',
                borderBottom: '0.5px solid #2A2A2A',
                display: 'block',
                textAlign: isRtl ? 'right' : 'left'
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#/admin"
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin');
              setMobileMenuOpen(false);
            }}
            style={{
              color: 'var(--primary-red)',
              fontSize: '18px',
              textDecoration: 'none',
              fontFamily: '"Playfair Display", serif',
              padding: '12px 0',
              borderBottom: '0.5px solid #2A2A2A',
              display: 'block',
              textAlign: isRtl ? 'right' : 'left'
            }}
          >
            {t('Admin Dashboard', 'Admin Dashboard')}
          </a>
          <button 
            className="btn btn-gold-fill" 
            style={{ width: '100%', marginTop: '24px' }}
            onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
          >
            {t('nav_register', 'Register')}
          </button>
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
          <span>{t('dir_home', 'Home')}</span>
        </button>
        <button 
          onClick={() => navigate('/unternehmen')}
          style={{ background: 'none', border: 'none', color: currentPath === '/unternehmen' ? 'var(--primary-red)' : '#888888', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', gap: '3px', cursor: 'pointer' }}
        >
          <Building2 size={18} />
          <span>{t('dir_directory', 'Directory')}</span>
        </button>
        <button 
          onClick={() => navigate('/news')}
          style={{ background: 'none', border: 'none', color: currentPath === '/news' ? 'var(--primary-red)' : '#888888', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', gap: '3px', cursor: 'pointer' }}
        >
          <Newspaper size={18} />
          <span>{t('nav_news', 'News')}</span>
        </button>
        <button 
          onClick={() => navigate('/interviews')}
          style={{ background: 'none', border: 'none', color: currentPath === '/interviews' ? 'var(--primary-red)' : '#888888', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', gap: '3px', cursor: 'pointer' }}
        >
          <MessageSquare size={18} />
          <span>{t('nav_interviews', 'Interviews')}</span>
        </button>
        <button 
          onClick={() => navigate('/admin')}
          style={{ background: 'none', border: 'none', color: currentPath === '/admin' ? 'var(--primary-red)' : '#888888', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', gap: '3px', cursor: 'pointer' }}
        >
          <LayoutDashboard size={18} />
          <span>{t('Admin', 'Admin')}</span>
        </button>
      </div>
    </>
  );
}
