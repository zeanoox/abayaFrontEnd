import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

/** Fetches `path` whenever it changes. Returns { data, error, loading, reload }. */
export function useApi(path, { keep = false } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!path) return undefined;
    const ctrl = new AbortController();
    setState((s) => ({ data: keep ? s.data : null, error: null, loading: true }));
    api(path, { signal: ctrl.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => { if (error.name !== 'AbortError') setState({ data: null, error, loading: false }); });
    return () => ctrl.abort();
  }, [path, n, keep]);
  return { ...state, reload: () => setN((x) => x + 1) };
}

/** Closes on Escape and returns focus to the opener; focuses the first control on open. */
export function useDialog(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    const el = ref.current;
    const focusables = () => el?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusables()?.[0]?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && el) {
        const f = [...focusables()];
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);
  return ref;
}

/** Sets the page <title>, description and canonical URL. */
export function useSeo({ title, description, image, canonical }) {
  useEffect(() => {
    if (title) document.title = `${title} | LORIM`;
    const meta = (attr, key, value) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value || '');
    };
    meta('name', 'description', description);
    meta('property', 'og:title', title ? `${title} | LORIM` : 'LORIM');
    meta('property', 'og:description', description);
    if (image) meta('property', 'og:image', image);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical || window.location.origin + window.location.pathname;
  }, [title, description, image, canonical]);
}
