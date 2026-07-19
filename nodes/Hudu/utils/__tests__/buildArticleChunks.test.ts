import { describe, it, expect } from 'vitest';
import { buildArticleChunks } from '../markdownUtils';

const baseArticle = {
  id: 7,
  name: 'Guide',
  url: 'https://hudu.example.com/a/guide',
  company_id: 3,
  folder_id: 9,
  updated_at: '2026-07-19T00:00:00Z',
  content: '<h1>Intro</h1><p>a</p><h2>Setup</h2><p>b</p>',
};

describe('buildArticleChunks', () => {
  it('emits one item per heading with flat source metadata', () => {
    const chunks = buildArticleChunks(baseArticle);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toMatchObject({
      chunk_index: 0,
      chunk_count: 2,
      source_type: 'article',
      source_id: 7,
      title: 'Guide',
      url: 'https://hudu.example.com/a/guide',
      company_id: 3,
      folder_id: 9,
    });
  });

  it('carries handler enrichment fields onto every chunk when present', () => {
    const enriched = {
      ...baseArticle,
      company_id_label: 'Acme',
      folder_id_label: 'Onboarding',
      folder_path: 'Acme/Onboarding',
      folder_description: 'New hire docs',
    };
    const chunks = buildArticleChunks(enriched);
    expect(chunks).toHaveLength(2);
    for (const c of chunks) {
      expect(c.company_id_label).toBe('Acme');
      expect(c.folder_id_label).toBe('Onboarding');
      expect(c.folder_path).toBe('Acme/Onboarding');
      expect(c.folder_description).toBe('New hire docs');
    }
  });

  it('does not add enrichment keys when the article was not enriched', () => {
    const [chunk] = buildArticleChunks(baseArticle);
    expect('company_id_label' in chunk).toBe(false);
    expect('folder_path' in chunk).toBe(false);
  });
});
