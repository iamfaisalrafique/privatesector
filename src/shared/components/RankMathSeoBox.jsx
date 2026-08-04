import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle, AlertTriangle, XCircle, Search, Smartphone, Monitor } from 'lucide-react';

export default function RankMathSeoBox({ seoData, onChange }) {
  const { t } = useLanguage();
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [activeTab, setActiveTab] = useState('snippet');

  const focusKw = (seoData?.focusKeyword || '').toLowerCase().trim();
  const title = (seoData?.seoTitle || '').trim();
  const metaDesc = (seoData?.metaDescription || '').trim();
  const slug = (seoData?.slug || '').trim();
  const content = (seoData?.content || '').replace(/<[^>]*>?/gm, '').trim();

  // Real-time RankMath SEO Analysis Engine
  const seoAnalysis = useMemo(() => {
    const checks = {
      kwInTitle: focusKw ? title.toLowerCase().includes(focusKw) : false,
      kwInSlug: focusKw ? slug.toLowerCase().includes(focusKw) : false,
      kwInDesc: focusKw ? metaDesc.toLowerCase().includes(focusKw) : false,
      kwInIntro: focusKw ? content.slice(0, 300).toLowerCase().includes(focusKw) : false,
      titleLength: title.length >= 35 && title.length <= 60,
      descLength: metaDesc.length >= 100 && metaDesc.length <= 160,
      contentWordCount: content.split(/\s+/).filter(Boolean).length >= 250,
    };

    let score = 0;
    if (checks.kwInTitle) score += 20;
    if (checks.kwInSlug) score += 15;
    if (checks.kwInDesc) score += 15;
    if (checks.kwInIntro) score += 15;
    if (checks.titleLength) score += 15;
    if (checks.descLength) score += 10;
    if (checks.contentWordCount) score += 10;

    return { checks, score };
  }, [focusKw, title, metaDesc, slug, content]);

  const scoreBadge = useMemo(() => {
    const s = seoAnalysis.score;
    if (s >= 80) return { bg: '#10B981', color: '#047857', label: 'Good SEO' };
    if (s >= 50) return { bg: '#F59E0B', color: '#B45309', label: 'Needs Work' };
    return { bg: '#EF4444', color: '#B91C1C', label: 'Poor SEO' };
  }, [seoAnalysis.score]);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '0.5px solid var(--light-border)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '24px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* RankMath Header */}
      <div style={{
        backgroundColor: '#0F172A',
        padding: '12px 16px',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: 'var(--primary-red, #D52B1E)',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            RM
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
              RankMath SEO Live Optimizer
            </h4>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>
              Real-Time Search Engine Snippet & Schema Intelligence
            </span>
          </div>
        </div>

        {/* Score Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#1E293B',
          padding: '4px 10px',
          borderRadius: '20px',
          border: '0.5px solid #334155'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: scoreBadge.bg,
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {seoAnalysis.score}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
              {seoAnalysis.score}/100
            </span>
            <span style={{ fontSize: '9px', color: scoreBadge.bg, fontWeight: 600 }}>
              {scoreBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Control Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '0.5px solid #E2E8F0',
        backgroundColor: '#F8FAFC'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('snippet')}
          style={{
            padding: '10px 16px',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'snippet' ? '2px solid var(--primary-red)' : '2px solid transparent',
            backgroundColor: activeTab === 'snippet' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'snippet' ? 'var(--primary-red)' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Google Snippet Preview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          style={{
            padding: '10px 16px',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'checklist' ? '2px solid var(--primary-red)' : '2px solid transparent',
            backgroundColor: activeTab === 'checklist' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'checklist' ? 'var(--primary-red)' : '#64748B',
            cursor: 'pointer'
          }}
        >
          SEO Audit Checklist
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* TAB 1: Snippet & Metadata */}
        {activeTab === 'snippet' && (
          <div>
            {/* Focus Keyword input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Focus Keyword
              </label>
              <input
                type="text"
                value={seoData?.focusKeyword || ''}
                onChange={(e) => onChange({ focusKeyword: e.target.value })}
                placeholder="e.g. Swiss Private Sector, Nestlé R&D, Financial Technology"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '0.5px solid #CBD5E1',
                  borderRadius: '6px'
                }}
              />
            </div>

            {/* Google SERP Preview Box */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '0.5px solid #E2E8F0',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Google SERP Preview
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '0.5px solid #CBD5E1',
                      backgroundColor: previewDevice === 'desktop' ? '#FFFFFF' : '#F1F5F9',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Monitor size={12} /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '0.5px solid #CBD5E1',
                      backgroundColor: previewDevice === 'mobile' ? '#FFFFFF' : '#F1F5F9',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Smartphone size={12} /> Mobile
                  </button>
                </div>
              </div>

              {/* Snippet Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '14px',
                borderRadius: '6px',
                border: '0.5px solid #E2E8F0',
                maxWidth: previewDevice === 'mobile' ? '360px' : '100%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: '12px', color: '#202124', marginBottom: '2px', wordBreak: 'break-all' }}>
                  https://privatesector.ch/ <span style={{ color: '#5f6368' }}>› {slug || 'dossier'}</span>
                </div>
                <div style={{ fontSize: '18px', color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {title || 'SEO Meta Title Placeholder'}
                </div>
                <div style={{ fontSize: '13px', color: '#4d5156', lineHeight: 1.4 }}>
                  {metaDesc || 'Meta description preview will appear here as you type your article or enterprise summary...'}
                </div>
              </div>
            </div>

            {/* Title & Meta Description Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    SEO Meta Title
                  </label>
                  <span style={{ fontSize: '11px', color: title.length >= 35 && title.length <= 60 ? '#10B981' : '#EF4444' }}>
                    {title.length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={seoData?.seoTitle || ''}
                  onChange={(e) => onChange({ seoTitle: e.target.value })}
                  placeholder="Compelling headline for search engines..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '0.5px solid #CBD5E1',
                    borderRadius: '6px'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Meta Description
                  </label>
                  <span style={{ fontSize: '11px', color: metaDesc.length >= 100 && metaDesc.length <= 160 ? '#10B981' : '#EF4444' }}>
                    {metaDesc.length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={seoData?.metaDescription || ''}
                  onChange={(e) => onChange({ metaDescription: e.target.value })}
                  placeholder="Concise summary for search engine results..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '0.5px solid #CBD5E1',
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Checklist */}
        {activeTab === 'checklist' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              {seoAnalysis.checks.kwInTitle ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
              <span>Focus keyword used in SEO Title</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              {seoAnalysis.checks.kwInSlug ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
              <span>Focus keyword used in URL Slug</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              {seoAnalysis.checks.kwInDesc ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
              <span>Focus keyword inside Meta Description</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              {seoAnalysis.checks.kwInIntro ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
              <span>Focus keyword in first 10% of content</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              {seoAnalysis.checks.titleLength ? <CheckCircle size={16} color="#10B981" /> : <AlertTriangle size={16} color="#F59E0B" />}
              <span>Title length optimal (35 - 60 characters)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              {seoAnalysis.checks.descLength ? <CheckCircle size={16} color="#10B981" /> : <AlertTriangle size={16} color="#F59E0B" />}
              <span>Meta description length optimal (100 - 160 characters)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              {seoAnalysis.checks.contentWordCount ? <CheckCircle size={16} color="#10B981" /> : <AlertTriangle size={16} color="#F59E0B" />}
              <span>Content length is substantial (250+ words)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
