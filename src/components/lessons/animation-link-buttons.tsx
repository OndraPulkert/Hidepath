import { Button } from '@/components/ui/button';
import { animationButtonText, animationPages } from '@/content/animations';
import { type AnimationLink } from '@/content/schema';
import { typo } from '@/lib/utils/format';

/**
 * Tlačítka na animace postupu (pod krokem lekce, na detailu nástroje). Obyčejné odkazy,
 * ne router <Link>: animace jsou statické stránky mimo SPA (public/animace, offline
 * z precache service workeru).
 */
export function AnimationLinkButtons({ links }: { links: readonly AnimationLink[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Button
          key={link.href}
          asChild
          variant="secondary"
          className="h-auto flex-col items-start gap-0.5 py-2 text-left whitespace-normal"
        >
          <a href={link.href}>
            <span>
              <span aria-hidden>{isThreadGuide(link.href) ? '📏 ' : '▶ '}</span>
              {animationButtonText(link.href)}
            </span>
            <span className="text-[14px] font-normal text-ink-2">{typo(link.label)}</span>
          </a>
        </Button>
      ))}
    </div>
  );
}

const isThreadGuide = (href: string) => href.startsWith(animationPages.threadLength.path);
