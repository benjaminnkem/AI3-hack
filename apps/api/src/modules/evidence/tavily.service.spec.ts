import { TavilyService } from './tavily.service';
describe('TavilyService normalization', () =>
  it('deduplicates URL and domain and truncates excerpts', () => {
    const result = TavilyService.normalize({
      requestId: 'r',
      results: [
        {
          title: 'A',
          url: 'https://example.com/a?utm_source=x',
          content: 'x'.repeat(700),
          score: 2,
        },
        { title: 'B', url: 'https://example.com/b', content: 'b', score: 1 },
      ],
    });
    expect(result).toHaveLength(1);
    expect(result[0].relevance).toBe(1);
    expect(result[0].excerpt).toHaveLength(600);
  }));
