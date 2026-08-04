import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import RichTextEditor from '../../../shared/components/RichTextEditor';
import RankMathSeoBox from '../../../shared/components/RankMathSeoBox';
import { 
  LayoutDashboard, 
  Files, 
  Tv, 
  Languages, 
  Save, 
  Trash2,
  Edit3,
  Compass,
  Briefcase,
  Mic,
  PlusCircle,
  LogOut,
  Shield
} from 'lucide-react';

export default function Admin({ navigate, onLogout }) {
  const { refreshTranslations } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview'); // overview, pages, ads, translations, news, companies, interviews, jobs
  const [subTab, setSubTab] = useState('all'); // all, categories, tags

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const [blogsExpanded, setBlogsExpanded] = useState(false);
  const [newsExpanded, setNewsExpanded] = useState(false);

  // Verify Admin Session
  const sessionStr = typeof window !== 'undefined' ? localStorage.getItem('userSession') : null;
  const user = sessionStr ? JSON.parse(sessionStr) : null;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Access denied. Admin role required.');
      navigate('/login');
    }
  }, [user, navigate]);

  // Entity Lists State
  const [news, setNews] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [ads, setAds] = useState([]);
  const [, setPages] = useState([]);
  const [, setSelectedPage] = useState(null);
  const [transList, setTransList] = useState([]);
  const [selectedTransLang, setSelectedTransLang] = useState(null);
  const [editingTranslations, setEditingTranslations] = useState([]);

  // Form States for CRUD
  const [editingItem, setEditingItem] = useState(null); // { type, data }
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Schema builder options
  const [schemaType, setSchemaType] = useState('Article');

  const loadPageLayout = useCallback(async (path) => {
    try {
      const res = await fetch(`/api/pages/by-path?path=${encodeURIComponent(path)}`);
      if (res.ok) setSelectedPage(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadTranslationsGrid = useCallback(async () => {
    try {
      const transRes = await fetch('/api/admin/translations');
      if (transRes.ok) setTransList(await transRes.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Load All Entities
  const loadEntities = useCallback(async () => {
    try {
      const resNews = await fetch('/api/news');
      if (resNews.ok) setNews(await resNews.json());

      const resComp = await fetch('/api/companies');
      if (resComp.ok) setCompanies(await resComp.json());

      const resInt = await fetch('/api/interviews');
      if (resInt.ok) setInterviews(await resInt.json());

      const resJobs = await fetch('/api/jobs');
      if (resJobs.ok) setJobs(await resJobs.json());

      const resBlogs = await fetch('/api/blogs');
      if (resBlogs.ok) setBlogs(await resBlogs.json());

      const resAds = await fetch('/api/admin/ads');
      if (resAds.ok) setAds(await resAds.json());

      const pagesRes = await fetch('/api/pages');
      if (pagesRes.ok) {
        const list = await pagesRes.json();
        setPages(list);
        if (list.length > 0) {
          loadPageLayout(list[0].path);
        }
      }

      loadTranslationsGrid();
    } catch (e) {
      console.error(e);
    }
  }, [loadPageLayout, loadTranslationsGrid]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadEntities();
    }
  }, [user, loadEntities]);

  // Handle Schema Auto-generation
  const generateSchema = (type, data) => {
    let schemaObj = {};
    if (type === 'Article') {
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": data.title || "",
        "description": data.meta_description || data.subtitle || "",
        "datePublished": data.date_published || new Date().toISOString().split('T')[0],
        "author": {
          "@type": "Person",
          "name": data.author_name || "Editorial Team"
        }
      };
    } else if (type === 'LocalBusiness') {
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": data.name || "",
        "image": data.logo_bg || "",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": data.canton || "ZH",
          "addressCountry": "CH"
        },
        "industry": data.industry || "B2B"
      };
    } else if (type === 'FAQ') {
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the primary industry of this company?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": data.description || "Swiss enterprise information."
            }
          }
        ]
      };
    }
    return JSON.stringify(schemaObj, null, 2);
  };

  // CRUD Actions
  const handleSaveEntity = async (e) => {
    e.preventDefault();
    const { type, data } = editingItem;
    const isNew = isCreatingNew;
    const url = isNew ? `/api/${type}` : `/api/${type}/${data.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const finalData = { ...data };
      if (!finalData.schema_markup) {
        const generatedType = type === 'companies' ? 'LocalBusiness' : 'Article';
        finalData.schema_markup = generateSchema(generatedType, finalData);
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });

      if (res.ok) {
        alert(`${type.toUpperCase()} saved successfully!`);
        setEditingItem(null);
        setIsCreatingNew(false);
        loadEntities();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Save failed.');
    }
  };

  const handleDeleteEntity = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Deleted successfully.');
        loadEntities();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (type, data) => {
    setEditingItem({ type, data: { ...data } });
    setIsCreatingNew(false);
  };

  const handleCreateClick = (type) => {
    let emptyData = {};
    if (type === 'news') {
      emptyData = { title: '', subtitle: '', category: 'University Perspective', content_body: '', pull_quote: '', tags: [], image_url: '', focus_keyword: '', meta_title: '', meta_description: '', slug: '', schema_markup: '' };
    } else if (type === 'companies') {
      emptyData = { name: '', canton: 'ZH', industry: 'Consumer Goods', size_class: 'Medium', description: '', premium: 0, verified: 0, founded: 2026, employees: 0, revenue_band: 'N/A', website: '', linkedin: '', contact_email: '', about_text: '', structured_data: '{}', focus_keyword: '', meta_title: '', meta_description: '', slug: '', schema_markup: '', tags: [] };
    } else if (type === 'interviews') {
      emptyData = { title: '', subtitle: '', interviewee_name: '', interviewee_title: '', interviewee_avatar: '', company_name: '', read_time_mins: 5, audio_url: '', qa_content: '[]', category: 'Executive Briefing', focus_keyword: '', meta_title: '', meta_description: '', slug: '', schema_markup: '', tags: [] };
    } else if (type === 'jobs') {
      emptyData = { title: '', type: 'Full-time', description: '', company_name: '', location: 'Switzerland', apply_url: '', focus_keyword: '', meta_title: '', meta_description: '', slug: '', schema_markup: '', category: 'Engineering', tags: [] };
    } else if (type === 'blogs') {
      emptyData = { title: '', subtitle: '', category: 'Guides', content_body: '', pull_quote: '', tags: [], image_url: '', focus_keyword: '', meta_title: '', meta_description: '', slug: '', schema_markup: '' };
    }

    setEditingItem({ type, data: emptyData });
    setIsCreatingNew(true);
  };

  // Translations Handlers
  const handleOpenLanguageEdit = (lang) => {
    setSelectedTransLang(lang);
    const items = transList.map(t => ({
      key: t.translation_key,
      translated_text: t[lang] || ''
    }));
    setEditingTranslations(items);
  };

  const handleUpdateTranslationKey = (key, text) => {
    setEditingTranslations(prev => prev.map(item => item.key === key ? { ...item, translated_text: text } : item));
  };

  const handleSaveTranslations = async () => {
    if (!selectedTransLang) return;
    try {
      const res = await fetch('/api/admin/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: selectedTransLang, translations: editingTranslations })
      });
      if (res.ok) {
        alert('Translations grid saved successfully!');
        if (refreshTranslations) refreshTranslations();
        setSelectedTransLang(null);
        loadTranslationsGrid();
      }
    } catch (e) {
      console.error('Translation save failed:', e);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: '64px', textAlign: 'center', backgroundColor: 'var(--bg-ivory)', color: 'var(--text-charcoal)', minHeight: '100vh' }}>
        <h2>Access Denied</h2>
        <p>Admin privileges required.</p>
      </div>
    );
  }

  const getSubtabData = () => {
    const items = activeTab === 'blogs' ? blogs : news;
    if (subTab === 'categories') {
      const counts = {};
      items.forEach(item => {
        const cat = item.category || 'Uncategorized';
        counts[cat] = (counts[cat] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({ name, count }));
    } else if (subTab === 'tags') {
      const counts = {};
      items.forEach(item => {
        let tagList = [];
        try {
          tagList = typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (Array.isArray(item.tags) ? item.tags : []);
        } catch {}
        tagList.forEach(t => {
          counts[t] = (counts[t] || 0) + 1;
        });
      });
      return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }
    return [];
  };

  const isBlogsOpen = activeTab === 'blogs' || blogsExpanded;
  const isNewsOpen = activeTab === 'news' || newsExpanded;

  return (
    <div className="admin-dashboard-container" style={{ display: 'flex', minHeight: 'calc(100vh - 100px)', backgroundColor: 'var(--bg-ivory)', color: 'var(--text-ink)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar Nav */}
      <aside style={{ width: '250px', backgroundColor: 'var(--surface-warm)', borderRight: '1.5px solid var(--light-border)', display: 'flex', flexDirection: 'column', flexShrink: 0, justifyContent: 'space-between' }}>
        <div>
          {/* Admin Header info */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--light-border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--primary-red)' }} /> Admin Console
            </h2>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              Signed in as: <strong style={{ color: 'var(--text-ink)' }}>{user?.email || 'admin@private.com'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 0' }}>
            {[
              { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
              { id: 'blogs', label: 'Blogs', icon: <Files size={18} />, hasSubmenu: true },
              { id: 'news', label: 'News & Articles', icon: <Files size={18} />, hasSubmenu: true },
              { id: 'companies', label: 'Companies', icon: <Compass size={18} /> },
              { id: 'interviews', label: 'Interviews & Podcasts', icon: <Mic size={18} /> },
              { id: 'jobs', label: 'Jobs & Careers', icon: <Briefcase size={18} /> },
              { id: 'ads', label: 'Ads Campaigns', icon: <Tv size={18} /> },
              { id: 'translations', label: 'Translations', icon: <Languages size={18} /> }
            ].map(tab => {
              const isOpen = tab.id === 'blogs' ? isBlogsOpen : (tab.id === 'news' ? isNewsOpen : false);
              return (
                <div 
                  key={tab.id}
                  onMouseEnter={() => tab.id === 'blogs' ? setBlogsExpanded(true) : tab.id === 'news' ? setNewsExpanded(true) : null}
                  onMouseLeave={() => tab.id === 'blogs' ? setBlogsExpanded(false) : tab.id === 'news' ? setNewsExpanded(false) : null}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <button
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSubTab('all');
                      setEditingItem(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 24px',
                      backgroundColor: activeTab === tab.id ? 'var(--primary-red)' : 'transparent',
                      color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-charcoal)',
                      border: 'none',
                      borderLeft: activeTab === tab.id ? '4px solid #000' : '4px solid transparent',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>

                  {/* Submenu for Blogs / News */}
                  {tab.hasSubmenu && isOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.03)', paddingLeft: '44px' }}>
                      {[
                        { id: 'all', label: `— All ${tab.label}` },
                        { id: 'categories', label: '— Categories' },
                        { id: 'tags', label: '— Tags' }
                      ].map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setSubTab(sub.id);
                            setEditingItem(null);
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'transparent',
                            color: (activeTab === tab.id && subTab === sub.id) ? 'var(--primary-red)' : '#666',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: (activeTab === tab.id && subTab === sub.id) ? 700 : 400,
                            textAlign: 'left'
                          }}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Logout */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--light-border)' }}>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'transparent',
              border: '1.5px solid #CBD5E1',
              color: '#0F172A',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {editingItem ? (
          /* Form for Editing or Creating items */
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            <form onSubmit={handleSaveEntity} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #CBD5E1', paddingBottom: '16px' }}>
                <h2 style={{ fontSize: '24px', margin: 0, textTransform: 'capitalize', fontWeight: 800, color: '#0F172A' }}>
                  {isCreatingNew ? 'Create New' : 'Edit'} {editingItem.type}
                </h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setEditingItem(null)} style={{ padding: '8px 16px', backgroundColor: '#F1F5F9', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 20px', backgroundColor: 'var(--primary-red)', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs for different schemas */}
              {(editingItem.type === 'news' || editingItem.type === 'blogs') && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Title *</label>
                      <input type="text" required value={editingItem.data.title || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px', fontWeight: 500 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category *</label>
                      {editingItem.type === 'news' ? (
                        <select value={editingItem.data.category || 'University Perspective'} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px', fontWeight: 500 }}>
                          <option value="University Perspective">University Perspective</option>
                          <option value="Swiss Economics">Swiss Economics</option>
                          <option value="Corporation News">Corporation News</option>
                        </select>
                      ) : (
                        <select value={editingItem.data.category || 'Guides'} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px', fontWeight: 500 }}>
                          <option value="Guides">Guides</option>
                          <option value="Market Trends">Market Trends</option>
                          <option value="Analysis">Analysis</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subtitle / Summary</label>
                    <input type="text" value={editingItem.data.subtitle || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, subtitle: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Featured Image URL</label>
                      <input type="text" value={editingItem.data.image_url || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, image_url: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tags (comma separated)</label>
                      <input 
                        type="text" 
                        value={Array.isArray(editingItem.data.tags) ? editingItem.data.tags.join(', ') : (() => {
                          try {
                            return JSON.parse(editingItem.data.tags || '[]').join(', ');
                          } catch {
                            return typeof editingItem.data.tags === 'string' ? editingItem.data.tags : '';
                          }
                        })()} 
                        onChange={(e) => {
                          const tagsArr = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                          setEditingItem({ ...editingItem, data: { ...editingItem.data, tags: tagsArr } });
                        }} 
                        style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Author Name</label>
                      <input type="text" value={editingItem.data.author_name || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, author_name: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pull Quote (Optional)</label>
                      <input type="text" value={editingItem.data.pull_quote || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, pull_quote: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gutenberg Rich Content Editor *</label>
                    <RichTextEditor 
                      value={editingItem.data.content_body || ''} 
                      onChange={(newHtml) => setEditingItem({ ...editingItem, data: { ...editingItem.data, content_body: newHtml } })} 
                      placeholder="Write your article body content with rich formatting, headings, quotes, and lists..."
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'companies' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Company Name *</label>
                      <input type="text" required value={editingItem.data.name || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Industry *</label>
                      <input type="text" required value={editingItem.data.industry || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, industry: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Canton (2 letters) *</label>
                      <input type="text" required maxLength={2} value={editingItem.data.canton || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, canton: e.target.value.toUpperCase() } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Size Class *</label>
                      <input type="text" required value={editingItem.data.size_class || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, size_class: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Company Overview & Dossier Description *</label>
                    <RichTextEditor 
                      value={editingItem.data.description || ''} 
                      onChange={(newHtml) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: newHtml, about_text: newHtml } })} 
                      placeholder="Write structured company overview, products, key leadership, and market positioning..."
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'interviews' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Title *</label>
                      <input type="text" required value={editingItem.data.title || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</label>
                      <select value={editingItem.data.category || 'Executive Briefing'} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }}>
                        <option value="Executive Briefing">Interview</option>
                        <option value="Podcast">Podcast</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Interviewee / Guest Name</label>
                      <input type="text" value={editingItem.data.interviewee_name || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, interviewee_name: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Audio URL (Podcast)</label>
                      <input type="text" value={editingItem.data.audio_url || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, audio_url: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                  </div>
                </>
              )}

              {editingItem.type === 'jobs' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Job Title *</label>
                      <input type="text" required value={editingItem.data.title || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category *</label>
                      <input type="text" required value={editingItem.data.category || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Job Description & Candidate Requirements *</label>
                    <RichTextEditor 
                      value={editingItem.data.description || ''} 
                      onChange={(newHtml) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: newHtml } })} 
                      placeholder="Specify role expectations, responsibilities, required qualifications, and application instructions..."
                    />
                  </div>
                </>
              )}

              {/* Shared SEO Section */}
              <div style={{ borderTop: '1.5px solid #CBD5E1', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--primary-red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  On-Page SEO & Schema Configuration
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Focus Keyword</label>
                    <input type="text" placeholder="e.g. Swiss B2B Enterprise" value={editingItem.data.focus_keyword || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, focus_keyword: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>URL Slug</label>
                    <input type="text" placeholder="e.g. swiss-b2b-markets" value={editingItem.data.slug || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, slug: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SEO Meta Title</label>
                    <input type="text" value={editingItem.data.meta_title || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, meta_title: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SEO Meta Description</label>
                    <input type="text" value={editingItem.data.meta_description || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, meta_description: e.target.value } })} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                  </div>
                </div>

                {/* Schema Markup Builder */}
                <div style={{ border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '16px', backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Structured Data Schema Generator (JSON-LD)</strong>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select value={schemaType} onChange={(e) => setSchemaType(e.target.value)} style={{ padding: '6px 12px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                        <option value="Article">Article Schema</option>
                        <option value="LocalBusiness">Local Business Schema</option>
                        <option value="FAQ">FAQ Schema</option>
                      </select>
                      <button type="button" onClick={() => setEditingItem({ ...editingItem, data: { ...editingItem.data, schema_markup: generateSchema(schemaType, editingItem.data) } })} style={{ padding: '6px 14px', backgroundColor: 'var(--primary-red)', border: 'none', color: '#FFFFFF', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Generate Schema</button>
                    </div>
                  </div>
                  <textarea rows={5} value={editingItem.data.schema_markup || ''} onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, schema_markup: e.target.value } })} style={{ width: '100%', padding: '12px', backgroundColor: '#0F172A', border: '1.5px solid #334155', color: '#38BDF8', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.5 }} />
                </div>
              </div>
            </form>

            {/* RankMath SEO Analyzer Widget Column */}
            <div>
              <RankMathSeoBox 
                seoData={{
                  focusKeyword: editingItem.data.focus_keyword || '',
                  seoTitle: editingItem.data.meta_title || editingItem.data.title || editingItem.data.name || '',
                  metaDescription: editingItem.data.meta_description || editingItem.data.subtitle || editingItem.data.description || '',
                  slug: editingItem.data.slug || '',
                  content: editingItem.data.content_body || editingItem.data.description || ''
                }}
                onChange={(newSeo) => {
                  setEditingItem({
                    ...editingItem,
                    data: {
                      ...editingItem.data,
                      focus_keyword: newSeo.focusKeyword !== undefined ? newSeo.focusKeyword : editingItem.data.focus_keyword,
                      meta_title: newSeo.seoTitle !== undefined ? newSeo.seoTitle : editingItem.data.meta_title,
                      meta_description: newSeo.metaDescription !== undefined ? newSeo.metaDescription : editingItem.data.meta_description
                    }
                  });
                }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Overview / Dashboards */}
            {activeTab === 'overview' && (
              <div>
                <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', marginBottom: '24px' }}>Administrative Console</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  {[
                    { label: 'Total Articles', val: news.length, color: '#10B981' },
                    { label: 'Companies Listed', val: companies.length, color: '#3B82F6' },
                    { label: 'Interviews & Podcasts', val: interviews.length, color: '#8B5CF6' },
                    { label: 'Active Careers / Jobs', val: jobs.length, color: 'var(--primary-red)' }
                  ].map((stat, idx) => (
                    <div key={idx} className="admin-stat-card" style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', borderLeft: `4px solid ${stat.color}` }}>
                      <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>{stat.label}</span>
                      <h2 style={{ fontSize: '36px', margin: '8px 0 0 0', fontWeight: 800, color: '#0F172A' }}>{stat.val}</h2>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entity management lists */}
            {['blogs', 'news', 'companies', 'interviews', 'jobs'].includes(activeTab) && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', textTransform: 'capitalize' }}>
                    Manage {activeTab} {subTab !== 'all' ? ` > ${subTab}` : ''}
                  </h1>
                  {subTab === 'all' && (
                    <button onClick={() => handleCreateClick(activeTab)} style={{ padding: '10px 20px', backgroundColor: 'var(--primary-red)', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PlusCircle size={18} /> Add New {activeTab.slice(0, -1)}
                    </button>
                  )}
                </div>

                {subTab !== 'all' && ['blogs', 'news'].includes(activeTab) ? (
                  <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-red)', fontSize: '18px', textTransform: 'capitalize', fontWeight: 800 }}>
                      All {subTab} in {activeTab}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                      {getSubtabData().length === 0 ? (
                        <div style={{ color: '#64748B', fontSize: '14px' }}>No {subTab} found.</div>
                      ) : (
                        getSubtabData().map((item, idx) => (
                          <div key={idx} style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '6px', border: '1.5px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.name}</span>
                            <span style={{ fontSize: '12px', backgroundColor: '#E2E8F0', color: '#0F172A', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>{item.count} posts</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {activeTab === 'blogs' && blogs.map(item => (
                    <div key={item.id} className="admin-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
                      <div>
                        <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', fontWeight: 700 }}>{item.title}</strong>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Category: {item.category} | Keyword: {item.focus_keyword || 'None'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleEditClick('blogs', item)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#F1F5F9', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}><Edit3 size={14} /> Edit</button>
                        <button onClick={() => handleDeleteEntity('blogs', item.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: 'transparent', border: '1.5px solid var(--primary-red)', color: 'var(--primary-red)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  ))}
                  
                  {activeTab === 'news' && news.map(item => (
                    <div key={item.id} className="admin-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
                      <div>
                        <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', fontWeight: 700 }}>{item.title}</strong>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Category: {item.category} | Keyword: {item.focus_keyword || 'None'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleEditClick('news', item)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#F1F5F9', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}><Edit3 size={14} /> Edit</button>
                        <button onClick={() => handleDeleteEntity('news', item.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: 'transparent', border: '1.5px solid var(--primary-red)', color: 'var(--primary-red)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'companies' && companies.map(item => (
                    <div key={item.id} className="admin-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
                      <div>
                        <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', fontWeight: 700 }}>{item.name}</strong>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Industry: {item.industry} | Canton: {item.canton}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleEditClick('companies', item)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#F1F5F9', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}><Edit3 size={14} /> Edit</button>
                        <button onClick={() => handleDeleteEntity('companies', item.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: 'transparent', border: '1.5px solid var(--primary-red)', color: 'var(--primary-red)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'interviews' && interviews.map(item => (
                    <div key={item.id} className="admin-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
                      <div>
                        <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', fontWeight: 700 }}>{item.title}</strong>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Category: {item.category} | Guest: {item.interviewee_name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleEditClick('interviews', item)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#F1F5F9', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}><Edit3 size={14} /> Edit</button>
                        <button onClick={() => handleDeleteEntity('interviews', item.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: 'transparent', border: '1.5px solid var(--primary-red)', color: 'var(--primary-red)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'jobs' && jobs.map(item => (
                    <div key={item.id} className="admin-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
                      <div>
                        <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', fontWeight: 700 }}>{item.title}</strong>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Type: {item.type} | Category: {item.category}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleEditClick('jobs', item)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#F1F5F9', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}><Edit3 size={14} /> Edit</button>
                        <button onClick={() => handleDeleteEntity('jobs', item.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: 'transparent', border: '1.5px solid var(--primary-red)', color: 'var(--primary-red)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

            {/* Ads Manager tab */}
            {activeTab === 'ads' && (
              <div>
                <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', marginBottom: '24px' }}>Advertising Manager</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ads.map(ad => (
                    <div key={ad.id} className="admin-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
                      <div>
                        <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', fontWeight: 700 }}>{ad.name}</strong>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Zone: {ad.position} | Impressions: {ad.impressions} | Clicks: {ad.clicks}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Translations tab */}
            {activeTab === 'translations' && (
              <div>
                <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', marginBottom: '24px' }}>Translations Management Grid</h1>
                {selectedTransLang ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Editing Language: {selectedTransLang.toUpperCase()}</h3>
                      <button onClick={handleSaveTranslations} style={{ padding: '10px 20px', backgroundColor: 'var(--primary-red)', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Save Grid Translations</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {editingTranslations.map(item => (
                        <div key={item.key}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>{item.key}</label>
                          <input type="text" value={item.translated_text} onChange={(e) => handleUpdateTranslationKey(item.key, e.target.value)} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '14px' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    {['de', 'fr', 'en', 'ar'].map(lang => (
                      <div key={lang} className="admin-list-item" style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1.5px solid #CBD5E1', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 16px 0', textTransform: 'uppercase', fontWeight: 800, color: '#0F172A' }}>{lang} Language</h4>
                        <button onClick={() => handleOpenLanguageEdit(lang)} style={{ padding: '8px 18px', backgroundColor: '#F1F5F9', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>Edit Translation Grid</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <style>{`
        .admin-dashboard-container input, 
        .admin-dashboard-container select, 
        .admin-dashboard-container textarea {
          background-color: #FFFFFF !important;
          border: 1.5px solid #94A3B8 !important;
          color: #0F172A !important;
          font-weight: 500 !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
        }
        .admin-dashboard-container input:focus, 
        .admin-dashboard-container select:focus, 
        .admin-dashboard-container textarea:focus {
          border-color: var(--primary-red) !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(213, 43, 30, 0.15) !important;
        }
        .admin-dashboard-container label {
          color: #0F172A !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          letter-spacing: 0.03em !important;
        }
        .admin-dashboard-container h1,
        .admin-dashboard-container h2,
        .admin-dashboard-container h3,
        .admin-dashboard-container h4,
        .admin-dashboard-container h5,
        .admin-dashboard-container h6,
        .admin-dashboard-container strong {
          color: #0F172A !important;
        }
        .admin-dashboard-container span {
          color: #334155 !important;
        }
        .admin-dashboard-container .admin-stat-card,
        .admin-dashboard-container .admin-list-item {
          background-color: #FFFFFF !important;
          border: 1.5px solid #CBD5E1 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        }
        .admin-dashboard-container button[style*="backgroundColor: '#222'"] {
          background-color: #F1F5F9 !important;
          border: 1.5px solid #CBD5E1 !important;
          color: #0F172A !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
}
