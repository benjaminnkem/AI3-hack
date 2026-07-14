import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { GonkaClient } from './gonka.client';
import { GonkaTransport } from './gonka.types';
const message = (text: string, id = 'msg_1') =>
  ({
    id,
    type: 'message',
    role: 'assistant',
    model: 'm',
    content: [{ type: 'text', text }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
  }) as never;
describe('GonkaClient', () => {
  it('joins text blocks', () =>
    expect(
      GonkaClient.extractText([
        { type: 'text', text: 'a', citations: null },
        { type: 'text', text: 'b', citations: null },
      ] as never),
    ).toBe('ab'));
  it('repairs malformed structured output once', async () => {
    const create = jest
      .fn()
      .mockResolvedValueOnce({ message: message('{bad') })
      .mockResolvedValueOnce({ message: message('{"value":2}', 'msg_2') });
    const client = new GonkaClient(
      new ConfigService({ NODE_ENV: 'test', GONKA_MAX_TOKENS: 4096, GONKA_MAX_RETRIES: 0 }),
      { create } as GonkaTransport,
    );
    const result = await client.structured(
      { model: 'm', system: 's', content: [{ type: 'text', text: 'x' }] },
      z.object({ value: z.number() }),
    );
    expect(result.data.value).toBe(2);
    expect(result.repaired).toBe(true);
    expect(create).toHaveBeenCalledTimes(2);
  });
});
