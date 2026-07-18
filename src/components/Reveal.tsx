// Sanftes Scroll-Reveal (fade + Aufsteigen), das AUCH auf Mobile funktioniert
// (IntersectionObserver statt Hover). Ruhiges Award-Easing, gestaffelt moeglich.
// SSR-/no-JS-/Crawler-sicher: der Basis-Zustand (ohne die per-JS gesetzte Klasse)
// ist voll sichtbar. Erst on-mount fuegt JS die Reveal-Klasse hinzu (versteckt),
// der Observer schaltet beim Eintreten in den Viewport auf sichtbar. Reduced-
// Motion: Reveal wird gar nicht erst aktiviert.
import { useEffect, useRef, type ReactNode, type CSSProperties, type ElementType } from 'react';

function useReveal<T extends HTMLElement>(stagger = false) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.add(stagger ? 'cw-stagger' : 'cw-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { el.classList.add('cw-in'); io.unobserve(el); }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [stagger]);
  return ref;
}

// Wrapper: rendert EIN Element (Default div) mit dem Reveal-Ref. Fuer Grids
// `stagger` setzen -> die direkten Kinder gleiten nacheinander ein. `style`
// darf das Grid selbst tragen (kein Extra-Wrapper noetig).
export function Reveal({
  children, stagger = false, style, className, as: Tag = 'div',
}: {
  children: ReactNode; stagger?: boolean; style?: CSSProperties; className?: string; as?: ElementType;
}) {
  const ref = useReveal<HTMLElement>(stagger);
  return <Tag ref={ref} style={style} className={className}>{children}</Tag>;
}
