import {
  BadGatewayException,
  Inject,
  Injectable,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tavily } from '@tavily/core';
import { normalizeUrl } from './url-security';

export const TAVILY_CLIENT = Symbol('TAVILY_CLIENT');
export interface TavilyResult {
  title: string;
  url: string;
  canonicalUrl: string;
  domain: string;
  excerpt: string;
  publishedAt: string | null;
  relevance: number;
  requestId: string | null;
}
interface Client {
  search(query: string, options: Record<string, unknown>): Promise<unknown>;
  extract(urls: string | string[], options?: Record<string, unknown>): Promise<unknown>;
}
type SearchWire = {
  requestId?: string;
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    score?: number;
    publishedDate?: string;
  }>;
};
type ExtractWire = { requestId?: string; results?: Array<{ url?: string; rawContent?: string }> };

@Injectable()
export class TavilyService {
  private readonly client: Client | null;
  constructor(
    private readonly config: ConfigService,
    @Optional() @Inject(TAVILY_CLIENT) injected?: Client,
  ) {
    const key = config.get<string>('TAVILY_API_KEY');
    this.client = injected ?? (key ? (tavily({ apiKey: key }) as Client) : null);
  }
  async extract(url: string): Promise<{ content: string; requestId: string | null }> {
    if (!this.client) throw new ServiceUnavailableException('Tavily is not configured');
    try {
      const wire = (await this.client.extract([url], {
        extractDepth: 'advanced',
        format: 'text',
        timeout: 30,
      })) as ExtractWire;
      const content = wire.results?.[0]?.rawContent?.trim();
      if (!content) throw new Error('empty extraction');
      return { content: content.slice(0, 12000), requestId: wire.requestId ?? null };
    } catch {
      throw new BadGatewayException('Tavily URL extraction failed');
    }
  }
  async search(query: string, dateSensitive: boolean): Promise<TavilyResult[]> {
    if (!this.client) throw new ServiceUnavailableException('Tavily is not configured');
    const wire = (await this.client.search(query, {
      searchDepth: this.config.get('TAVILY_SEARCH_DEPTH', 'advanced'),
      topic: dateSensitive ? 'news' : 'general',
      maxResults: this.config.get('TAVILY_MAX_RESULTS_PER_CLAIM', 5),
      chunksPerSource: 1,
      includeAnswer: false,
      includeRawContent: false,
      timeout: 30,
    })) as SearchWire;
    return TavilyService.normalize(wire);
  }
  static normalize(wire: SearchWire): TavilyResult[] {
    const seenDomains = new Set<string>();
    const seenUrls = new Set<string>();
    const output: TavilyResult[] = [];
    for (const item of wire.results ?? []) {
      if (!item.url) continue;
      try {
        const canonicalUrl = normalizeUrl(item.url);
        const domain = new URL(canonicalUrl).hostname.replace(/^www\./, '');
        if (seenUrls.has(canonicalUrl) || seenDomains.has(domain)) continue;
        seenUrls.add(canonicalUrl);
        seenDomains.add(domain);
        output.push({
          title: (item.title ?? domain).slice(0, 500),
          url: item.url,
          canonicalUrl,
          domain,
          excerpt: (item.content ?? '').replace(/\s+/g, ' ').trim().slice(0, 600),
          publishedAt: item.publishedDate ?? null,
          relevance: Math.min(1, Math.max(0, item.score ?? 0)),
          requestId: wire.requestId ?? null,
        });
      } catch {
        continue;
      }
    }
    return output;
  }
}
