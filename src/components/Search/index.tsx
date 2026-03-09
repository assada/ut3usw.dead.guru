import React, {
  useEffect,
  useRef,
  useState,
  useDeferredValue,
  useCallback,
  Fragment,
} from 'react';
import {
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from '@headlessui/react';

import styles from './styles.module.css';

declare global {
  interface Window {
    pagefind?: {
      debouncedSearch: (
        query: string,
        options?: Record<string, unknown>
      ) => Promise<{
        results: { data: () => Promise<PagefindResult> }[];
      } | null>;
      options: (opts: Record<string, unknown>) => Promise<void>;
    };
  }
}

type PagefindResult = {
  excerpt: string;
  meta: { title: string };
  raw_url: string;
  sub_results: {
    excerpt: string;
    title: string;
    url: string;
  }[];
  url: string;
};

async function importPagefind() {
  const url = '/pagefind/pagefind.js';
  try {
    const mod = await new Function('u', 'return import(u)')(url);
    window.pagefind = mod;
    await window.pagefind!.options({ baseUrl: '/' });
  } catch (e) {
    throw new Error(
      `Failed to fetch pagefind from ${url}: ${(e as Error).message}`
    );
  }
}

const INPUTS = new Set(['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA']);

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const inputRef = useRef<HTMLInputElement>(null!);
  const resultsRef = useRef<HTMLDivElement>(null!);

  useEffect(() => setMounted(true), []);

  // Flatten sub_results for keyboard navigation
  const allItems = results.flatMap((r) =>
    r.sub_results.map((sub) => sub)
  );

  // Search logic
  useEffect(() => {
    const handleSearch = async (value: string) => {
      if (!value) {
        setResults([]);
        setError('');
        setActiveIndex(0);
        return;
      }
      setIsLoading(true);
      if (!window.pagefind) {
        try {
          await importPagefind();
        } catch (err) {
          const isDev = process.env.NODE_ENV !== 'production';
          const msg =
            err instanceof Error
              ? isDev && err.message.includes('Failed to fetch')
                ? 'Пошук недоступний в dev-режимі. Спершу зробіть `npm run build`.'
                : `${err.constructor.name}: ${err.message}`
              : String(err);
          setError(msg);
          setIsLoading(false);
          return;
        }
      }
      const response = await window.pagefind!.debouncedSearch(value);
      if (!response) return;

      const data = await Promise.all(response.results.map((o) => o.data()));
      setIsLoading(false);
      setError('');
      setActiveIndex(0);
      setResults(
        data.map((d) => ({
          ...d,
          sub_results: d.sub_results.map((r) => {
            const url = r.url.replace(/\.html$/, '').replace(/\.html#/, '#');
            return { ...r, url };
          }),
        }))
      );
    };
    handleSearch(deferredSearch);
  }, [deferredSearch]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K / "/"
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const el = document.activeElement;
      if (
        el &&
        (INPUTS.has(el.tagName) || (el as HTMLElement).isContentEditable)
      ) {
        if (
          event.key === 'k' &&
          !event.shiftKey &&
          (navigator.userAgent.includes('Mac')
            ? event.metaKey
            : event.ctrlKey)
        ) {
          event.preventDefault();
          setIsOpen(true);
        }
        return;
      }
      if (
        event.key === '/' ||
        (event.key === 'k' &&
          !event.shiftKey &&
          (navigator.userAgent.includes('Mac')
            ? event.metaKey
            : event.ctrlKey))
      ) {
        event.preventDefault();
        setIsOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard navigation inside modal
  const handleModalKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (event.key === 'Enter' && allItems[activeIndex]) {
        event.preventDefault();
        navigateTo(allItems[activeIndex].url);
      }
    },
    [allItems, activeIndex]
  );

  const navigateTo = useCallback((url: string) => {
    setIsOpen(false);
    setSearch('');
    setResults([]);
    const [pathname, hash] = url.split('#');
    if (location.pathname === pathname && hash) {
      location.href = `#${hash}`;
    } else {
      location.href = url;
    }
  }, []);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = resultsRef.current?.querySelector(
      `[data-index="${activeIndex}"]`
    );
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearch('');
    setResults([]);
    setError('');
  }, []);

  const isMac = mounted && navigator.userAgent.includes('Mac');

  // Build flat index for rendering
  let flatIndex = 0;

  return (
    <>
      {/* Trigger button in navbar */}
      <button
        className={styles.triggerButton}
        onClick={() => setIsOpen(true)}
        type="button"
        aria-label="Пошук"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.triggerIcon}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className={styles.triggerText}>Пошук...</span>
        <kbd className={styles.triggerKbd}>
          {isMac ? '⌘K' : 'Ctrl K'}
        </kbd>
      </button>

      {/* Search Modal */}
      <Dialog
        open={isOpen}
        onClose={close}
        className={styles.dialog}
      >
        <DialogBackdrop className={styles.backdrop} />
        <div className={styles.dialogContainer}>
          <DialogPanel className={styles.panel} onKeyDown={handleModalKeyDown}>
            {/* Search input */}
            <div className={styles.inputWrapper}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.inputIcon}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Пошук по документації..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className={styles.escBadge} onClick={close}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className={styles.resultsArea} ref={resultsRef}>
              {error ? (
                <div className={styles.emptyState}>
                  <div className={styles.errorIcon}>!</div>
                  <p className={styles.emptyTitle}>
                    Не вдалось завантажити індекс
                  </p>
                  <p className={styles.emptySubtitle}>{error}</p>
                </div>
              ) : isLoading ? (
                <div className={styles.emptyState}>
                  <div className={styles.loadingSpinner} />
                  <p className={styles.emptyTitle}>Шукаю...</p>
                </div>
              ) : deferredSearch && !results.length ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>Нічого не знайдено</p>
                  <p className={styles.emptySubtitle}>
                    Спробуйте інший запит
                  </p>
                </div>
              ) : !deferredSearch ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>Почніть вводити запит</p>
                  <p className={styles.emptySubtitle}>
                    Пошук по всій документації та блогу
                  </p>
                </div>
              ) : (
                results.map((result) => {
                  const groupStartIndex = flatIndex;
                  const items = result.sub_results.map((sub, si) => {
                    const itemIndex = groupStartIndex + si;
                    flatIndex++;
                    return (
                      <a
                        key={sub.url}
                        href={sub.url}
                        data-index={itemIndex}
                        className={`${styles.resultItem} ${
                          activeIndex === itemIndex
                            ? styles.resultItemActive
                            : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo(sub.url);
                        }}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                      >
                        <div className={styles.resultTitle}>
                          {sub.title}
                        </div>
                        <div
                          className={styles.resultExcerpt}
                          dangerouslySetInnerHTML={{ __html: sub.excerpt }}
                        />
                      </a>
                    );
                  });
                  return (
                    <Fragment key={result.url}>
                      <div className={styles.resultGroup}>
                        {result.meta.title}
                      </div>
                      {items}
                    </Fragment>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {deferredSearch && results.length > 0 && (
              <div className={styles.footer}>
                <span className={styles.footerHint}>
                  <kbd className={styles.footerKbd}>↑↓</kbd> навігація
                </span>
                <span className={styles.footerHint}>
                  <kbd className={styles.footerKbd}>↵</kbd> перейти
                </span>
                <span className={styles.footerHint}>
                  <kbd className={styles.footerKbd}>esc</kbd> закрити
                </span>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
