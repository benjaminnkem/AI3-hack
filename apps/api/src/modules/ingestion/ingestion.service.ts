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
import { OcrService } from './ocr.service';

export interface IngestedInput {
  originalText: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  normalizedContent: string;
  displayText: string;
  audits: GonkaResult[];
}

@Injectable()
export class IngestionService {
  constructor(
    private readonly tavily: TavilyService,
    private readonly storage: StorageService,
    private readonly gonka: GonkaClient,
    private readonly ocr: OcrService,
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
    const ocrText = await this.ocr.extractText(file.buffer, stored.mediaType);

    const result = await this.gonka.structured(
      {
        model: this.config.get('GONKA_KIMI_MODEL', 'moonshotai/Kimi-K2.6'),
        maxTokens: this.config.get('GONKA_VISUAL_MAX_TOKENS', 1536),
        system: prompts.visual,
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              mediaType: stored.mediaType,
              ocrText: ocrText || '',
              note: 'Gonka currently rejects native image content blocks. This is OCR text from the uploaded screenshot/image. Normalize neutrally.',
            }),
          },
        ],
      },
      visualSchema,
    );

    const normalizedContent = [
      `Visible text: ${result.data.visibleText || ocrText || '(none detected)'}`,
      `Entities: ${result.data.entities.join(', ') || '(none)'}`,
      `Dates: ${result.data.dates.join(', ') || '(none)'}`,
      `Numbers: ${result.data.numbers.join(', ') || '(none)'}`,
      `Logos: ${result.data.logos.join(', ') || '(none)'}`,
      `Scene: ${result.data.sceneDescription || 'Screenshot/image input processed via OCR transcript.'}`,
      ocrText ? `OCR transcript:\n${ocrText}` : 'OCR transcript: (empty)',
    ].join('\n');

    const displayText = (result.data.visibleText || ocrText || 'Image verification input').slice(
      0,
      500,
    );

    return {
      originalText: null,
      sourceUrl: null,
      imageUrl: stored.url,
      normalizedContent,
      displayText,
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
