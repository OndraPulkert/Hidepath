import { applyPrepCheck, findPrepCheck, replacePrepCheck } from '@/features/prep/checks';
import { type PrepCheckRecord } from '@/features/prep/types';

const T0 = '2026-10-01T08:00:00.000Z';
const T1 = '2026-10-07T10:00:00.000Z';

const existing: PrepCheckRecord = {
  id: '11111111-1111-4111-8111-111111111111',
  userId: 'user-a',
  projectSlug: 'p',
  lessonSlug: 'l1',
  itemKey: 'mat:voda',
  checked: true,
  createdAt: T0,
  updatedAt: T0,
};

describe('zaškrtnutí přípravy', () => {
  it('nový záznam dostane nové id a časy', () => {
    const r = applyPrepCheck(
      undefined,
      { projectSlug: 'p', lessonSlug: 'l1', itemKey: 'req:x', checked: true },
      'new-id',
      T1,
    );
    expect(r).toEqual({
      id: 'new-id',
      userId: null,
      projectSlug: 'p',
      lessonSlug: 'l1',
      itemKey: 'req:x',
      checked: true,
      createdAt: T1,
      updatedAt: T1,
    });
  });

  it('existující záznam si nechá id, vlastníka a createdAt; odškrtnutí je checked: false', () => {
    const r = applyPrepCheck(
      existing,
      { projectSlug: 'p', lessonSlug: 'l1', itemKey: 'mat:voda', checked: false },
      'ignored',
      T1,
    );
    expect(r).toMatchObject({
      id: existing.id,
      userId: 'user-a',
      checked: false,
      createdAt: T0,
      updatedAt: T1,
    });
  });

  it('updatedAt je pozdější než uložený stav, i když hodiny zařízení jdou pozadu', () => {
    const fromFuture = { ...existing, updatedAt: '2026-10-07T12:10:00.000Z' };
    const r = applyPrepCheck(
      fromFuture,
      { projectSlug: 'p', lessonSlug: 'l1', itemKey: 'mat:voda', checked: false },
      'ignored',
      '2026-10-07T12:05:00.000Z',
    );
    expect(r.updatedAt).toBe('2026-10-07T12:10:00.001Z');
  });

  it('findPrepCheck hledá podle projektu, lekce i položky', () => {
    const other = { ...existing, id: 'x', lessonSlug: 'l2' };
    expect(
      findPrepCheck([other, existing], { projectSlug: 'p', lessonSlug: 'l1', itemKey: 'mat:voda' }),
    ).toBe(existing);
    expect(
      findPrepCheck([existing], { projectSlug: 'q', lessonSlug: 'l1', itemKey: 'mat:voda' }),
    ).toBeUndefined();
  });

  it('replacePrepCheck nahradí záznam se stejným klíčem a ostatní nechá', () => {
    const other = { ...existing, id: 'x', itemKey: 'req:y' };
    const updated = { ...existing, checked: false, updatedAt: T1 };
    expect(replacePrepCheck([existing, other], updated)).toEqual([other, updated]);
    expect(replacePrepCheck([other], updated)).toEqual([other, updated]);
  });
});
