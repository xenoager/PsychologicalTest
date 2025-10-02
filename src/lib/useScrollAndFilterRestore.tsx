// useScrollAndFilterRestore.tsx (v2)
import { useEffect } from 'react';

type Opts = {
  key: string;
  category?: string;
  onRestoreCategory?: (cat: string) => void;
};

const ss = typeof window !== 'undefined' ? window.sessionStorage : undefined;
const KEY_SCROLL = (k: string) => `ps:${k}:scroll`;
const KEY_CAT = (k: string) => `ps:${k}:category`;

export function useScrollAndFilterRestore({ key, category, onRestoreCategory }: Opts) {
  useEffect(() => {
    if (typeof window === 'undefined' || !ss) return;
    const savedCat = ss.getItem(KEY_CAT(key));
    if (savedCat && onRestoreCategory) {
      onRestoreCategory(savedCat);
    }
    const y = ss.getItem(KEY_SCROLL(key));
    if (y) window.scrollTo(0, parseInt(y, 10));
    if (category !== undefined) {
      ss.setItem(KEY_CAT(key), String(category));
    }
    const handleBeforeUnload = () => ss.setItem(KEY_SCROLL(key), String(window.scrollY || 0));
    window.addEventListener('beforeunload', handleBeforeUnload);
    const handleClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[data-quiz-link]');
      if (a) ss.setItem(KEY_SCROLL(key), String(window.scrollY || 0));
    };
    document.addEventListener('click', handleClick);
    const handlePageShow = (e: PageTransitionEvent) => {
      if ((e as any).persisted) {
        const sc = ss.getItem(KEY_SCROLL(key));
        if (sc) window.scrollTo(0, parseInt(sc, 10));
        const ca = ss.getItem(KEY_CAT(key));
        if (ca && onRestoreCategory) onRestoreCategory(ca);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [key, category, onRestoreCategory]);
}
