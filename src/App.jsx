import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import logo from './assets/logo_highres.png';
import Hero from './components/Hero';
import CookieBanner from './components/CookieBanner';
import AdSlot from './components/AdSlot';
import Directory from './pages/Directory';
import Profile from './pages/Profile';
import News from './pages/News';
import Statistics from './pages/Statistics';
import Admin from './pages/Admin';
import Interviews from './pages/Interviews';
import Auth from './pages/Auth';
import Careers from './pages/Careers';
import StudentProfile from './pages/StudentProfile';
import StudentDashboard from './pages/StudentDashboard';
import Rankings from './pages/Rankings';
import CompanyCard from './components/CompanyCard';
import HomepageGraphics from './components/HomepageGraphics';
import { Landmark, ArrowRight, ShieldCheck } from 'lucide-react';

function AppContent() {
  const { t, isRtl, switchLanguage, currentLang } = useLanguage();
  const [hash, setHash] = useState(window.location.hash || '#/');
  const [transitioning, setTransitioning] = useState(false);
  const [homeFeatured, setHomeFeatured] = useState([]);
  const [homeNews, setHomeNews] = useState([]);

  // Mock logged-in student session state (e.g. Lukas Keller with ID 2)
  const [currentStudentId, setCurrentStudentId] = useState('2');

  // Hash Routing Parser
  useEffect(() => {
    const handleHashChange = () => {
      setTransitioning(true);
      const currentHash = window.location.hash || '#/';
      let cleanHash = currentHash.replace('#', '');
      if (!cleanHash.startsWith('/')) {
        cleanHash = '/' + cleanHash;
      }
      const [rawPath] = cleanHash.split('?');
      const parts = rawPath.split('/').filter(Boolean);
      const validLangs = ['de', 'fr', 'en', 'ar'];
      
      if (parts.length === 0 || !validLangs.includes(parts[0])) {
        const cleanPath = rawPath === '/' ? '' : rawPath;
        const q = currentHash.includes('?') ? '?' + currentHash.split('?')[1] : '';
        window.location.hash = `#/${currentLang}${cleanPath}${q}`;
        return;
      }

      setTimeout(() => {
        setHash(currentHash);
        setTransitioning(false);
        window.scrollTo(0, 0);
      }, 150);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentLang]);

  // Fetch Homepage feeds
  useEffect(() => {
    async function loadHomeFeeds() {
      try {
        const compRes = await fetch('/api/companies?premium=true');
        if (compRes.ok) {
          const list = await compRes.json();
          setHomeFeatured(list.slice(0, 3));
        }

        const newsRes = await fetch('/api/news');
        if (newsRes.ok) {
          const list = await newsRes.json();
          setHomeNews(list.slice(0, 3));
        }
      } catch (e) {
        console.error('Error loading homepage feeds:', e);
      }
    }
    loadHomeFeeds();
  }, []);

  const navigate = (path) => {
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    window.location.hash = `#/${currentLang}${cleanPath === '/' ? '' : cleanPath}`;
  };

  // Helper route decoders
  const getRouteInfo = () => {
    let cleanHash = hash.replace('#', '');
    if (!cleanHash.startsWith('/')) {
      cleanHash = '/' + cleanHash;
    }
    const [rawPath, queryStr] = cleanHash.split('?');
    
    // Parse query params
    const query = {};
    if (queryStr) {
      queryStr.split('&').forEach(param => {
        const [k, v] = param.split('=');
        query[k] = decodeURIComponent(v || '');
      });
    }

    // Extract language code prefix if present
    const parts = rawPath.split('/').filter(Boolean);
    const validLangs = ['de', 'fr', 'en', 'ar'];
    let path = rawPath;
    if (parts.length > 0 && validLangs.includes(parts[0])) {
      path = '/' + parts.slice(1).join('/');
    }

    // Match patterns
    if (path === '/') return { route: 'home', params: query };
    if (path === '/unternehmen') return { route: 'directory', params: query };
    if (path.startsWith('/unternehmen/')) {
      const id = path.split('/')[2];
      return { route: 'profile', id, params: query };
    }
    if (path === '/news') return { route: 'news', params: query };
    if (path.startsWith('/news/')) {
      const id = path.split('/')[2];
      return { route: 'news-detail', id, params: query };
    }
    if (path === '/statistiken') return { route: 'statistics', params: query };
    if (path === '/interviews') return { route: 'interviews', params: query };
    if (path.startsWith('/interviews/')) {
      const id = path.split('/')[2];
      return { route: 'interview-detail', id, params: query };
    }
    if (path === '/podcasts') return { route: 'podcasts', params: query };
    if (path === '/karriere') return { route: 'careers', params: query };
    if (path === '/ranking') return { route: 'ranking', params: query };
    if (path === '/student-dashboard') return { route: 'student-dashboard', params: query };
    if (path.startsWith('/student/')) {
      const id = path.split('/')[2];
      return { route: 'student-profile', id, params: query };
    }
    if (path === '/login') return { route: 'login', params: query };
    if (path === '/register') return { route: 'register', params: query };
    if (path === '/admin') return { route: 'admin', params: query };

    return { route: 'home', params: query };
  };

  const routeInfo = getRouteInfo();

  // Flag grid list for 4 languages in footer
  const footerFlags = [
    { code: 'DE', flag: '🇩🇪' }, { code: 'FR', flag: '🇫🇷' }, { code: 'EN', flag: '🇬🇧' }, { code: 'AR', flag: '🇸🇦' }
  ];

  const hideHeaderFooter = routeInfo.route === 'admin' || routeInfo.route === 'login' || routeInfo.route === 'register';

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: 'var(--bg-ivory)',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      {/* 1. Breaking News deep red banner (Visible on Homepage) */}
      {routeInfo.route === 'home' && (
        <div className="breaking-banner">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="breaking-label">{t('breaking_news', 'Eilmeldung')}</span>
            <marquee scrollamount="4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
              {t('marquee_text', '+++ Swiss Federal Council announces tax relief for private R&D hubs +++ Nestlé expands sustainability audits across agricultural supply chains +++ UBS receives approval for tokenized bond pilot project in Geneva +++')}
            </marquee>
          </div>
        </div>
      )}

      {/* 2. Global Navigation Header */}
      {!hideHeaderFooter && (
        <Navbar currentPath={hash.replace('#', '').split('?')[0]} navigate={navigate} />
      )}

      {/* 3. Page Content Area with Transition Wrapper */}
      <div 
        className={`page-fade-enter ${!transitioning ? 'page-fade-enter-active' : ''}`}
        style={{ flex: 1 }}
      >
        
        {/* ROUTE: HOME */}
        {routeInfo.route === 'home' && (
          <div>
            <Hero navigate={navigate} />

            {/* Homepage Body content */}
            <div className="container" style={{ paddingTop: '64px', paddingBottom: '96px' }}>
              
              {/* Leaderboard Zone A */}
              <AdSlot position="A" />

              {/* Spotlight Enterprises Grid */}
              <div style={{ marginTop: '48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>
                    {t('spotlight_title', 'Premium Business Spotlight')}
                  </h2>
                  <a 
                    href="#/unternehmen" 
                    onClick={(e) => { e.preventDefault(); navigate('/unternehmen'); }}
                    style={{ fontSize: '13px', color: 'var(--primary-red)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>{t('open_directory', 'Verzeichnis öffnen')}</span>
                    <ArrowRight size={14} />
                  </a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                  {homeFeatured.map(comp => (
                    <CompanyCard 
                      key={comp.id}
                      company={comp}
                      onClick={() => navigate(`/unternehmen/${comp.id}`)}
                    />
                  ))}
                  {/* Spotlight ad box Zone F */}
                  <AdSlot position="F" />
                </div>
              </div>

              {/* Interactive Canton, Live Register, & Network Graphics */}
              <HomepageGraphics navigate={navigate} />

              {/* Editorial / News teaser block */}
              <div style={{ marginTop: '64px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }} className="home-news-row">
                
                {/* News feed column */}
                <div>
                  <h2 style={{ fontSize: '24px', fontFamily: '"Playfair Display", serif', fontWeight: 700, borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px', marginBottom: '24px' }}>
                    {t('news_title', 'Wirtschaftsanalysen & Berichte')}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {homeNews.map(art => (
                      <div 
                        key={art.id} 
                        onClick={() => navigate(`/news/${art.id}`)}
                        style={{ display: 'flex', gap: '16px', cursor: 'pointer', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '20px' }}
                        className="home-news-teaser"
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '11px', color: 'var(--primary-red)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            {art.category}
                          </span>
                          <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', color: 'var(--text-ink)', margin: '4px 0 8px', fontWeight: 700 }}>
                            {art.title}
                          </h3>
                          <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.5 }}>
                            {art.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side static editorial promo */}
                <div className="desktop-only">
                  <div 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      color: '#374151', 
                      padding: '24px', 
                      borderRadius: '6px',
                      borderTop: '4px solid var(--primary-red)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Landmark size={32} style={{ color: 'var(--primary-red)', marginBottom: '16px' }} />
                    <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', color: '#111827', marginBottom: '8px', fontWeight: 700 }}>
                      {t('b2b_index_title', 'B2B Vertrauensindex')}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.6, marginBottom: '20px' }}>
                      {t('b2b_index_desc', 'Zefix-verifizierte Profile sorgen für Transparenz und direkte Vertrauensbildung mit internationalen Handelspartnern im Schweizer B2B-Markt.')}
                    </p>
                    <button 
                      className="btn btn-gold-fill" 
                      style={{ fontSize: '11px', padding: '8px 16px', width: '100%', minHeight: '36px' }}
                      onClick={() => navigate('/unternehmen')}
                    >
                      {t('search_dossier', 'Dossier-Index durchsuchen')}
                    </button>
                  </div>
                  
                  {/* Sticky Rectangle ad Zone C */}
                  <AdSlot position="C" />
                </div>

              </div>

            </div>

            <style>{`
              .home-news-teaser:hover h3 {
                color: var(--primary-red) !important;
              }
              @media (max-width: 768px) {
                .home-news-row {
                  grid-template-columns: 1fr !important;
                }
              }
            `}</style>
          </div>
        )}

        {/* ROUTE: DIRECTORY */}
        {routeInfo.route === 'directory' && (
          <Directory 
            initialSearch={routeInfo.params.search || ''} 
            initialCanton={routeInfo.params.canton || ''}
            initialIndustry={routeInfo.params.industry || ''}
            selectCompany={(id) => navigate(`/unternehmen/${id}`)}
          />
        )}

        {/* ROUTE: COMPANY PROFILE */}
        {routeInfo.route === 'profile' && (
          <Profile 
            companyId={routeInfo.id} 
            onBack={() => navigate('/unternehmen')} 
            navigate={navigate}
          />
        )}

        {/* ROUTE: NEWS LIST */}
        {routeInfo.route === 'news' && (
          <News 
            selectedArticleId={null} 
            selectArticle={(id) => id ? navigate(`/news/${id}`) : navigate('/news')}
            navigate={navigate}
          />
        )}

        {/* ROUTE: NEWS DETAILS */}
        {routeInfo.route === 'news-detail' && (
          <News 
            selectedArticleId={routeInfo.id} 
            selectArticle={(id) => id ? navigate(`/news/${id}`) : navigate('/news')}
            navigate={navigate}
          />
        )}

        {/* ROUTE: STATISTICS */}
        {routeInfo.route === 'statistics' && (
          <Statistics navigate={navigate} />
        )}

        {/* ROUTE: INTERVIEWS LIST */}
        {routeInfo.route === 'interviews' && (
          <Interviews 
            selectedInterviewId={null} 
            isPodcastOnly={false}
            selectInterview={(id) => id ? navigate(`/interviews/${id}`) : navigate('/interviews')}
            navigate={navigate}
          />
        )}

        {/* ROUTE: INTERVIEW DETAIL */}
        {routeInfo.route === 'interview-detail' && (
          <Interviews 
            selectedInterviewId={routeInfo.id} 
            isPodcastOnly={false}
            selectInterview={(id) => id ? navigate(`/interviews/${id}`) : navigate('/interviews')}
            navigate={navigate}
          />
        )}

        {/* ROUTE: PODCASTS LIST */}
        {routeInfo.route === 'podcasts' && (
          <Interviews 
            selectedInterviewId={null} 
            isPodcastOnly={true}
            selectInterview={(id) => id ? navigate(`/interviews/${id}`) : navigate('/podcasts')}
            navigate={navigate}
          />
        )}

        {/* ROUTE: CAREERS */}
        {routeInfo.route === 'careers' && (
          <Careers navigate={navigate} />
        )}

        {/* ROUTE: RANKINGS */}
        {routeInfo.route === 'ranking' && (
          <Rankings selectCompany={(id) => navigate(`/unternehmen/${id}`)} />
        )}

        {/* ROUTE: STUDENT PROFILE */}
        {routeInfo.route === 'student-profile' && (
          <StudentProfile studentId={routeInfo.id} navigate={navigate} />
        )}

        {/* ROUTE: STUDENT DASHBOARD */}
        {routeInfo.route === 'student-dashboard' && (
          <StudentDashboard studentId={currentStudentId} navigate={navigate} />
        )}

        {/* ROUTE: LOGIN */}
        {routeInfo.route === 'login' && (
          <Auth mode="login" navigate={navigate} />
        )}

        {/* ROUTE: REGISTER */}
        {routeInfo.route === 'register' && (
          <Auth mode="register" navigate={navigate} />
        )}

        {/* ROUTE: ADMIN DASHBOARD */}
        {routeInfo.route === 'admin' && (
          <Admin navigate={navigate} />
        )}

      </div>

      {/* 4. Global Footer Section (NZZ density layout) */}
      {!hideHeaderFooter && (
        <footer 
          style={{
            backgroundColor: '#f3f4f6',
            borderTop: '1px solid rgba(191, 155, 48, 0.4)',
            color: '#374151',
            padding: '64px 24px 80px',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <div 
            style={{
              maxWidth: '1280px',
              width: '100%',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '48px',
              marginBottom: '40px'
            }}
          >
            <div>
              <div 
                onClick={() => navigate('/')} 
                style={{ 
                  cursor: 'pointer', 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  height: '70px'
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
              <p style={{ color: '#4b5563', fontSize: '12px', lineHeight: 1.5 }}>
                {t('footer_desc', 'Swiss business and B2B data platform. Verified information on companies, market data, and analyses.')}
              </p>
            </div>
            
            <div>
              <strong style={{ color: 'var(--primary-red)', display: 'block', marginBottom: '16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('footer_directory', 'Directory')}</strong>
              <a href="#/unternehmen" onClick={(e) => { e.preventDefault(); navigate('/unternehmen'); }} style={{ color: '#4b5563', textDecoration: 'none', display: 'block', margin: '8px 0' }}>{t('footer_search_companies', 'Search Companies')}</a>
              <a href="#/unternehmen" onClick={(e) => { e.preventDefault(); navigate('/unternehmen?verified=true'); }} style={{ color: '#4b5563', textDecoration: 'none', display: 'block', margin: '8px 0' }}>{t('footer_verified_partners', 'Verified Partners')}</a>
            </div>

            <div>
              <strong style={{ color: 'var(--primary-red)', display: 'block', marginBottom: '16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('footer_editorial', 'Editorial')}</strong>
              <a href="#/news" onClick={(e) => { e.preventDefault(); navigate('/news'); }} style={{ color: '#4b5563', textDecoration: 'none', display: 'block', margin: '8px 0' }}>{t('footer_reports', 'Business Reports')}</a>
              <a href="#/interviews" onClick={(e) => { e.preventDefault(); navigate('/interviews'); }} style={{ color: '#4b5563', textDecoration: 'none', display: 'block', margin: '8px 0' }}>{t('footer_ceo_interviews', 'CEO Interviews')}</a>
              <a href="#/podcasts" onClick={(e) => { e.preventDefault(); navigate('/podcasts'); }} style={{ color: '#4b5563', textDecoration: 'none', display: 'block', margin: '8px 0' }}>{t('footer_podcasts', 'Business Podcasts')}</a>
            </div>

            <div>
              <strong style={{ color: 'var(--primary-red)', display: 'block', marginBottom: '16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('footer_console', 'Console')}</strong>
              <a href="#/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }} style={{ color: '#4b5563', textDecoration: 'none', display: 'block', margin: '8px 0' }}>Admin Dashboard</a>
              <a href="#/statistiken" onClick={(e) => { e.preventDefault(); navigate('/statistiken'); }} style={{ color: '#4b5563', textDecoration: 'none', display: 'block', margin: '8px 0' }}>{t('footer_stats_heatmaps', 'Statistics & Heatmaps')}</a>
            </div>
          </div>

          {/* 18 Languages Flag Grid */}
          <div style={{ maxWidth: '1280px', margin: '0 auto 32px', borderTop: '0.5px solid #d1d5db', paddingTop: '24px' }}>
            <span style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>{t('footer_supported_langs', 'Supported Languages')}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 18px', fontSize: '11px', color: '#4b5563' }}>
              {footerFlags.map(f => (
                <div key={f.code} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => switchLanguage(f.code.toLowerCase())}>
                  <span>{f.flag}</span>
                  <span>{f.code}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '0.5px solid #d1d5db', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', color: '#4b5563', fontSize: '11px' }}>
            <span>{t('footer_rights', '© 2026 privatesector.vitalswiss.ch. All rights reserved.')}</span>
            <span>{t('footer_compliance', 'GDPR & Swiss Data Protection Act compliant 🇨🇭')}</span>
          </div>
        </footer>
      )}

      {/* 5. Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
