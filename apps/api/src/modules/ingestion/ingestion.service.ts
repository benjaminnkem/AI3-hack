import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InputType } from '../../entities';
import { TavilyService } from '../evidence/tavily.service';
import { assertPublicUrl } from '../evidence/url-security';
import { GonkaClient } from '../gonka/gonka.client';
import { GonkaResult } from '../gonka/gonka.types';
import { prompts } from '../investigation/prompts';
import { visualSchema } from '../investigation/schemas';
import { StorageService } from '../storage/storage.service';
export interface IngestedInput {
  originalText: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  normalizedContent: string;
  displayText: string;
  imageBlock?: {
    type: 'image';
    source: { type: 'base64'; media_type: 'image/jpeg' | 'image/png' | 'image/webp'; data: string };
  };
  audits: GonkaResult[];
}
@Injectable()
export class IngestionService {
  constructor(
    private readonly tavily: TavilyService,
    private readonly storage: StorageService,
    private readonly gonka: GonkaClient,
    private readonly config: ConfigService,
  ) {}
  async ingest(
    type: InputType,
    content?: string,
    url?: string,
    file?: Express.Multer.File,
  ): Promise<IngestedInput> {
    if (type === InputType.TEXT) {
      const text = this.text(content);
      return {
        originalText: content ?? null,
        sourceUrl: null,
        imageUrl: null,
        normalizedContent: text,
        displayText: text.slice(0, 500),
        audits: [],
      };
    }
    if (type === InputType.URL) {
      if (!url) throw new BadRequestException('url is required');
      const safeUrl = await assertPublicUrl(url);
      let text: string;
      try {
        text = (await this.tavily.extract(safeUrl)).content;
      } catch {
        const fallback = await this.tavily.search(safeUrl, false);
        text = fallback.map((item) => `${item.title}: ${item.excerpt}`).join('\n');
        if (!text) throw new BadRequestException('URL could not be extracted or found');
      }
      return {
        originalText: url,
        sourceUrl: safeUrl,
        imageUrl: null,
        normalizedContent: text,
        displayText: text.slice(0, 500),
        audits: [],
      };
    }
    if (!file) throw new BadRequestException('file is required for IMAGE input');
    const stored = await this.storage.store(file);
    const imageBlock = {
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: stored.mediaType, data: stored.base64 },
    };
    const result = await this.gonka.structured(
      {
        model: this.config.get('GONKA_KIMI_MODEL', 'moonshotai/Kimi-K2.6'),
        system: prompts.visual,
        content: [imageBlock, { type: 'text', text: 'Normalize this image neutrally.' }],
      },
      visualSchema,
    );
    const normalizedContent = `Visible text: ${result.data.visibleText}\nEntities: ${result.data.entities.join(', ')}\nDates: ${result.data.dates.join(', ')}\nNumbers: ${result.data.numbers.join(', ')}\nLogos: ${result.data.logos.join(', ')}\nScene: ${result.data.sceneDescription}`;
    return {
      originalText: null,
      sourceUrl: null,
      imageUrl: stored.url,
      normalizedContent,
      displayText: result.data.visibleText.slice(0, 500),
      imageBlock,
      audits: [result.audit],
    };
  }
  private text(value?: string): string {
    const text = value?.replace(/\r\n?/g, '\n').trim();
    if (!text || text.length > 10000)
      throw new BadRequestException('content must be 1-10000 characters');
    return text;
  }
}
