import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar, CookieBanner, ErrorBoundary } from './features/shared';
import { Directory, Profile } from './features/company';
import { StudentProfile, StudentDashboard, Careers } from './features/students';
import { Rankings, Statistics } from './features/company-ranking';
import { Admin, Auth, About, Contact } from './features/system';
import { Blogs } from './features/blog';
import { News, Interviews, TranslaticTranscript, SoCalGateway, TradePolicyPulse, CrossBorderRanking } from './features/news';
import logo from './assets/logo_highres.png';
import HomeNews from './features/news/views/HomeNews';

function AppContent() {
  const { t, isRtl } = useLanguage();
  const [pathState, setPathState] = useState(window.location.pathname + window.location.search);
  const [transitioning, setTransitioning] = useState(false);
  const [homeNews, setHomeNews] = useState([]);

  // Session and scroll to top state
  const [currentUser, setCurrentUser] = useState(() => {
    const sessionStr = localStorage.getItem('userSession');
    return sessionStr ? JSON.parse(sessionStr) : null;
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState('2');

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Dynamic Canonical Link Tag for SEO Compliance
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href.split('?')[0]);
  }, [pathState]);


  // Path Routing Parser — English only, no lang prefixes
  useEffect(() => {
    const handlePopState = () => {
      setTransitioning(true);
      const currentPath = window.location.pathname || '/';
      const currentSearch = window.location.search || '';
      const parts = currentPath.split('/').filter(Boolean);
      const validLangs = ['de', 'fr', 'en', 'ar'];

      // Strip any legacy lang prefix from URL (e.g. /en/news -> /news)
      if (parts.length > 0 && validLangs.includes(parts[0])) {
        const cleanPath = '/' + parts.slice(1).join('/');
        const target = (!cleanPath || cleanPath === '/') ? '/' : cleanPath;
        window.history.replaceState(null, '', `${target}${currentSearch}`);
        setPathState(target + currentSearch);
        setTransitioning(false);
        return;
      }

      setTimeout(() => {
        setPathState(currentPath + currentSearch);
        setTransitioning(false);
        window.scrollTo(0, 0);
      }, 150);
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch Homepage feeds safely
  useEffect(() => {
    async function loadHomeFeeds() {
      try {
        const newsRes = await fetch('/api/news');
        if (newsRes.ok) {
          const list = await newsRes.json();
          if (Array.isArray(list)) {
            // Priority: Today's posts first -> Yesterday's posts next -> Previous older posts to complete all slots
            const sorted = [...list].sort((a, b) => {
              const dateA = a.date_published || '';
              const dateB = b.date_published || '';
              if (dateA !== dateB) {
                return dateB.localeCompare(dateA);
              }
              return (b.id || 0) - (a.id || 0);
            });
            setHomeNews(sorted);
          } else {
            setHomeNews([]);
          }
        }
      } catch (e) {
        console.error('Error loading homepage feeds:', e);
      }
    }
    loadHomeFeeds();
  }, []);

  const navigate = (path) => {
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    window.history.pushState(null, '', cleanPath);
    window.dispatchEvent(new Event('popstate'));
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    setCurrentUser(null);
    navigate('/login');
  };

  // Helper route decoders
  const getRouteInfo = () => {
    const [rawPath, queryStr] = pathState.split('?');
    
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
    if (path === '/swiss' || path === '/news/swiss' || path === '/news-swiss' || path === '/swiss-companies') {
      return { route: 'swiss-news', params: { ...query, tag: query.tag || 'Hidden Swiss' } };
    }
    if (path === '/news') return { route: 'news', params: query };
    if (path.startsWith('/news/')) {
      const id = path.split('/')[2];
      return { route: 'news-detail', id, params: query };
    }
    if (path === '/blogs') return { route: 'blogs', params: query };
    if (path.startsWith('/blogs/')) {
      const id = path.split('/')[2];
      return { route: 'blogs-detail', id, params: query };
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
    if (path === '/admin' || path.startsWith('/admin/')) {
      const adminParts = path.split('/').filter(Boolean);
      const rawTab = adminParts[1] || 'overview';
      let adminTab = rawTab;
      let adminAction = null;
      let adminId = null;

      if (['new', 'add'].includes(rawTab)) {
        adminTab = 'news';
        adminAction = 'new';
      } else {
        const actionPart = adminParts[2];
        if (actionPart === 'new' || actionPart === 'add') {
          adminAction = 'new';
        } else if (actionPart === 'edit') {
          adminAction = 'edit';
          adminId = adminParts[3] || null;
        } else if (actionPart === 'delete') {
          adminAction = 'delete';
          adminId = adminParts[3] || null;
        }
      }

      return { 
        route: 'admin', 
        adminTab, 
        adminAction, 
        adminId, 
        params: query 
      };
    }
    if (path === '/translatic-transcript') return { route: 'translatic-transcript', params: query };
    if (path === '/socal-gateway') return { route: 'socal-gateway', params: query };
    if (path === '/trade-policy-pulse') return { route: 'trade-policy-pulse', params: query };
    if (path === '/cross-border-ranking') return { route: 'cross-border-ranking', params: query };
    if (path === '/about') return { route: 'about', params: query };
    if (path === '/contact') return { route: 'contact', params: query };

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
      {/* 1. Global Navigation Header (with Top Market Ticker) */}
      {!hideHeaderFooter && (
        <Navbar currentPath={pathState.split('?')[0]} navigate={navigate} currentUser={currentUser} onLogout={handleLogout} />
      )}

      {/* 3. Page Content Area with Transition Wrapper */}
      <div 
        className={`page-fade-enter ${!transitioning ? 'page-fade-enter-active' : ''}`}
        style={{ flex: 1 }}
      >
        
        {/* ROUTE: HOME */}
        {routeInfo.route === 'home' && <HomeNews articles={homeNews} navigate={navigate} />}

        {/* ROUTE: DIRECTORY */}
        {routeInfo.route === 'directory' && (
          <Directory 
            initialSearch={routeInfo.params.search || ''} 
            initialCanton={routeInfo.params.canton || ''}
            initialIndustry={routeInfo.params.industry || ''}
            initialCountry={routeInfo.params.country || ''}
            initialTab={routeInfo.params.tab || ''}
            initialTag={routeInfo.params.tag || ''}
            selectCompany={(id) => navigate(`/unternehmen/${id}`)}
            navigate={navigate}
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

        {/* ROUTE: SWISS COMPANY NEWS */}
        {routeInfo.route === 'swiss-news' && (
          <News 
            selectedArticleId={null} 
            selectArticle={(id) => id ? navigate(`/news/${id}`) : navigate('/swiss')}
            navigate={navigate}
            initialTag={routeInfo.params.tag || 'Hidden Swiss'}
            initialSearch={routeInfo.params.search || ''}
            pageTitle="Swiss Companies & Hidden Champions"
            isSwissSection={true}
          />
        )}

        {/* ROUTE: NEWS LIST */}
        {routeInfo.route === 'news' && (
          <News 
            selectedArticleId={null} 
            selectArticle={(id) => id ? navigate(`/news/${id}`) : navigate('/news')}
            navigate={navigate}
            initialCategory={routeInfo.params.category || ''}
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

        {/* ROUTE: BLOGS LIST */}
        {routeInfo.route === 'blogs' && (
          <Blogs 
            selectedArticleId={null} 
            selectArticle={(id) => id ? navigate(`/blogs/${id}`) : navigate('/blogs')}
            navigate={navigate}
          />
        )}

        {/* ROUTE: BLOGS DETAILS */}
        {routeInfo.route === 'blogs-detail' && (
          <Blogs 
            selectedArticleId={routeInfo.id} 
            selectArticle={(id) => id ? navigate(`/blogs/${id}`) : navigate('/blogs')}
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
        {routeInfo.route === 'karriere' && (
          <Careers navigate={navigate} />
        )}

        {/* ROUTE: RANKINGS */}
        {routeInfo.route === 'ranking' && (
          <Rankings selectCompany={(id) => navigate(`/unternehmen/${id}`)} navigate={navigate} />
        )}

        {/* ROUTE: STUDENT PROFILE */}
        {routeInfo.route === 'student-profile' && (
          <StudentProfile studentId={routeInfo.id || currentStudentId} navigate={navigate} />
        )}

        {/* ROUTE: STUDENT DASHBOARD */}
        {routeInfo.route === 'student-dashboard' && (
          <StudentDashboard studentId={currentStudentId} navigate={navigate} />
        )}

        {/* ROUTE: TRANSLATIC TRANSCRIPT */}
        {routeInfo.route === 'translatic-transcript' && (
          <TranslaticTranscript navigate={navigate} />
        )}

        {/* ROUTE: SOCAL GATEWAY */}
        {routeInfo.route === 'socal-gateway' && (
          <SoCalGateway navigate={navigate} />
        )}

        {/* ROUTE: TRADE POLICY PULSE */}
        {routeInfo.route === 'trade-policy-pulse' && (
          <TradePolicyPulse navigate={navigate} />
        )}

        {/* ROUTE: CROSS-BORDER RANKING */}
        {routeInfo.route === 'cross-border-ranking' && (
          <CrossBorderRanking navigate={navigate} />
        )}

        {/* ROUTE: ABOUT */}
        {routeInfo.route === 'about' && (
          <About navigate={navigate} />
        )}

        {/* ROUTE: CONTACT */}
        {routeInfo.route === 'contact' && (
          <Contact navigate={navigate} />
        )}

        {/* ROUTE: LOGIN */}
        {routeInfo.route === 'login' && (
          <Auth mode="login" navigate={navigate} onLoginSuccess={(u) => setCurrentUser(u)} />
        )}

        {/* ROUTE: REGISTER */}
        {routeInfo.route === 'register' && (
          <Auth mode="register" navigate={navigate} onLoginSuccess={(u) => setCurrentUser(u)} />
        )}

        {/* ROUTE: ADMIN DASHBOARD */}
        {routeInfo.route === 'admin' && (
          <Admin 
            navigate={navigate} 
            onLogout={handleLogout}
            adminTab={routeInfo.adminTab}
            adminAction={routeInfo.adminAction}
            adminId={routeInfo.adminId}
          />
        )}

      </div>

      {/* 4. Global Footer Section (NZZ density layout) */}
      {!hideHeaderFooter && (
        <footer 
          style={{
            backgroundColor: '#f3f4f6',
            borderTop: '1px solid rgba(191, 155, 48, 0.4)',
            color: '#374151',
            padding: '32px 24px',
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
              gap: '24px',
              marginBottom: '24px'
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

          <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '0.5px solid #d1d5db', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', color: '#4b5563', fontSize: '11px' }}>
            <span>{t('footer_rights', '© 2026 privatesector.ch. All rights reserved.')}</span>
            <span>{t('footer_compliance', 'GDPR & Swiss Data Protection Act compliant 🇨🇭')}</span>
          </div>
        </footer>
      )}

      {/* 5. Cookie Consent Banner */}
      <CookieBanner />

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '40px',
            right: '40px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-red)',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            zIndex: 9999,
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ▲
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
