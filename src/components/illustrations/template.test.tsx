import { routes } from '@/app/routes';
import { TEMPLATE_PRINT_MARGIN_MM, templateSheetLayout } from '@/components/illustrations/template';
import { projects } from '@/content/projects';
import { renderApp } from '@/test/render';

/** A4 na výšku, tiskárna HP DeskJet 2700 netiskne 12,7 mm u spodní hrany: okraj aspoň 13 mm. */
const A4 = { widthMm: 210, heightMm: 297 };
const SAFE_MM = 13;
/** Nadpis a poznámka k tisku nad šablonou na téže stránce (18 pt + 5 řádků 10 pt + mezery). */
const PAGE_HEADER_MM = 45;

/**
 * Odhad rozsahu textu, záměrně spíš větší: neproporcionální písmo má 0,6 velikosti na znak,
 * Albert Sans / system-ui tučně do 0,6; nad účařím nejvýš háček nad velkým písmenem.
 */
const CHAR_EM = { mono: 0.62, sans: 0.66 } as const;

const withTemplate = projects.filter((p) => p.template);

describe.each(withTemplate.flatMap((p) => [true, false].map((legend) => ({ p, legend }))))(
  'šablona $p.title (legenda $legend) se vejde do bezpečného okraje 13 mm',
  ({ p, legend }) => {
    const layout = templateSheetLayout(p.template!, legend);
    const items = [
      ...layout.boxes,
      ...layout.texts.map((t) => ({
        what: t.text,
        x0: t.x,
        y0: t.y - 0.95 * t.sizeMm,
        x1: t.x + t.text.length * t.sizeMm * CHAR_EM[t.font],
        y1: t.y + 0.25 * t.sizeMm,
      })),
    ];

    it('každý díl, značka, text, legenda i kontrolní úsečka leží uvnitř SVG', () => {
      const outside = items.filter(
        (b) => b.x0 < 0 || b.y0 < 0 || b.x1 > layout.width || b.y1 > layout.height,
      );
      expect(outside.map((b) => b.what)).toEqual([]);
    });

    it('SVG se vejde do tiskové plochy A4 bez okraje 13 mm, i s nadpisem nad ním', () => {
      expect(TEMPLATE_PRINT_MARGIN_MM).toBeGreaterThanOrEqual(SAFE_MM);
      expect(layout.width).toBeLessThanOrEqual(A4.widthMm - 2 * TEMPLATE_PRINT_MARGIN_MM);
      expect(layout.height + PAGE_HEADER_MM).toBeLessThanOrEqual(
        A4.heightMm - 2 * TEMPLATE_PRINT_MARGIN_MM,
      );
    });

    it('texty se nepřekrývají', () => {
      const texts = items.slice(layout.boxes.length);
      for (const [i, a] of texts.entries()) {
        for (const b of texts.slice(i + 1)) {
          const overlap = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
          expect(overlap, `${a.what} × ${b.what}`).toBe(false);
        }
      }
    });
  },
);

it('tisková stránka šablony má okraj stránky 13 mm', async () => {
  const p = withTemplate[0]!;
  const { container } = renderApp(routes.template(p.slug));
  await vi.waitFor(() => expect(container.querySelector('svg[role="img"]')).not.toBeNull());
  const css = [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n');
  expect(css).toContain(`margin: ${TEMPLATE_PRINT_MARGIN_MM}mm`);
});
