import React, { useEffect, useState } from 'react';

const STOP_WORDS = new Set(['a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves']);

export default function SeoAnalyzer({ 
  title = '', 
  content = '', 
  focusKeyword = '', 
  metaDescription = '', 
  slug = '' 
}) {
  const [score, setScore] = useState(0);
  const [checks, setChecks] = useState([]);

  useEffect(() => {
    const newChecks = [];
    const kw = focusKeyword.trim().toLowerCase();
    const cleanTitle = title.trim().toLowerCase();
    const cleanContent = content.trim().toLowerCase();
    const cleanMeta = metaDescription.trim().toLowerCase();
    const cleanSlug = slug.trim().toLowerCase();
    
    // Helper to calculate word count
    const words = content.trim() ? content.trim().split(/\s+/) : [];
    const wordCount = words.length;

    // 1. Focus Keyword in Title
    const kwInTitle = kw && cleanTitle.includes(kw);
    newChecks.push({
      id: 'kw-title',
      label: 'Focus Keyword in H1/Title',
      passed: !!kwInTitle,
      desc: kwInTitle ? 'Keyword found in title!' : 'Add the focus keyword to the page title.',
      weight: 10
    });

    // 2. Keyword at start of Title
    const kwAtStartTitle = kw && cleanTitle.startsWith(kw);
    newChecks.push({
      id: 'kw-start-title',
      label: 'Focus Keyword at start of Title',
      passed: !!kwAtStartTitle,
      desc: kwAtStartTitle ? 'Keyword is at the beginning!' : 'Place the focus keyword in the first half of the title.',
      weight: 5
    });

    // 3. Title length check (40-60 characters)
    const titleLengthOk = title.length >= 40 && title.length <= 60;
    newChecks.push({
      id: 'title-len',
      label: 'Title Length (40-60 chars)',
      passed: titleLengthOk,
      desc: `Current title length: ${title.length} characters (Optimal is 40-60).`,
      weight: 8
    });

    // 4. Focus Keyword in Meta Description
    const kwInMeta = kw && cleanMeta.includes(kw);
    newChecks.push({
      id: 'kw-meta',
      label: 'Focus Keyword in Meta Description',
      passed: !!kwInMeta,
      desc: kwInMeta ? 'Keyword found in meta description!' : 'Include your focus keyword in the meta description.',
      weight: 10
    });

    // 5. Meta Description Length (100-160 characters)
    const metaLenOk = metaDescription.length >= 100 && metaDescription.length <= 160;
    newChecks.push({
      id: 'meta-len',
      label: 'Meta Description Length (100-160 chars)',
      passed: metaLenOk,
      desc: `Current meta description: ${metaDescription.length} characters (Optimal is 100-160).`,
      weight: 8
    });

    // 6. Focus Keyword in URL Slug
    const kwInSlug = kw && cleanSlug.includes(kw.replace(/\s+/g, '-'));
    newChecks.push({
      id: 'kw-slug',
      label: 'Focus Keyword in URL Slug',
      passed: !!kwInSlug,
      desc: kwInSlug ? 'Keyword found in URL slug!' : 'Add the focus keyword in the URL slug.',
      weight: 10
    });

    // 7. URL format check (hyphens only, lowercase, under 4 words or 115 chars)
    const slugCleanFormat = slug && !slug.includes('_') && slug === slug.toLowerCase() && slug.length <= 115;
    const slugWords = slug ? slug.split('-').filter(w => !STOP_WORDS.has(w)) : [];
    const hasStopWords = slug ? slug.split('-').some(w => STOP_WORDS.has(w)) : false;
    
    newChecks.push({
      id: 'slug-format',
      label: 'SEO-Friendly URL structure',
      passed: !!(slug && slugCleanFormat && !hasStopWords),
      desc: slug ? (hasStopWords ? 'Remove stop words (e.g. and, in, to, the) from the slug.' : 'URL slug format is clean, lowercase, and contains no underscores.') : 'Provide an SEO-friendly URL slug.',
      weight: 7
    });

    // 8. Keyword in first 100 words of content
    const first100 = words.slice(0, 100).join(' ').toLowerCase();
    const kwInStartContent = kw && first100.includes(kw);
    newChecks.push({
      id: 'kw-start-content',
      label: 'Focus Keyword in first 100 words',
      passed: !!kwInStartContent,
      desc: kwInStartContent ? 'Keyword found in intro!' : 'Make sure the focus keyword appears in the first 100 words.',
      weight: 8
    });

    // 9. Keyword Density Check (0.5% - 2.5%)
    let density = 0;
    if (kw && wordCount > 0) {
      const escapedKw = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const matches = cleanContent.match(new RegExp('\\b' + escapedKw + '\\b', 'g'));
      density = matches ? (matches.length / wordCount) * 100 : 0;
    }
    const densityOk = density >= 0.5 && density <= 2.5;
    newChecks.push({
      id: 'kw-density',
      label: `Keyword Density (${density.toFixed(2)}%)`,
      passed: densityOk,
      desc: densityOk ? 'Density is in the optimal range (0.5% - 2.5%).' : 'Maintain keyword density between 0.5% and 2.5%. Avoid keyword stuffing.',
      weight: 7
    });

    // 10. Content Length / Word Count Check (at least 600 words for deep ranking)
    const wordCountOk = wordCount >= 600;
    newChecks.push({
      id: 'word-count',
      label: `Word Count (${wordCount} words)`,
      passed: wordCountOk,
      desc: wordCountOk ? 'Great content length!' : 'Write at least 600 words to provide deep information authority.',
      weight: 12
    });

    // 11. External & Internal Links check
    const hasExternal = cleanContent.includes('href="http') && !cleanContent.includes('href="https://privatesector') && !cleanContent.includes('href="#');
    const linksTargetBlank = !cleanContent.includes('href="http') || cleanContent.includes('target="_blank"');
    newChecks.push({
      id: 'external-links',
      label: 'Outbound Links set to Open in New Tab',
      passed: hasExternal && linksTargetBlank,
      desc: hasExternal 
        ? (linksTargetBlank ? 'Outbound links configured to open in new tab.' : 'Add target="_blank" to external links to keep users on your site.') 
        : 'Add at least one relevant external outbound link.',
      weight: 7
    });

    // 12. Images and Alt Tags
    const hasImage = cleanContent.includes('<img');
    const hasAltText = hasImage && cleanContent.includes('alt="') && !cleanContent.includes('alt=""');
    newChecks.push({
      id: 'image-seo',
      label: 'Image ALT tags validation',
      passed: !hasImage || hasAltText,
      desc: hasImage ? (hasAltText ? 'Images have alt descriptions!' : 'Add descriptive Alt text to all content images.') : 'Add an image to make the article visually rich.',
      weight: 8
    });

    // Calculate overall score
    const totalWeight = newChecks.reduce((acc, c) => acc + c.weight, 0);
    const passedWeight = newChecks.filter(c => c.passed).reduce((acc, c) => acc + c.weight, 0);
    const finalScore = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 0;
    
    setScore(finalScore);
    setChecks(newChecks);
  }, [title, content, focusKeyword, metaDescription, slug]);

  const getScoreColor = () => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 50) return '#F59E0B'; // Amber
    return 'var(--primary-red)'; // Red
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1.5px solid rgba(213, 43, 30, 0.15)',
      borderRadius: '8px',
      padding: '24px',
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      position: 'sticky',
      top: '120px'
    }}>
      {/* Score Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>RankMath SEO Analyzer</h3>
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Strict SEO Audit Checklist Compliance</span>
        </div>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: getScoreColor() + '10',
          border: `3px solid ${getScoreColor()}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '16px',
          color: getScoreColor()
        }}>
          {score}
        </div>
      </div>

      {/* Checks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
        {checks.map(check => (
          <div key={check.id} style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
            <span style={{ 
              color: check.passed ? '#10B981' : 'var(--primary-red)', 
              fontWeight: 900,
              fontSize: '14px',
              marginTop: '-2px'
            }}>
              {check.passed ? '✓' : '✗'}
            </span>
            <div>
              <strong style={{ display: 'block', color: '#374151', fontWeight: 600 }}>{check.label}</strong>
              <span style={{ color: '#6B7280', fontSize: '11px' }}>{check.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
