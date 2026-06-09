import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AdSlot from '../components/AdSlot';
import { 
  LayoutDashboard, 
  Files, 
  Tv, 
  Languages, 
  Bell, 
  Plus, 
  ArrowRight, 
  Globe, 
  Save, 
  FileCode, 
  RefreshCw,
  Eye,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export default function Admin({ navigate }) {
  const { refreshTranslations } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview'); // overview, pages, ads, translations
  
  // Dashboard Metrics state
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  
  // Ads manager state
  const [ads, setAds] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showAddAdModal, setShowAddAdModal] = useState(false);
  const [adModalStep, setAdModalStep] = useState(1); // 1, 2, 3, 4
  const [newAdForm, setNewAdForm] = useState({
    name: '',
    type: 'Direct Banner',
    position: 'A', // Zone letter (A-H)
    company_id: '',
    image_url: '',
    start_date: '2026-06-06',
    end_date: '2026-09-06',
    geo_swiss_only: true
  });

  // Translation manager state
  const [transList, setTransList] = useState([]);
  const [selectedTransLang, setSelectedTransLang] = useState(null);
  const [editingTranslations, setEditingTranslations] = useState([]); // local changes
  const [deepLLoading, setDeepLLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function loadAdminData() {
      try {
        const pagesRes = await fetch('/api/pages');
        if (pagesRes.ok) {
          const list = await pagesRes.json();
          setPages(list);
          if (list.length > 0) {
            loadPageLayout(list[0].path);
          }
        }
        
        const adsRes = await fetch('/api/admin/ads');
        if (adsRes.ok) setAds(await adsRes.json());

        const compRes = await fetch('/api/companies');
        if (compRes.ok) setCompanies(await compRes.json());

        loadTranslationsGrid();
      } catch (e) {
        console.error('Failed to load admin resources:', e);
      }
    }
    loadAdminData();
  }, []);

  async function loadPageLayout(path) {
    try {
      const res = await fetch(`/api/pages/by-path?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        setSelectedPage(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTranslationsGrid() {
    try {
      const transRes = await fetch('/api/admin/translations');
      if (transRes.ok) {
        setTransList(await transRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleBlockToggle = (blockId) => {
    if (!selectedPage) return;
    const updatedBlocks = selectedPage.blocks_layout.map(b => 
      b.id === blockId ? { ...b, enabled: !b.enabled } : b
    );
    setSelectedPage({ ...selectedPage, blocks_layout: updatedBlocks });
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;
    try {
      const res = await fetch(`/api/pages/${selectedPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPage)
      });
      if (res.ok) {
        alert('Page layout and SEO metadata saved successfully!');
        const pagesRes = await fetch('/api/pages');
        if (pagesRes.ok) setPages(await pagesRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAd = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdForm)
      });
      if (res.ok) {
        alert('Advertising Campaign created and deployed successfully!');
        setShowAddAdModal(false);
        setAdModalStep(1);
        const adsRes = await fetch('/api/admin/ads');
        if (adsRes.ok) setAds(await adsRes.json());
        // Reset form
        setNewAdForm({
          name: '',
          type: 'Direct Banner',
          position: 'A',
          company_id: '',
          image_url: '',
          start_date: '2026-06-06',
          end_date: '2026-09-06',
          geo_swiss_only: true
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerAutoTranslate = async () => {
    setDeepLLoading(true);
    try {
      const res = await fetch('/api/admin/translations/auto-translate-all', { method: 'POST' });
      if (res.ok) {
        const out = await res.json();
        alert(`DeepL Simulator: Translated ${out.count} items successfully across all missing language slots.`);
        loadTranslationsGrid();
        refreshTranslations();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeepLLoading(false);
    }
  };

  const handleOpenLanguageEdit = (langCode) => {
    setSelectedTransLang(langCode);
    const langTrans = transList.filter(t => t.language_code === langCode);
    setEditingTranslations(langTrans);
  };

  const handleUpdateTranslationKey = (key, val) => {
    setEditingTranslations(prev => 
      prev.map(item => item.key === key ? { ...item, translated_text: val, status: 'reviewed' } : item)
    );
  };

  const handleSaveTranslations = async () => {
    try {
      for (const item of editingTranslations) {
        await fetch('/api/admin/translations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
      alert('Translations updated and synced in database!');
      setSelectedTransLang(null);
      loadTranslationsGrid();
      refreshTranslations();
    } catch (e) {
      console.error(e);
    }
  };

  const getLanguageStats = () => {
    const langs = [...new Set(transList.map(t => t.language_code))];
    return langs.map(lCode => {
      const items = transList.filter(t => t.language_code === lCode);
      const autoCount = items.filter(t => t.status === 'auto-only').length;
      const reviewCount = items.filter(t => t.status === 'reviewed').length;
      const total = items.length;
      const lastUp = '2026-06-06';
      
      let status = 'reviewed';
      if (autoCount > 0) status = 'auto-only';
      if (reviewCount === 0 && autoCount === 0) status = 'pending';

      return {
        code: lCode,
        status,
        autoCount,
        reviewCount,
        total,
        lastUp
      };
    });
  };

  const langStats = getLanguageStats();

  const handleAddPageClick = () => {
    alert('Neue Seite hinzufügen - Premium CMS Module required.');
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', backgroundColor: '#0D0D0D', color: '#FFFDF7' }}>
      
      {/* 1. Sidebar Nav (240px width, #111111 background) */}
      <aside style={{ width: '240px', backgroundColor: '#111111', borderRight: '1.5px solid #2A2A2A', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '24px 0' }}>
          
          <button 
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              borderLeft: activeTab === 'overview' ? '3px solid var(--primary-red)' : '3px solid transparent',
              color: activeTab === 'overview' ? 'var(--primary-red)' : '#888888',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'left'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('pages')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              borderLeft: activeTab === 'pages' ? '3px solid var(--primary-red)' : '3px solid transparent',
              color: activeTab === 'pages' ? 'var(--primary-red)' : '#888888',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'left'
            }}
          >
            <Files size={18} />
            <span>Page Builder</span>
          </button>

          <button 
            onClick={() => setActiveTab('ads')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              borderLeft: activeTab === 'ads' ? '3px solid var(--primary-red)' : '3px solid transparent',
              color: activeTab === 'ads' ? 'var(--primary-red)' : '#888888',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'left'
            }}
          >
            <Tv size={18} />
            <span>Ad Manager</span>
          </button>

          <button 
            onClick={() => setActiveTab('translations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              borderLeft: activeTab === 'translations' ? '3px solid var(--primary-red)' : '3px solid transparent',
              color: activeTab === 'translations' ? 'var(--primary-red)' : '#888888',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'left'
            }}
          >
            <Languages size={18} />
            <span>Translation Manager</span>
          </button>

          <button 
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              color: '#888888',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'left',
              marginTop: '40px'
            }}
          >
            <Globe size={18} />
            <span>Live Platform</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', boxSizing: 'border-box' }}>
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #2A2A2A', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary-red)' }}>ADMIN PORTAL</span>
            <h1 style={{ fontSize: '28px', fontFamily: '"Playfair Display", serif', margin: 0, color: '#FFFDF7', fontWeight: 700 }}>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'pages' && 'Page Builder'}
              {activeTab === 'ads' && 'Ad Manager'}
              {activeTab === 'translations' && 'Translation Manager'}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#FFFDF7' }}>
              <Bell size={20} />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-red)' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '4px', border: '0.5px solid var(--primary-red)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFDF7', fontFamily: 'Inter, sans-serif' }}>F. Schneider</span>
            </div>
          </div>
        </div>

        {/* TAB CONTENT 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards Row (JetBrains Mono 32px gold numbers) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              
              <div style={{ backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', padding: '24px', borderRadius: '6px' }}>
                <span className="caps-label" style={{ color: '#888888', display: 'block', marginBottom: '8px', fontSize: '11px' }}>Total Companies</span>
                <span style={{ fontSize: '32px', fontFamily: 'var(--font-mono)', color: 'var(--primary-red)', fontWeight: 700 }}>{companies.length}</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--accent-green)', marginTop: '4px' }}>+12 This Week</span>
              </div>

              <div style={{ backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', padding: '24px', borderRadius: '6px' }}>
                <span className="caps-label" style={{ color: '#888888', display: 'block', marginBottom: '8px', fontSize: '11px' }}>Monthly Visitors</span>
                <span style={{ fontSize: '32px', fontFamily: 'var(--font-mono)', color: 'var(--primary-red)', fontWeight: 700 }}>84'200</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--accent-green)', marginTop: '4px' }}>+8.4% CTR Gain</span>
              </div>

              <div style={{ backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', padding: '24px', borderRadius: '6px' }}>
                <span className="caps-label" style={{ color: '#888888', display: 'block', marginBottom: '8px', fontSize: '11px' }}>Active Ad Placements</span>
                <span style={{ fontSize: '32px', fontFamily: 'var(--font-mono)', color: 'var(--primary-red)', fontWeight: 700 }}>{ads.length}</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--primary-red)', marginTop: '4px' }}>85% Occupancy</span>
              </div>

              <div style={{ backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', padding: '24px', borderRadius: '6px' }}>
                <span className="caps-label" style={{ color: '#888888', display: 'block', marginBottom: '8px', fontSize: '11px' }}>Monthly Revenue</span>
                <span style={{ fontSize: '32px', fontFamily: 'var(--font-mono)', color: 'var(--primary-red)', fontWeight: 700 }}>CHF 124'500</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--accent-green)', marginTop: '4px' }}>+15% Growth</span>
              </div>

            </div>

            {/* Quick Diagnostics */}
            <div style={{ backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', padding: '24px', borderRadius: '6px' }}>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', marginBottom: '16px', color: '#FFFDF7', fontWeight: 700 }}>System Diagnostics</h3>
              <p style={{ fontSize: '13px', color: '#888888', lineHeight: 1.6 }}>
                Database: <strong style={{ color: 'var(--accent-green)' }}>SQLite Connected (database.sqlite)</strong>. 
                All API services are active and running. Multilingual routing active across 18 distinct language configurations.
              </p>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: PAGE BUILDER */}
        {activeTab === 'pages' && selectedPage && (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: '24px' }}>
            
            {/* Left page tree list */}
            <div style={{ backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', borderRadius: '6px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="caps-label" style={{ color: '#888888' }}>Site Directory</span>
                <button 
                  onClick={handleAddPageClick}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-red)', cursor: 'pointer' }}
                  title="Neue Seite +"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pages.map(p => (
                  <button
                    key={p.id}
                    onClick={() => loadPageLayout(p.path)}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      border: 'none',
                      backgroundColor: selectedPage.path === p.path ? '#0D0D0D' : 'transparent',
                      color: selectedPage.path === p.path ? 'var(--primary-red)' : '#888888',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: selectedPage.path === p.path ? 600 : 400
                    }}
                  >
                    {p.path === '/' ? 'Home (/)': p.path}
                  </button>
                ))}
              </div>
            </div>

            {/* Center page block editor */}
            <div style={{ backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', borderRadius: '6px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid #2A2A2A', paddingBottom: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', color: '#FFFDF7', fontWeight: 700 }}>Visual Blocks Layout</h3>
                <button className="btn btn-gold-fill" onClick={handleSavePage} style={{ fontSize: '12px', padding: '6px 12px', minHeight: '32px', display: 'flex', gap: '6px' }}>
                  <Save size={14} />
                  Save Changes
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedPage.blocks_layout.map((block) => (
                  <div 
                    key={block.id}
                    style={{
                      border: block.enabled ? '1.5px dashed var(--primary-red)' : '1px dashed #2A2A2A', // gold dashed selected blocks
                      backgroundColor: block.enabled ? '#0D0D0D' : '#1A1A1A',
                      opacity: block.enabled ? 1 : 0.5,
                      borderRadius: '4px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong style={{ textTransform: 'capitalize', fontSize: '14px', color: '#FFFDF7' }}>{block.id.replace('_', ' ')} Block</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: '#888888', marginTop: '4px' }}>
                        {block.id === 'hero' && 'Editorial landing typography & CTAs'}
                        {block.id === 'ticker' && 'Economic stats strip with modern numbers'}
                        {block.id === 'sponsored_carousel' && 'Featured listings rotating stack'}
                        {block.id === 'companies_grid' && 'B2B Company Directory grid search'}
                        {block.id === 'news_section' && 'Editorial news feed grid list'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleBlockToggle(block.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: block.enabled ? 'rgba(74, 103, 65, 0.2)' : '#111111',
                        color: block.enabled ? 'var(--accent-green)' : '#888888',
                        border: '0.5px solid',
                        borderColor: block.enabled ? 'var(--accent-green)' : '#2A2A2A',
                        cursor: 'pointer',
                        borderRadius: '0px'
                      }}
                    >
                      {block.enabled ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right block properties & SEO */}
            <div style={{ backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', borderRadius: '6px', padding: '20px' }}>
              <span className="caps-label" style={{ color: '#888888', display: 'block', marginBottom: '16px' }}>Page Properties</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: '#FFFDF7' }}>SEO Meta Title</label>
                  <input 
                    type="text" 
                    value={selectedPage.title}
                    onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
                    className="input-field"
                    style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: '#FFFDF7' }}>SEO Meta Description</label>
                  <textarea 
                    value={selectedPage.meta_description}
                    onChange={(e) => setSelectedPage({ ...selectedPage, meta_description: e.target.value })}
                    className="input-field"
                    style={{ height: '100px', resize: 'none', backgroundColor: '#0D0D0D', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '0.5px solid #2A2A2A', marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFDF7' }}>Enable Ad Slots</span>
                  <input 
                    type="checkbox" 
                    checked={selectedPage.ads_enabled === 1}
                    onChange={(e) => setSelectedPage({ ...selectedPage, ads_enabled: e.target.checked ? 1 : 0 })}
                    style={{ accentColor: 'var(--primary-red)' }}
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB CONTENT 3: AD MANAGER */}
        {activeTab === 'ads' && (
          <div>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
              <span className="caps-label" style={{ color: '#888888' }}>Active Ad Zone Allocations</span>
              <button className="btn btn-gold-fill" onClick={() => { setShowAddAdModal(true); setAdModalStep(1); }} style={{ display: 'flex', gap: '6px', fontSize: '12px', minHeight: '36px' }}>
                <Plus size={14} />
                Create Ad Campaign
              </button>
            </div>

            {/* Ads Grid/Table */}
            <div style={{ backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', borderRadius: '6px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', fontFamily: 'Inter, sans-serif', color: '#FFFDF7' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111111', borderBottom: '1px solid #2A2A2A', color: '#FFFDF7' }}>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Campaign Name</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Zone Position</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Linked Holding</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Impressions</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Clicks</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>CTR</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map(ad => {
                    const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) + '%' : '0.00%';
                    return (
                      <tr key={ad.id} style={{ borderBottom: '0.5px solid #2A2A2A' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: '#FFFDF7' }}>{ad.name}</td>
                        <td style={{ padding: '16px 20px', color: '#888888' }}>{ad.type}</td>
                        <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)' }}>Zone {ad.position}</td>
                        <td style={{ padding: '16px 20px', color: '#888888' }}>{ad.company_name || 'Generic AdSense'}</td>
                        <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)' }}>{ad.impressions.toLocaleString()}</td>
                        <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)' }}>{ad.clicks.toLocaleString()}</td>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--primary-red)', fontFamily: 'var(--font-mono)' }}>{ctr}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            backgroundColor: ad.status === 'active' ? 'rgba(74, 103, 65, 0.2)' : 'rgba(139, 0, 0, 0.2)', 
                            color: ad.status === 'active' ? 'var(--accent-green)' : 'var(--accent-red)', 
                            padding: '4px 10px', 
                            fontSize: '11px', 
                            fontWeight: 600, 
                            border: ad.status === 'active' ? '0.5px solid var(--accent-green)' : '0.5px solid var(--accent-red)'
                          }}>
                            {ad.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CREATE AD MULTI-STEP MODAL */}
            {showAddAdModal && (
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <div 
                  style={{
                    backgroundColor: '#1A1A1A',
                    border: '1.5px solid #2A2A2A',
                    borderRadius: '6px',
                    width: '600px',
                    maxWidth: '100%',
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}
                >
                  {/* Step Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888888', marginBottom: '8px' }}>
                      <span>STEP {adModalStep} OF 4</span>
                      <span>{adModalStep === 1 && 'Kampagnen-Typ wählen'} {adModalStep === 2 && 'Platzierung wählen'} {adModalStep === 3 && 'Details eingeben'} {adModalStep === 4 && 'Überprüfen & Aktivieren'}</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: '#2A2A2A', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', backgroundColor: 'var(--primary-red)', width: `${adModalStep * 25}%`, transition: 'width 0.2s' }} />
                    </div>
                  </div>

                  {/* Step 1: Ad Typ Option Cards */}
                  {adModalStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>1. Ad-Kampagnentyp wählen</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        {[
                          { title: 'Company Spotlight', desc: 'Premium-Dossier-Overlay direkt im Firmenverzeichnis.' },
                          { title: 'Direct Banner', desc: 'Grafischer Banner auf Leaderboard oder Sidebar.' },
                          { title: 'Google AdSense', desc: 'Standard Programmatic Ad Integration.' }
                        ].map(opt => (
                          <div 
                            key={opt.title}
                            onClick={() => setNewAdForm({ ...newAdForm, type: opt.title })}
                            style={{
                              padding: '16px',
                              border: newAdForm.type === opt.title ? '1.5px solid var(--primary-red)' : '0.5px solid #2A2A2A',
                              backgroundColor: newAdForm.type === opt.title ? '#0D0D0D' : 'transparent',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            <span style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#FFF' }}>{opt.title}</span>
                            <span style={{ fontSize: '12px', color: '#888' }}>{opt.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Placement Visual Zone Diagram */}
                  {adModalStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>2. Platzierungs-Zone wählen</h3>
                      
                      {/* Visual Zone Diagram Mockup */}
                      <div style={{ border: '0.5px solid #2A2A2A', padding: '16px', backgroundColor: '#0D0D0D', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>MOCKUP WEBPAGE ZONES</div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
                          <button 
                            type="button"
                            onClick={() => setNewAdForm({ ...newAdForm, position: 'A' })}
                            style={{ padding: '6px', backgroundColor: newAdForm.position === 'A' ? 'var(--primary-red)' : '#1A1A1A', border: '0.5px solid #2A2A2A', color: newAdForm.position === 'A' ? '#1A1A1A' : '#888', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            [ZONE A] Leaderboard Top (728x90)
                          </button>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                            <div style={{ height: '60px', backgroundColor: '#111', border: '0.5px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#666' }}>
                              Content Feed
                            </div>
                            <button 
                              type="button"
                              onClick={() => setNewAdForm({ ...newAdForm, position: 'C' })}
                              style={{ backgroundColor: newAdForm.position === 'C' ? 'var(--primary-red)' : '#1A1A1A', border: '0.5px solid #2A2A2A', color: newAdForm.position === 'C' ? '#1A1A1A' : '#888', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', padding: '4px' }}
                            >
                              [ZONE C] Sidebar Rectangle
                            </button>
                          </div>
                          
                          <button 
                            type="button"
                            onClick={() => setNewAdForm({ ...newAdForm, position: 'F' })}
                            style={{ padding: '6px', backgroundColor: newAdForm.position === 'F' ? 'var(--primary-red)' : '#1A1A1A', border: '0.5px solid #2A2A2A', color: newAdForm.position === 'F' ? '#1A1A1A' : '#888', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            [ZONE F] Company Spotlight (Directory)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Details */}
                  {adModalStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>3. Kampagnen-Details</h3>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Kampagnenname</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="z.B. UBS Gold Sponsorship"
                          value={newAdForm.name}
                          onChange={(e) => setNewAdForm({ ...newAdForm, name: e.target.value })}
                          className="input-field" 
                          style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Verknüpftes Schweizer Unternehmen</label>
                        <select 
                          value={newAdForm.company_id}
                          onChange={(e) => setNewAdForm({ ...newAdForm, company_id: e.target.value })}
                          className="input-field"
                          style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                        >
                          <option value="">Keines (Generische Anzeige)</option>
                          {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.name} (Canton {c.canton})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Banner-Bild-URL (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="https://images.unsplash.com/..."
                          value={newAdForm.image_url}
                          onChange={(e) => setNewAdForm({ ...newAdForm, image_url: e.target.value })}
                          className="input-field" 
                          style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {adModalStep === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>4. Kampagne überprüfen</h3>
                      
                      <div style={{ backgroundColor: '#0D0D0D', padding: '16px', borderRadius: '4px', border: '0.5px solid #2A2A2A', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#888' }}>Kampagnenname:</span>
                          <strong>{newAdForm.name || 'Unbenannt'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#888' }}>Kampagnentyp:</span>
                          <span>{newAdForm.type}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#888' }}>Zone:</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>Zone {newAdForm.position}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Geo-Targeting:</span>
                          <span style={{ color: 'var(--accent-green)' }}>Schweiz Only ✓</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wizard Buttons */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                    {adModalStep > 1 && (
                      <button 
                        type="button" 
                        className="btn btn-gold-outline" 
                        onClick={() => setAdModalStep(adModalStep - 1)}
                        style={{ minHeight: '36px' }}
                      >
                        Zurück
                      </button>
                    )}
                    {adModalStep < 4 ? (
                      <button 
                        type="button" 
                        className="btn btn-gold-fill" 
                        onClick={() => {
                          if (adModalStep === 3 && !newAdForm.name.trim()) {
                            alert('Bitte geben Sie einen Kampagnennamen ein.');
                            return;
                          }
                          setAdModalStep(adModalStep + 1);
                        }}
                        style={{ minHeight: '36px' }}
                      >
                        Weiter <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-gold-fill" 
                        onClick={handleCreateAd}
                        style={{ minHeight: '36px' }}
                      >
                        Kampagne aktivieren
                      </button>
                    )}
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ backgroundColor: 'var(--surface-warm)', border: '0.5px solid var(--light-border)', color: 'var(--text-ink)', minHeight: '36px' }}
                      onClick={() => setShowAddAdModal(false)}
                    >
                      Abbrechen
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 4: TRANSLATION MANAGER */}
        {activeTab === 'translations' && (
          <div>
            {/* Auto Translate Trigger */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', padding: '20px', borderRadius: '6px', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#FFFDF7' }}>DeepL Übersetzungs-Schnittstelle (Mock-API)</strong>
                <p style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>Auto-Übersetzung aller ausstehenden Lokalisierungsfelder in 18 Sprachen per Knopfdruck.</p>
              </div>
              <button 
                className="btn btn-gold-fill" 
                onClick={handleTriggerAutoTranslate} 
                disabled={deepLLoading} 
                style={{ fontSize: '12px', minHeight: '36px', display: 'flex', gap: '8px' }}
              >
                {deepLLoading ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
                Auto-Übersetzung starten
              </button>
            </div>

            {/* Grid list of languages */}
            <div style={{ backgroundColor: '#1A1A1A', border: '0.5px solid #2A2A2A', borderRadius: '6px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', fontFamily: 'Inter, sans-serif', color: '#FFFDF7' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111111', borderBottom: '1px solid #2A2A2A' }}>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Sprache</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Fortschritt (Übersetzte Keys)</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Zuletzt aktualisiert</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {langStats.map(stat => {
                    const lObj = requireLanguageInfo(stat.code);
                    const progressPercent = Math.round(((stat.reviewCount + stat.autoCount) / stat.total) * 100);
                    return (
                      <tr key={stat.code} style={{ borderBottom: '0.5px solid #2A2A2A' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                          <span style={{ marginRight: '8px', fontSize: '16px' }}>{lObj.flag}</span>
                          <span>{lObj.native} ({stat.code.toUpperCase()})</span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '100px', height: '6px', backgroundColor: '#0D0D0D', borderRadius: '3px', overflow: 'hidden' }}>
                              {/* progress bar gold fill */}
                              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary-red)' }} />
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#888' }}>{stat.reviewCount + stat.autoCount} / {stat.total}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#888888' }}>{stat.lastUp}</td>
                        <td style={{ padding: '16px 20px' }}>
                          {stat.status === 'reviewed' && (
                            <span style={{ backgroundColor: 'rgba(74, 103, 65, 0.2)', color: 'var(--accent-green)', padding: '4px 10px', fontSize: '11px', fontWeight: 600, border: '0.5px solid var(--accent-green)' }}>
                              Reviewed
                            </span>
                          )}
                          {stat.status === 'auto-only' && (
                            <span style={{ backgroundColor: 'rgba(191, 155, 48, 0.2)', color: 'var(--primary-red)', padding: '4px 10px', fontSize: '11px', fontWeight: 600, border: '0.5px solid var(--primary-red)' }}>
                              Auto (Amber)
                            </span>
                          )}
                          {stat.status === 'pending' && (
                            <span style={{ backgroundColor: 'rgba(139, 0, 0, 0.2)', color: 'var(--accent-red)', padding: '4px 10px', fontSize: '11px', fontWeight: 600, border: '0.5px solid var(--accent-red)' }}>
                              Outdated (Red)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <button 
                            className="btn btn-gold-outline" 
                            style={{ fontSize: '11px', padding: '6px 12px', minHeight: '32px', display: 'flex', gap: '4px' }}
                            onClick={() => handleOpenLanguageEdit(stat.code)}
                          >
                            <Eye size={12} />
                            Vergleichen
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* TRANSLATION DRAWER (DIFF VIEW SIDE PANEL) */}
            {selectedTransLang && (
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '500px',
                  backgroundColor: '#1A1A1A',
                  borderLeft: '2px solid var(--primary-red)',
                  boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                  zIndex: 9999,
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  boxSizing: 'border-box',
                  color: '#FFFDF7'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid #2A2A2A', paddingBottom: '16px' }}>
                  <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', color: '#FFFDF7', fontWeight: 700 }}>
                    Sprachabgleich: {requireLanguageInfo(selectedTransLang).native}
                  </h3>
                  <button 
                    onClick={() => setSelectedTransLang(null)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#888888' }}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: '12px', color: '#888888', lineHeight: 1.4 }}>
                  Vergleichen Sie den Zieltext direkt mit der englischen Referenzversion.
                </p>

                {/* Diff scroll container */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '8px' }}>
                  {editingTranslations.map(item => {
                    const engText = transList.find(t => t.language_code === 'en' && t.key === item.key)?.translated_text || '';
                    return (
                      <div key={item.key} style={{ backgroundColor: '#0D0D0D', padding: '16px', borderRadius: '4px', border: '0.5px solid #2A2A2A' }}>
                        <span className="mono-data" style={{ fontSize: '11px', color: 'var(--primary-red)', display: 'block', marginBottom: '12px' }}>Schlüssel: {item.key}</span>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <span style={{ fontSize: '10px', color: '#888888', display: 'block', marginBottom: '4px' }}>Referenz (EN)</span>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#FFF' }}>{engText}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '10px', color: '#888888', display: 'block', marginBottom: '4px' }}>Übersetzter Zielwert</span>
                            <input 
                              type="text" 
                              value={item.translated_text}
                              onChange={(e) => handleUpdateTranslationKey(item.key, e.target.value)}
                              className="input-field"
                              style={{ fontSize: '12px', padding: '8px 12px', minHeight: '36px', backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Drawer Actions */}
                <div style={{ borderTop: '0.5px solid #2A2A2A', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                  <button className="btn btn-gold-fill" onClick={handleSaveTranslations} style={{ flex: 1, minHeight: '40px' }}>
                    Änderungen speichern
                  </button>
                  <button className="btn btn-gold-outline" onClick={() => setSelectedTransLang(null)} style={{ minHeight: '40px' }}>
                    Abbrechen
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </main>
      
      <style>{`
        .spin {
          animation: spin-anim 1s infinite linear;
        }
        @keyframes spin-anim {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Utility mapper inside JS module
function requireLanguageInfo(code) {
  const languagesList = [
    { code: 'de', label: 'Deutsch', native: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', native: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', native: 'Italiano', flag: '🇮🇹' },
    { code: 'rm', label: 'Rumantsch', native: 'Rumantsch', flag: '🇨🇭' },
    { code: 'es', label: 'Español', native: 'Español', flag: '🇪🇸' },
    { code: 'pt', label: 'Português', native: 'Português', flag: '🇵🇹' },
    { code: 'ar', label: 'العربية', native: 'العربية', flag: '🇸🇦' },
    { code: 'zh', label: 'Chinese', native: '中文', flag: '🇨🇳' },
    { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
    { code: 'ja', label: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { code: 'tr', label: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
    { code: 'nl', label: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl', label: 'Polish', native: 'Polski', flag: '🇵🇱' },
    { code: 'ko', label: 'Korean', native: '한국어', flag: '🇰🇷' },
    { code: 'sv', label: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
    { code: 'da', label: 'Danish', native: 'Dansk', flag: '🇩🇰' },
    { code: 'fi', label: 'Finnish', native: 'Suomi', flag: '🇫🇮' }
  ];
  return languagesList.find(l => l.code === code) || { code, label: code, native: code, flag: '🌐' };
}
