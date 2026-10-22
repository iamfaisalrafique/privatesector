export function attachNewsBriefings(articles, briefings) {
  const byArticle = new Map();
  for (const briefing of briefings) {
    if (briefing.status !== 'published' || !briefing.audio_url) continue;
    let ids;
    try {
      ids = typeof briefing.linked_articles === 'string'
        ? JSON.parse(briefing.linked_articles)
        : briefing.linked_articles;
    } catch {
      continue;
    }
    if (!Array.isArray(ids)) continue;
    for (const id of new Set(ids.map(String))) {
      if (!byArticle.has(id)) byArticle.set(id, []);
      byArticle.get(id).push({ id: briefing.id, title: briefing.title, audio_url: briefing.audio_url });
    }
  }
  return articles.map(article => ({ ...article, audio_briefings: byArticle.get(String(article.id)) || [] }));
}
