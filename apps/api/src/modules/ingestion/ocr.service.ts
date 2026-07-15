import { Injectable, Logger } from '@nestjs/common';
import Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    try {
      const result = await Tesseract.recognize(buffer, 'eng', {
        logger: () => undefined,
      });
      const text = (result.data.text || '').replace(/\r\n?/g, '\n').trim();
      this.logger.log(
        JSON.stringify({
          event: 'ocr.complete',
          mimeType,
          chars: text.length,
          confidence: result.data.confidence,
        }),
      );
      return text;
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'ocr.failed',
          mimeType,
          message: error instanceof Error ? error.message : String(error),
        }),
      );
      return '';
    }
  }
}
