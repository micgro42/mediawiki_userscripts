import { describe, it, expect, vi, beforeEach } from 'vitest';
import CachingReadingEntityRepository from '../CachingReadingEntityRepository';

/**
 * @vitest-environment jsdom
 */

describe('CachingReadingEntityRepository', () => {
  beforeEach(() => {
    window['User:Zvpunry'] = null;
  });

  it('requests a new entity via the API', () => {
    const mockEntity = {};
    const api = {
      get: vi.fn().mockResolvedValue({ entities: { Q42: mockEntity } }),
    };
    const repo = new CachingReadingEntityRepository(api);

    const actualEntity = repo.loadEntity('Q42');

    expect(api.get).toHaveBeenCalledWith({
      action: 'wbgetentities',
      ids: ['Q42'],
    });
    expect(actualEntity).resolves.toBe(mockEntity);
  });

  it('caches entities', async () => {
    const mockEntity = {};
    const api = {
      get: vi.fn().mockResolvedValueOnce({ entities: { Q42: mockEntity } }),
    };
    const repo = new CachingReadingEntityRepository(api);

    const actualEntityFirstCall = await repo.loadEntity('Q42');
    const actualEntitySecondCall = await repo.loadEntity('Q42');

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(actualEntitySecondCall).toBe(mockEntity);
    expect(actualEntitySecondCall).toBe(actualEntityFirstCall);
  });
});
