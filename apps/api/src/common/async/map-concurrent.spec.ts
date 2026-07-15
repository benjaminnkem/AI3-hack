import { mapConcurrent } from './map-concurrent';

describe('mapConcurrent', () => {
  it('preserves input order and never exceeds the concurrency bound', async () => {
    let active = 0;
    let peak = 0;

    const result = await mapConcurrent([4, 3, 2, 1], 2, async (value) => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, value));
      active -= 1;
      return value * 2;
    });

    expect(result).toEqual([8, 6, 4, 2]);
    expect(peak).toBe(2);
  });

  it('handles an empty input without invoking the mapper', async () => {
    const mapper = jest.fn();
    await expect(mapConcurrent([], 4, mapper)).resolves.toEqual([]);
    expect(mapper).not.toHaveBeenCalled();
  });
});
