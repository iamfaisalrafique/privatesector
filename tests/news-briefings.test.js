import test from 'node:test';
import assert from 'node:assert/strict';
import { attachNewsBriefings } from '../server/news-briefings.js';

test('only published recordings appear on their linked articles, including older recordings', () => {
  const articles = [{ id: 42, content_body: 'Original article words.' }, { id: 70 }];
  const published = { id: 4, title: 'Related briefing', audio_url: '/uploads/audio/story.mp3', status: 'published' };
  const result = attachNewsBriefings(articles, [
    { ...published, linked_articles: '[42,"42"]' },
    { ...published, id: 3, linked_articles: ['70'] },
    { ...published, status: 'draft', linked_articles: '[42]' },
    { ...published, audio_url: '', linked_articles: '[42]' },
    { ...published, linked_articles: 'invalid JSON' },
    { ...published, linked_articles: 'null' },
    { ...published, linked_articles: '{"id":42}' },
  ]);
  assert.deepEqual(result[0].audio_briefings, [{ id: 4, title: published.title, audio_url: published.audio_url }]);
  assert.equal(result[1].audio_briefings[0].id, 3);
  assert.equal(result[0].content_body, articles[0].content_body);
  assert.equal(articles[0].audio_briefings, undefined);
  assert.deepEqual(attachNewsBriefings([{ id: 99 }], [])[0].audio_briefings, []);
});
