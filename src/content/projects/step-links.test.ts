import { projects } from '@/content/projects';
import { beltProject } from '@/content/projects/belt/project';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { projectDefinitionSchema } from '@/content/schema';

const allSteps = projects.flatMap((p) =>
  p.lessons.flatMap((l) => l.steps.map((s) => ({ project: p, lesson: l, step: s }))),
);
const where = (x: (typeof allSteps)[number]) => `${x.project.slug}/${x.lesson.slug}/${x.step.id}`;
const hasLink = (x: (typeof allSteps)[number]) =>
  x.step.printLink !== undefined || (x.step.appLinks?.length ?? 0) > 0;

describe('odkazy z kroků na stránky aplikace (všechny projekty)', () => {
  it('„(odkaz pod krokem)“ v textu = pod krokem opravdu odkaz je', () => {
    for (const x of allSteps.filter((x) => x.step.body.includes('odkaz pod krokem'))) {
      expect(hasLink(x), where(x)).toBe(true);
    }
  });

  it('krok, který posílá na stránku aplikace, má pod sebou odkaz a říká to', () => {
    const sendsToPage =
      /(na stránce|na stránku) (Listy střihu|Cvičné listy)|ve „Váš pásek“|ve formuláři „Váš pásek“|vytiskněte (novou|list znovu|list 1 pro|list 2 pro)/;
    const missing = allSteps
      .filter((x) => sendsToPage.test(x.step.body))
      .filter((x) => !hasLink(x) || !x.step.body.includes('odkaz pod krokem'))
      .map(where);
    expect(missing).toEqual([]);
  });

  it('schéma odmítne odkaz na stránku, kterou projekt nemá, a opakovaný odkaz', () => {
    const withStep = (patch: object) => ({
      ...cardHolderProject,
      lessons: cardHolderProject.lessons.map((l, i) =>
        i === 0 ? { ...l, steps: l.steps.map((s, j) => (j === 0 ? { ...s, ...patch } : s)) } : l,
      ),
    });
    const issues = (patch: object) => {
      const r = projectDefinitionSchema.safeParse(withStep(patch));
      return r.success ? [] : r.error.issues.map((i) => i.message);
    };
    expect(issues({ appLinks: [{ to: 'shopping', label: 'Co koupit' }] })).toEqual([]);
    expect(issues({ appLinks: [{ to: 'belt-config', label: 'Váš pásek' }] })).toEqual([
      expect.stringMatching(/odkaz belt-config vede na stránku, kterou projekt nemá/),
    ]);
    expect(
      issues({
        appLinks: [
          { to: 'shopping', label: 'A' },
          { to: 'shopping', label: 'B' },
        ],
      }),
    ).toEqual([expect.stringMatching(/opakuje/)]);
    expect(issues({ beltRecalls: ['width'] })).toEqual([
      expect.stringMatching(/beltRecalls má jen projekt s „Váš pásek“/),
    ]);
    expect(issues({ appLinks: [{ to: 'nekam', label: 'X' }] }).length).toBeGreaterThan(0);
  });

  it('pásek: všechny odkazy na „Váš pásek“ jsou v projektu s formulářem', () => {
    const r = projectDefinitionSchema.safeParse(beltProject);
    expect(r.success).toBe(true);
    const targets = beltProject.lessons.flatMap((l) =>
      l.steps.flatMap((s) => (s.appLinks ?? []).map((a) => a.to)),
    );
    expect(targets).toContain('belt-config');
    expect(targets).toContain('shopping');
  });
});
