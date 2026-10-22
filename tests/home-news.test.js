import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('news homepage handles empty feeds, preserves article text, and links topic and audio sections', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { default: HomeNews } = await server.ssrLoadModule('/src/features/news/views/HomeNews.jsx');
    const render = articles => renderToStaticMarkup(createElement(HomeNews, { articles, navigate: () => {} }));
    const empty = render([]);
    assert.match(empty, /News will appear here/);
    assert.doesNotMatch(empty, /Across the sectors|The audio desk/);

    const articles = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1, slug: `original-story-${i + 1}`, title: `Original headline ${i + 1}`,
      subtitle: `Original subtitle ${i + 1}`, category: i % 2 ? 'Energy & Infrastructure' : 'Swiss Economics',
      date_published: '2026-10-22', image_url: '',
      audio_briefings: i === 8 ? [{ id: 1, title: 'Original briefing title', audio_url: '/uploads/audio/story.mp3' }] : [],
    }));
    const before = JSON.stringify(articles);
    const html = render(articles);
    assert.match(html, /Leading stories/);
    assert.match(html, /IN FOCUS/);
    assert.match(html, /Latest stories/);
    assert.match(html, /Across the sectors/);
    assert.match(html, /The audio desk/);
    assert.match(html, /href="\/news\?category=Energy%20%26%20Infrastructure"/);
    assert.match(html, /src="\/uploads\/audio\/story.mp3"/);
    assert.match(html, /href="\/news\/original-story-9"/);
    assert.match(html, /Original headline 1/);
    assert.match(html, /Original subtitle 1/);
    assert.match(html, /loading="eager"/);
    assert.match(html, /loading="lazy"/);
    const articleCards = [...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)];
    assert.ok(articleCards.length > 10);
    for (const [, card] of articleCards) assert.match(card, /<img\b/, 'Every article card must include an image, even when image_url is empty');
    assert.equal(JSON.stringify(articles), before);
    const single = render(articles.slice(0, 1));
    assert.doesNotMatch(single, /IN FOCUS|Latest stories|Across the sectors|The audio desk/);
    const { default: SidebarLayout } = await server.ssrLoadModule('/src/shared/components/SidebarLayout.jsx');
    const sidebar = renderToStaticMarkup(createElement(SidebarLayout, { recentItems: [articles[0]] }));
    assert.match(sidebar, /<img[^>]*alt="Original headline 1"/);
  } finally {
    await server.close();
  }
});
