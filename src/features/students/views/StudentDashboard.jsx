import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { LayoutDashboard, UserCheck, BookOpen, PlusCircle, Save, CheckCircle, ArrowLeft } from 'lucide-react';

export default function StudentDashboard({ studentId, navigate }) {
  const { t, isRtl } = useLanguage();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard tab state: 'overview' | 'edit-profile' | 'write-article'
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [bio, setBio] = useState('');
  const [university, setUniversity] = useState('');
  const [studyField, setStudyField] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);

  // New experience form inputs
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  // New skill input
  const [newSkill, setNewSkill] = useState('');

  // Write article state
  const [artTitle, setArtTitle] = useState('');
  const [artSub, setArtSub] = useState('');
  const [artBody, setArtBody] = useState('');
  const [artQuote, setArtQuote] = useState('');
  const [artCategory, setArtCategory] = useState('University Perspective');
  const [artImage, setArtImage] = useState('');
  const [artTags, setArtTags] = useState('');

  // Feedback notifications
  const [notification, setNotification] = useState('');

  useEffect(() => {
    async function loadStudent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/students/${studentId}`);
        if (res.ok) {
          const data = await res.json();
          setStudent(data);
          setBio(data.bio || '');
          setUniversity(data.university || '');
          setStudyField(data.study_field || '');
          setGradYear(data.grad_year || '');
          setEmail(data.email || '');
          setPhone(data.phone_number || '');
          setBirthDate(data.birth_date || '');
          setPortfolioUrl(data.portfolio_url || '');
          setAvatar(data.avatar || '');
          
          try {
            setSkills(JSON.parse(data.skills || '[]'));
          } catch(e) { setSkills([]); }

          try {
            setExperience(JSON.parse(data.experience || '[]'));
          } catch(e) { setExperience([]); }
        }
      } catch (e) {
        console.error('Error loading student profile for dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    if (studentId) loadStudent();
  }, [studentId]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          university,
          study_field: studyField,
          grad_year: gradYear,
          email,
          phone_number: phone,
          birth_date: birthDate,
          skills,
          experience,
          portfolio_url: portfolioUrl,
          avatar
        })
      });
      if (res.ok) {
        showNotification('Profile updated successfully! 🚀');
        // Refresh local student state
        setStudent({
          ...student,
          bio,
          university,
          study_field: studyField,
          grad_year: gradYear,
          email,
          phone_number: phone,
          birth_date: birthDate,
          skills: JSON.stringify(skills),
          experience: JSON.stringify(experience),
          portfolio_url: portfolioUrl,
          avatar
        });
        setActiveTab('overview');
      } else {
        showNotification('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      showNotification('Server error during update.');
    }
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!newRole || !newCompany || !newDuration) return;
    const item = { role: newRole, company: newCompany, duration: newDuration, description: newDesc };
    setExperience([...experience, item]);
    setNewRole('');
    setNewCompany('');
    setNewDuration('');
    setNewDesc('');
  };

  const handleRemoveExperience = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillName) => {
    setSkills(skills.filter(s => s !== skillName));
  };

  const handlePublishArticle = async (e) => {
    e.preventDefault();
    if (!artTitle || !artSub || !artBody) {
      showNotification('Please fill title, subtitle, and body.');
      return;
    }
    try {
      const tagsArray = artTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: artTitle,
          subtitle: artSub,
          category: artCategory,
          author_name: student.name,
          author_avatar: student.avatar,
          content_body: artBody,
          pull_quote: artQuote,
          tags: tagsArray,
          image_url: artImage,
          student_author_id: parseInt(studentId)
        })
      });
      if (res.ok) {
        showNotification('Article published successfully! 🎉');
        // Reset article inputs
        setArtTitle('');
        setArtSub('');
        setArtBody('');
        setArtQuote('');
        setArtImage('');
        setArtTags('');
        
        // Refresh student articles/news state by re-fetching
        const refreshRes = await fetch(`/api/students/${studentId}`);
        if (refreshRes.ok) setStudent(await refreshRes.json());
        
        setActiveTab('overview');
      } else {
        showNotification('Failed to publish article.');
      }
    } catch (err) {
      console.error(err);
      showNotification('Server error during publication.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: 'var(--primary-red)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: 'var(--text-charcoal)' }}>{t('Loading dashboard...', 'Loading dashboard...')}</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', color: 'var(--text-ink)', marginBottom: '16px' }}>{t('Student Profile Not Found', 'Student Profile Not Found')}</h2>
        <button className="btn btn-gold-fill" onClick={() => navigate('/karriere')}>{t('Go to Careers Center', 'Go to Careers Center')}</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '40px 0 64px' }}>
      <div className="container">
        
        {/* Floating Notification */}
        {notification && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#1A1A1A', color: '#FFFDF7', padding: '16px 24px', borderRadius: '4px', borderLeft: '4px solid var(--primary-red)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} style={{ color: 'var(--primary-red)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{notification}</span>
          </div>
        )}

        {/* Dashboard Header Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A0A0A', color: '#FFFDF7', padding: '32px', borderRadius: '6px', borderBottom: '1.5px solid rgba(191,155,48,0.3)', marginBottom: '32px' }}>
          <div>
            <span style={{ color: 'var(--primary-red)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{t('Student Talent Hub', 'Student Talent Hub')}</span>
            <h1 style={{ fontSize: '28px', fontFamily: '"Playfair Display", serif', margin: '4px 0 0' }}>{t('Welcome, {name}!', 'Welcome, {name}!').replace('{name}', student.name)}</h1>
          </div>
          <button className="btn btn-gold-fill" onClick={() => navigate(`/student/${studentId}`)}>
            <ArrowLeft size={14} style={{ marginRight: '6px' }} /> {t('View Public Profile', 'View Public Profile')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px' }} className="student-dashboard-layout">
          
          {/* Navigation Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('overview')} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', border: 'none', background: activeTab === 'overview' ? '#1A1A1A' : 'none', color: activeTab === 'overview' ? '#FFFDF7' : 'var(--text-ink)', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
            >
              <LayoutDashboard size={16} /> {t('Overview', 'Overview')}
            </button>
            <button 
              onClick={() => setActiveTab('edit-profile')} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', border: 'none', background: activeTab === 'edit-profile' ? '#1A1A1A' : 'none', color: activeTab === 'edit-profile' ? '#FFFDF7' : 'var(--text-ink)', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
            >
              <UserCheck size={16} /> {t('Edit Profile (LinkedIn Style)', 'Edit Profile (LinkedIn Style)')}
            </button>
            <button 
              onClick={() => setActiveTab('write-article')} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', border: 'none', background: activeTab === 'write-article' ? '#1A1A1A' : 'none', color: activeTab === 'write-article' ? '#FFFDF7' : 'var(--text-ink)', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
            >
              <BookOpen size={16} /> {t('Write Business Article', 'Write Business Article')}
            </button>
          </div>

          {/* Central Workspace */}
          <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', borderRadius: '6px', padding: '32px' }}>
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: '20px', fontFamily: '"Playfair Display", serif', fontWeight: 700, borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px', marginBottom: '24px' }}>{t('Dossier Overview', 'Dossier Overview')}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  <div style={{ backgroundColor: 'var(--bg-ivory)', border: '0.5px solid var(--light-border)', padding: '24px', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-charcoal)', textTransform: 'uppercase', fontWeight: 600 }}>{t('Articles Written', 'Articles Written')}</span>
                    <strong style={{ display: 'block', fontSize: '32px', color: 'var(--primary-red)', marginTop: '8px' }}>{student.articles ? student.articles.length : 0}</strong>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-ivory)', border: '0.5px solid var(--light-border)', padding: '24px', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-charcoal)', textTransform: 'uppercase', fontWeight: 600 }}>{t('Podcasts & Briefings', 'Podcasts & Briefings')}</span>
                    <strong style={{ display: 'block', fontSize: '32px', color: 'var(--primary-red)', marginTop: '8px' }}>{student.podcasts ? student.podcasts.length : 0}</strong>
                  </div>
                </div>

                <h4 style={{ fontSize: '16px', fontFamily: '"Playfair Display", serif', fontWeight: 700, marginBottom: '16px' }}>{t('My Published Pieces', 'My Published Pieces')}</h4>
                {(!student.articles || student.articles.length === 0) ? (
                  <p style={{ fontStyle: 'italic', color: 'var(--text-charcoal)', fontSize: '13px' }}>{t("You haven't published any articles yet. Navigate to 'Write Business Article' to get started!", "You haven't published any articles yet. Navigate to 'Write Business Article' to get started!")}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {student.articles.map(art => (
                      <div key={art.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '0.5px solid var(--light-border)', borderRadius: '4px' }}>
                        <div>
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--primary-red)', fontWeight: 600 }}>{t(art.category, art.category)}</span>
                          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-ink)', marginTop: '2px' }}>{t(art.title, art.title)}</strong>
                        </div>
                        <button className="btn btn-gold-fill" style={{ fontSize: '11px', padding: '6px 12px', minHeight: '32px' }} onClick={() => navigate(`/news/${art.id}`)}>{t('View Article', 'View Article')}</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EDIT PROFILE TAB */}
            {activeTab === 'edit-profile' && (
              <form onSubmit={handleProfileSave}>
                <h3 style={{ fontSize: '20px', fontFamily: '"Playfair Display", serif', fontWeight: 700, borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px', marginBottom: '24px' }}>{t('Edit Profile (LinkedIn Style)', 'Edit Profile (LinkedIn Style)')}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }} className="edit-form-grid">
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('University', 'University')}</label>
                    <input type="text" value={university} onChange={e => setUniversity(e.target.value)} className="input-field" required />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Field of Study', 'Field of Study')}</label>
                    <input type="text" value={studyField} onChange={e => setStudyField(e.target.value)} className="input-field" required />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Graduation Year', 'Graduation Year')}</label>
                    <input type="number" value={gradYear} onChange={e => setGradYear(e.target.value)} className="input-field" required />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Portfolio URL', 'Portfolio URL')}</label>
                    <input type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Avatar Image URL', 'Avatar Image URL')}</label>
                    <input type="url" value={avatar} onChange={e => setAvatar(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Email', 'Email')}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Phone Number', 'Phone Number')}</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Birth Date', 'Birth Date')}</label>
                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="input-field" />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Bio / Summary', 'Bio / Summary')}</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} className="input-field" style={{ minHeight: '120px', resize: 'vertical' }} required />
                </div>

                {/* Skills Sector */}
                <div style={{ marginBottom: '32px', borderTop: '0.5px solid var(--light-border)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontFamily: '"Playfair Display", serif', fontWeight: 700, marginBottom: '12px' }}>{t('Skills & Endorsements', 'Skills & Endorsements')}</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {skills.map(s => (
                      <span key={s} style={{ backgroundColor: 'var(--bg-ivory)', border: '0.5px solid var(--light-border)', padding: '6px 12px', borderRadius: '16px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {t(s, s)}
                        <button type="button" onClick={() => handleRemoveSkill(s)} style={{ border: 'none', background: 'none', color: 'var(--primary-red)', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder={t('Add a skill...', 'Add a skill...')} className="input-field" style={{ maxWidth: '240px' }} />
                    <button type="button" onClick={handleAddSkill} className="btn btn-gold-fill" style={{ fontSize: '12px', minHeight: '44px' }}>{t('Add', 'Add')}</button>
                  </div>
                </div>

                {/* Experience Sector */}
                <div style={{ marginBottom: '32px', borderTop: '0.5px solid var(--light-border)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontFamily: '"Playfair Display", serif', fontWeight: 700, marginBottom: '16px' }}>{t('Experience & Projects', 'Experience & Projects')}</h4>
                  
                  {experience.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                      {experience.map((exp, idx) => (
                        <div key={idx} style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', padding: '16px', position: 'relative' }}>
                          <button type="button" onClick={() => handleRemoveExperience(idx)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', color: 'var(--primary-red)', cursor: 'pointer', fontWeight: 700 }}>{t('Remove', 'Remove')}</button>
                          <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text-ink)' }}>{t(exp.role, exp.role)}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--primary-red)', fontWeight: 600, display: 'block', marginTop: '2px' }}>{t(exp.company, exp.company)} · {t(exp.duration, exp.duration)}</span>
                          {exp.description && <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', margin: '8px 0 0', lineHeight: 1.5 }}>{t(exp.description, exp.description)}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', padding: '20px', backgroundColor: 'var(--bg-ivory)' }}>
                    <h5 style={{ fontSize: '13px', margin: '0 0 16px', textTransform: 'uppercase', color: 'var(--text-charcoal)' }}>{t('Add Experience', 'Add Experience')}</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      <input type="text" value={newRole} onChange={e => setNewRole(e.target.value)} placeholder={t('Role (e.g. Intern)', 'Role (e.g. Intern)')} className="input-field" />
                      <input type="text" value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder={t('Company / University project', 'Company / University project')} className="input-field" />
                      <input type="text" value={newDuration} onChange={e => setNewDuration(e.target.value)} placeholder={t('Duration (e.g. 3 months)', 'Duration (e.g. 3 months)')} className="input-field" />
                    </div>
                    <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder={t('Description...', 'Description...')} className="input-field" style={{ minHeight: '80px', marginBottom: '16px', resize: 'vertical' }} />
                    <button type="button" onClick={handleAddExperience} className="btn btn-gold-fill" style={{ fontSize: '12px', minHeight: '36px' }}>{t('Add Experience', 'Add Experience')}</button>
                  </div>
                </div>

                <button type="submit" className="btn btn-gold-fill" style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
                  <Save size={16} /> {t('Save Changes', 'Save Changes')}
                </button>
              </form>
            )}

            {/* WRITE ARTICLE TAB */}
            {activeTab === 'write-article' && (
              <form onSubmit={handlePublishArticle}>
                <h3 style={{ fontSize: '20px', fontFamily: '"Playfair Display", serif', fontWeight: 700, borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px', marginBottom: '24px' }}>{t('Compose Business Article', 'Compose Business Article')}</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Title', 'Title')}</label>
                  <input type="text" value={artTitle} onChange={e => setArtTitle(e.target.value)} placeholder={t('Swiss watch exports reach historic heights...', 'Swiss watch exports reach historic heights...')} className="input-field" required />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Subtitle', 'Subtitle')}</label>
                  <input type="text" value={artSub} onChange={e => setArtSub(e.target.value)} placeholder={t('Brief summary teaser...', 'Brief summary teaser...')} className="input-field" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="edit-form-grid">
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Category', 'Category')}</label>
                    <select value={artCategory} onChange={e => setArtCategory(e.target.value)} className="input-field" style={{ height: '44px' }}>
                      <option value="University Perspective">{t('University Perspective', 'University Perspective')}</option>
                      <option value="Executive Briefing">{t('Executive Briefing', 'Executive Briefing')}</option>
                      <option value="Street Briefing">{t('Street Briefing', 'Street Briefing')}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Image URL', 'Image URL')}</label>
                    <input type="url" value={artImage} onChange={e => setArtImage(e.target.value)} placeholder={t('Unsplash image URL...', 'Unsplash image URL...')} className="input-field" />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Tags (Comma separated)', 'Tags (Comma separated)')}</label>
                  <input type="text" value={artTags} onChange={e => setArtTags(e.target.value)} placeholder={t('Rolex, Richemont, ESG', 'Rolex, Richemont, ESG')} className="input-field" />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Pull Quote (Featured text highlight)', 'Pull Quote (Featured text highlight)')}</label>
                  <input type="text" value={artQuote} onChange={e => setArtQuote(e.target.value)} placeholder={t('Pull quote highlight...', 'Pull quote highlight...')} className="input-field" />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('Body Content', 'Body Content')}</label>
                  <textarea value={artBody} onChange={e => setArtBody(e.target.value)} className="input-field" style={{ minHeight: '300px', fontFamily: 'Georgia, serif', fontSize: '15px', lineHeight: 1.6, resize: 'vertical' }} required />
                </div>

                <button type="submit" className="btn btn-gold-fill" style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
                  <PlusCircle size={16} /> {t('Publish Article', 'Publish Article')}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .student-dashboard-layout {
            grid-template-columns: 1fr !important;
          }
          .edit-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
