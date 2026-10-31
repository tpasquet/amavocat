import { Component, ElementRef, HostBinding, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/services/language.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import articlesMeta from '../../../../generated/articles-meta.json';
import { SupportedLanguages } from 'src/app/global/enum';
import { PageFocusService } from 'src/app/services/page-focus.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: false,
    // The bar is the site header: exposed as the banner landmark without changing the layout
    host: { role: 'banner' }
})
export class NavbarComponent implements OnInit, OnDestroy {
  language: string;
  showBurgerMenu = false;
  showNavbarLinks = true;
  menuOpened = false;
  isMobile = false;
  showMobileNavbar = true;
  isScrollingUp = false;
  /** Height of the bar measured while it is in the normal flow, reserved while it is fixed */
  private navbarHeight = 0;
  private lastScrollTop = 0;
  /** Published articles per language, counted when the site was built */
  private readonly articleCounts: Record<string, number> = articlesMeta;
  private languageSubscription?: Subscription;
  @ViewChild('burgerButton') private burgerButton?: ElementRef<HTMLButtonElement>;

  constructor(
    private languageService: LanguageService,
    private responsive: BreakpointObserver,
    private router: Router,
    private elementRef: ElementRef<HTMLElement>,
    private pageFocus: PageFocusService
  ) {
    this.language = this.languageService.getCurrentLang();

    // Below the lg breakpoint the full bar (title, links, button, language) no longer fits on one line
    this.responsive.observe('(max-width: 991px)')
      .subscribe(result => {
        if (result.matches) {
          this.showBurgerMenu = true;
          this.showNavbarLinks = false;
          this.isMobile = true;
        } else {
          this.showBurgerMenu = false;
          this.showNavbarLinks = true;
          this.isMobile = false;
        }
      });
  }

  /** The Articles link only appears once articles are published in the current language */
  get hasArticles(): boolean {
    return (this.articleCounts[this.language as SupportedLanguages] ?? 0) > 0;
  }

  ngOnInit() {
    this.languageSubscription = this.languageService.currentLang$
      .subscribe(lang => this.language = lang);
  }

  ngOnDestroy() {
    this.languageSubscription?.unsubscribe();
  }

  
  redirectTo(path: string) {
    this.menuOpened = false;
    this.router.navigate(['/' + this.language + '/' + path]);
  }

  /**
   * While the bar is fixed it leaves the document flow: the host keeps its height as padding so the
   * content below does not jump when the bar appears or disappears.
   */
  @HostBinding('style.padding-top.px')
  get reservedHeight(): number | null {
    return this.isScrollingUp && this.navbarHeight > 0 ? this.navbarHeight : null;
  }

  @HostListener('document:scroll', ['$event'])
  public onViewportScroll() {
    const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (!this.isScrollingUp) {
      this.navbarHeight = this.elementRef.nativeElement.querySelector('nav')?.offsetHeight ?? 0;
    }

    if (verticalOffset > this.lastScrollTop && verticalOffset > 0) {
      // Scrolling down
      this.isScrollingUp = false;
    } else if (verticalOffset < this.lastScrollTop) {
      // Scrolling up
      this.isScrollingUp = true;
    }

    // When at the top, navbar should be relative
    if (verticalOffset === 0) {
      this.isScrollingUp = false;
    }

    this.lastScrollTop = verticalOffset <= 0 ? 0 : verticalOffset;
  }

  onMenuClick() {
    this.menuOpened = !this.menuOpened;
  }

  closeMenu() {
    this.menuOpened = false;
  }

  /** Skip link: focus the main content in place instead of following `#main-content` (see PageFocusService) */
  skipToContent(event: Event) {
    if (this.pageFocus.focusMainContent()) {
      event.preventDefault();
    }
  }

  /**
   * The open mobile menu covers the page: Escape closes it, and Tab cycles through the menu and its
   * close button instead of reaching the hidden page behind it.
   */
  onMobileNavKeydown(event: KeyboardEvent) {
    if (!this.menuOpened) {
      return;
    }
    const nav = event.currentTarget as HTMLElement;

    if (event.key === 'Escape') {
      // An open language list closes first (LanguageSelectorComponent handles it)
      if (nav.querySelector('.language-selector.open')) {
        return;
      }
      this.closeMenu();
      this.burgerButton?.nativeElement.focus();
      return;
    }

    if (event.key === 'Tab') {
      const focusables = Array.from(nav.querySelectorAll<HTMLElement>('a[href], button'))
        .filter(element => !element.classList.contains('skip-link') && element.getClientRects().length > 0);
      if (focusables.length === 0) {
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  onLanguageChanged(newLang: string) {
    this.language = newLang;
    this.closeMenu();
  }
}
