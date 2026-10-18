import { obratWalletProject } from './project';
import { lessonBodies } from './lesson-bodies';
import { projectDefinitionSchema } from '@/content/schema';
import { findProject } from '@/content/projects';
import { patternSheetUrlsFor } from '@/content/projects/pattern-sheets';
import { equipmentCatalog } from '@/content/equipment';

describe('OBRAT R09 v aplikaci', () => {
  it('má platné schéma, registraci, těla lekcí a oba listy', () => {
    expect(projectDefinitionSchema.safeParse(obratWalletProject)).toMatchObject({ success: true });
    expect(findProject('obrat-wallet')).toBe(obratWalletProject);
    expect(Object.keys(lessonBodies).sort()).toEqual(
      obratWalletProject.lessons.map((l) => l.slug).sort(),
    );
    const urls = patternSheetUrlsFor('obrat-wallet');
    for (const sheet of obratWalletProject.patternSheets!.sheets)
      expect(urls[sheet.id]).toBeTruthy();
    for (const e of obratWalletProject.equipment)
      expect(equipmentCatalog[e.equipmentSlug]).toBeDefined();
  });

  it('každé vybavení lekce je v projektu a záznamy mají jedinečná id', () => {
    const inProject = new Set(obratWalletProject.equipment.map((e) => e.equipmentSlug));
    const ids: string[] = [];
    for (const lesson of obratWalletProject.lessons) {
      for (const slug of [...lesson.requiredEquipment, ...lesson.recommendedEquipment])
        expect(inProject.has(slug)).toBe(true);
      for (const step of lesson.steps) ids.push(...(step.records ?? []).map((r) => r.id));
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tělo se řeže až po zkoušce mincovního modulu a prototyp zůstává neověřený', () => {
    const slugs = obratWalletProject.lessons.map((l) => l.slug);
    const body = obratWalletProject.lessons.find((l) => l.slug === '07-body-parts')!;
    expect(body.prerequisiteLessons).toEqual(['06-coin-module']);
    expect(slugs.indexOf('06-coin-module')).toBeLessThan(slugs.indexOf('07-body-parts'));
    expect(obratWalletProject.difficulty).toBe('development');
    expect(obratWalletProject.description).toContain('prototyp zatím nikdo neušil');
  });

  it('připomínky odkazují na existující zápisy z dřívějších lekcí', () => {
    const seen = new Set<string>();
    for (const lesson of obratWalletProject.lessons)
      for (const step of lesson.steps) {
        for (const r of step.recalls ?? []) expect(seen.has(r.fieldId)).toBe(true);
        for (const r of step.records ?? []) seen.add(r.id);
      }
  });
});
