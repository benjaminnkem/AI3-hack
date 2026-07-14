import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { InputType } from '../../entities';

/**
 * Resolves raw user input into plain text to be fact-checked.
 * - TEXT/TWEET: returned as-is (tweets are already text once pasted).
 * - URL: fetched and stripped to readable text.
 * - IMAGE: expects a base64 data URL; OCR/vision extraction is delegated to a
 *   Gonka vision model. Marked TODO where a dedicated vision route is required.
 */
@Injectable()
export class InputResolverService {
  private readonly logger = new Logger(InputResolverService.name);

  async resolve(inputType: InputType, input: string): Promise<string> {
    switch (inputType) {
      case InputType.TEXT:
      case InputType.TWEET:
        return input;
      case InputType.URL:
        return this.fetchUrl(input);
      case InputType.IMAGE:
        // TODO: route base64 image to a Gonka vision-capable model for OCR/claim
        // extraction once the vision endpoint is confirmed against gonkarouter.io.
        // Until then we reject rather than fabricate extracted text.
        throw new HttpException(
          'Image verification requires a configured Gonka vision model.',
          HttpStatus.NOT_IMPLEMENTED,
        );
      default:
        throw new HttpException('Unsupported input type.', HttpStatus.BAD_REQUEST);
    }
  }

  private async fetchUrl(url: string): Promise<string> {
    try {
      const { data } = await axios.get<string>(url, {
        timeout: 15000,
        headers: { 'User-Agent': 'MeshBot/1.0' },
        responseType: 'text',
      });
      // Strip tags/scripts to leave readable text for claim extraction.
      const text = data
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!text) {
        throw new HttpException(
          'Fetched URL contained no readable text.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return text.slice(0, 12000);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`Failed to fetch URL ${url}`);
      throw new HttpException('Could not fetch the provided URL.', HttpStatus.BAD_GATEWAY);
    }
  }
}
