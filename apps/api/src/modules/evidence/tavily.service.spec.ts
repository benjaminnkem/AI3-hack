import { ConfigService } from '@nestjs/config';
import { TavilyService } from './tavily.service';
describe('TavilyService', () => {
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
  });

  it('uses the low-latency synchronous defaults', async () => {
    const search = jest.fn().mockResolvedValue({ results: [] });
    const extract = jest.fn();
    const service = new TavilyService(new ConfigService({}), { search, extract });

    await service.search('test query', false);

    expect(search).toHaveBeenCalledWith(
      'test query',
      expect.objectContaining({ searchDepth: 'fast', maxResults: 4, timeout: 15 }),
    );
  });
});
