import React, { useState } from 'react';
import { Search, Tag, ArrowRight } from 'lucide-react';

export default function SidebarLayout({ 
  children,
  entityType = 'posts',
  recentItems = [],
  categories = [],
  tags = [],
  selectedCategory = '',
  selectedTag = '',
  onSearch = () => {},
  onSelectCategory = () => {},
  onSelectTag = () => {},
  onItemClick = () => {}
}) {
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: '40px',
      alignItems: 'start'
    }} className="sidebar-grid-layout">
      {/* Main Content Area */}
      <div className="main-content-column">
        {children}
      </div>

      {/* WordPress-style Sidebar Column */}
      <aside className="sidebar-column" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        position: 'sticky',
        top: '120px'
      }}>
        {/* Widget 1: Search */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          padding: '20px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-red)', fontFamily: 'Inter, sans-serif' }}>
            Search {entityType}
          </h4>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', position: 'relative' }}>
            <input 
              type="text" 
              placeholder={`Search...`}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 12px',
                fontSize: '13px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                outline: 'none',
                fontFamily: 'Inter, sans-serif'
              }}
            />
            <button 
              type="submit"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280'
              }}
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Widget 2: Categories */}
        {categories.length > 0 && (
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            padding: '20px'
          }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-red)', fontFamily: 'Inter, sans-serif' }}>
              Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => onSelectCategory('')}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  padding: '6px 0',
                  color: selectedCategory === '' ? 'var(--primary-red)' : '#4B5563',
                  fontWeight: selectedCategory === '' ? 600 : 400,
                  cursor: 'pointer',
                  borderBottom: '0.5px solid #F3F4F6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%'
                }}
              >
                <span>All Categories</span>
              </button>
              {categories.map((cat, idx) => {
                const catName = typeof cat === 'object' ? cat.name : cat;
                const catCount = typeof cat === 'object' ? cat.count : null;
                const isSelected = selectedCategory === catName;

                return (
                  <button
                    key={idx}
                    onClick={() => onSelectCategory(catName)}
                    style={{
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontFamily: 'Inter, sans-serif',
                      padding: '6px 0',
                      color: isSelected ? 'var(--primary-red)' : '#4B5563',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      borderBottom: '0.5px solid #F3F4F6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%'
                    }}
                  >
                    <span>{catName}</span>
                    {catCount !== null && (
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>({catCount})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Widget 3: Tag Cloud */}
        {tags.length > 0 && (
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            padding: '20px'
          }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-red)', fontFamily: 'Inter, sans-serif' }}>
              Tag Cloud
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {tags.map((tag, idx) => {
                const isSelected = selectedTag === tag;
                return (
                  <span
                    key={idx}
                    onClick={() => onSelectTag(isSelected ? '' : tag)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--primary-red)' : '#F3F4F6',
                      color: isSelected ? '#FFFFFF' : '#4B5563',
                      transition: 'all 150ms ease'
                    }}
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Widget 4: Recent Items */}
        {recentItems.length > 0 && (
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            padding: '20px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-red)', fontFamily: 'Inter, sans-serif' }}>
              Recent {entityType}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentItems.slice(0, 5).map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onItemClick(item)}
                  style={{ cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'start' }}
                >
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt="" 
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} 
                    />
                  )}
                  <div>
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 600, color: '#111827', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {item.title || item.name}
                    </h5>
                    <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{item.date_published || item.canton || item.location || 'Swiss B2B'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Widget 5: Premium B2B Newsletter */}
        <div style={{
          backgroundColor: 'var(--primary-red)',
          borderRadius: '6px',
          padding: '24px',
          color: '#FFFFFF'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>
            Swiss Market Newsletter
          </h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '11px', opacity: 0.9, lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
            Get verified B2B analyses, company tax updates, and executive briefing reports direct.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="email" 
              placeholder="Your email address"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '4px',
                outline: 'none',
                color: '#111827',
                fontFamily: 'Inter, sans-serif'
              }}
            />
            <button style={{
              width: '100%',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontFamily: 'Inter, sans-serif'
            }}>
              <span>Subscribe</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
