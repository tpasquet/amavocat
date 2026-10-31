import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Id carried by the `<main>` element of every page */
export const MAIN_CONTENT_ID = 'main-content';

/**
 * Keyboard and screen reader focus for a single-page app:
 * - the skip link moves focus to the main content without changing the URL (a plain `#main-content`
 *   href resolves against `<base href="/">` and would navigate to the home page);
 * - after an in-app navigation, focus moves to the new page's main content, so a screen reader
 *   announces the new page and the next Tab starts from the content instead of the old link.
 */
@Injectable({ providedIn: 'root' })
export class PageFocusService {
  private readonly isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /** Moves focus to the main content after every navigation except the first page load. */
  focusMainContentOnNavigation(destroyRef: DestroyRef): void {
    if (!this.isBrowser) {
      return;
    }
    let firstNavigation = true;
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        if (firstNavigation) {
          firstNavigation = false;
          return;
        }
        // The new page is rendered on the next tick
        setTimeout(() => this.focusMainContent({ scroll: false }));
      });
  }

  /** Focuses the page's `<main>`; returns false when the page has none. */
  focusMainContent({ scroll }: { scroll: boolean } = { scroll: true }): boolean {
    const main = this.document.getElementById(MAIN_CONTENT_ID);
    if (!main) {
      return false;
    }
    if (!main.hasAttribute('tabindex')) {
      // Focusable by script only, not part of the Tab order
      main.setAttribute('tabindex', '-1');
    }
    main.focus({ preventScroll: true });
    if (scroll) {
      main.scrollIntoView({ block: 'start' });
    }
    return true;
  }
}
