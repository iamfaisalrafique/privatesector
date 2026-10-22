import { ArrowRight, Headphones } from 'lucide-react';
import ArticleAudio from '../../../shared/components/ArticleAudio';
import { getCategoryFallbackImage, handleImageFallback } from '../../../shared/utils/imageFallbacks';
import './HomeNews.css';

function StoryImage({ article, lead = false }) {
  return (
    <img
      src={article.image_url || getCategoryFallbackImage(article.category, lead ? 1000 : 600, article.title)}
      alt={article.title}
      loading={lead ? 'eager' : 'lazy'}
      decoding="async"
      onError={(e) => handleImageFallback(e, article.category, lead ? 1000 : 600, article.title)}
    />
  );
}

function StoryMeta({ article }) {
  return (
    <div className="edition-story-meta">
      <span>{article.category}</span>
      {article.date_published && <time dateTime={article.date_published}>{article.date_published}</time>}
    </div>
  );
}

export default function HomeNews({ articles, navigate }) {
  const [lead, ...remaining] = articles;
  const categories = [...new Set(articles.map(article => article.category).filter(Boolean))];
  const topics = categories.map(category => ({ category, articles: articles.filter(article => article.category === category) }))
    .filter(topic => topic.articles.length >= 2)
    .sort((a, b) => b.articles.length - a.articles.length)
    .slice(0, 3);
  const recordings = [...new Map(articles.flatMap(article => (article.audio_briefings || []).map(briefing => [briefing.id, { article, briefing }]))).values()].slice(0, 2);
  const articleUrl = article => `/news/${article.slug || article.id}`;
  const categoryUrl = category => `/news?category=${encodeURIComponent(category)}`;
  const onNavigate = (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(e.currentTarget.getAttribute('href'));
  };

  return (
    <main className="news-edition container">
      <header className="edition-heading">
        <div>
          <span className="edition-eyebrow">THE PRIVATESECTOR EDITION</span>
          <h1>Latest News &amp; Market Archive</h1>
          <p>Swiss business. Global perspective.</p>
        </div>
        <a className="edition-text-link" href="/news" onClick={onNavigate}>All stories <ArrowRight size={16} /></a>
      </header>

      {lead && (
        <section className="edition-front" aria-label="Leading stories">
          <article className="edition-lead">
            <a className="edition-lead-image" href={articleUrl(lead)} onClick={onNavigate} aria-label={lead.title}>
              <StoryImage article={lead} lead />
            </a>
            <StoryMeta article={lead} />
            <h2><a href={articleUrl(lead)} onClick={onNavigate}>{lead.title}</a></h2>
            <p className="edition-summary">{lead.subtitle}</p>
            <ArticleAudio briefings={lead.audio_briefings} />
            <a className="edition-text-link" href={articleUrl(lead)} onClick={onNavigate}>Read the story <ArrowRight size={16} /></a>
          </article>
          {remaining.length > 0 && (
            <aside className="edition-headlines" aria-labelledby="headlines-heading">
              <h2 id="headlines-heading" className="edition-section-label">IN FOCUS</h2>
              <div className="edition-headline-list">
              {remaining.slice(0, 3).map(article => (
                <article className="edition-headline" key={article.id}>
                  <div>
                    <StoryMeta article={article} />
                    <h3><a href={articleUrl(article)} onClick={onNavigate}>{article.title}</a></h3>
                    {article.read_time_mins > 0 && <span className="edition-read-time">{article.read_time_mins} min read</span>}
                  </div>
                  <a className="edition-headline-image" href={articleUrl(article)} onClick={onNavigate} aria-label={article.title}><StoryImage article={article} /></a>
                </article>
              ))}
              </div>
              <a className="edition-text-link" href="/news" onClick={onNavigate}>Explore the archive <ArrowRight size={16} /></a>
            </aside>
          )}
        </section>
      )}

      {categories.length > 0 && (
        <nav className="edition-topics-nav" aria-label="Explore news topics">
          <span>EXPLORE</span>
          {categories.slice(0, 6).map(category => <a href={categoryUrl(category)} onClick={onNavigate} key={category}>{category}</a>)}
        </nav>
      )}

      {remaining.length > 3 && (
        <section className="edition-section" aria-labelledby="latest-stories-heading">
          <div className="edition-section-heading">
            <h2 id="latest-stories-heading">Latest stories</h2>
            <a className="edition-text-link" href="/news" onClick={onNavigate}>View all <ArrowRight size={16} /></a>
          </div>
          <div className="edition-story-grid">
            {remaining.slice(3, 7).map(article => (
              <article className="edition-card" key={article.id}>
                <a className="edition-card-image" href={articleUrl(article)} onClick={onNavigate} aria-label={article.title}><StoryImage article={article} /></a>
                <StoryMeta article={article} />
                <h3><a href={articleUrl(article)} onClick={onNavigate}>{article.title}</a></h3>
                <p className="edition-summary">{article.subtitle}</p>
                <div className="edition-card-audio"><ArticleAudio briefings={article.audio_briefings} /></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {recordings.length > 0 && (
        <section className="edition-audio" aria-labelledby="audio-desk-heading">
          <div className="edition-audio-heading">
            <Headphones size={24} />
            <span className="edition-eyebrow">READ &amp; LISTEN</span>
            <h2 id="audio-desk-heading">The audio desk</h2>
            <p>Listen to the briefing. Explore the story.</p>
          </div>
          <div className="edition-audio-stories">
            {recordings.map(({ article, briefing }) => (
              <article key={briefing.id}>
                <a className="edition-recording-image" href={articleUrl(article)} onClick={onNavigate} aria-label={article.title}><StoryImage article={article} /></a>
                <ArticleAudio briefings={[briefing]} />
                <a href={articleUrl(article)} onClick={onNavigate}>Read related article <ArrowRight size={14} /></a>
              </article>
            ))}
          </div>
        </section>
      )}

      {topics.length > 0 && (
        <section className="edition-section" aria-labelledby="coverage-heading">
          <div className="edition-section-heading"><h2 id="coverage-heading">Across the sectors</h2><span className="edition-eyebrow">MORE TO EXPLORE</span></div>
          <div className="edition-topic-grid">
            {topics.map(topic => (
              <section className="edition-topic" key={topic.category} aria-label={topic.category}>
                <a className="edition-topic-title" href={categoryUrl(topic.category)} onClick={onNavigate}>{topic.category}<ArrowRight size={16} /></a>
                {topic.articles.slice(0, 3).map((article, index) => (
                  <article className={index === 0 ? 'edition-topic-feature' : 'edition-topic-row'} key={article.id}>
                    <a className="edition-topic-image" href={articleUrl(article)} onClick={onNavigate} aria-label={article.title}><StoryImage article={article} /></a>
                    <div>
                      <h3><a href={articleUrl(article)} onClick={onNavigate}>{article.title}</a></h3>
                      <time dateTime={article.date_published}>{article.date_published}</time>
                    </div>
                  </article>
                ))}
              </section>
            ))}
          </div>
        </section>
      )}

      {!lead && <p className="edition-empty">News will appear here as stories become available. <a href="/news" onClick={onNavigate}>Browse the archive</a></p>}
    </main>
  );
}
