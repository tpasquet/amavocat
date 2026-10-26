import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/services/language.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import articlesMeta from '../../../../generated/articles-meta.json';
import { SupportedLanguages } from 'src/app/global/enum';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: false
})
export class NavbarComponent implements OnInit, OnDestroy {
  language: string;
  showBurgerMenu = false;
  showNavbarLinks = true;
  menuOpened = false;
  isMobile = false;
  showMobileNavbar = true;
  isScrollingUp = false;
  private lastScrollTop = 0;
  /** Published articles per language, counted when the site was built */
  private readonly articleCounts: Record<string, number> = articlesMeta;
  private languageSubscription?: Subscription;

  constructor(
    private languageService: LanguageService,
    private responsive: BreakpointObserver,
    private router: Router
  ) {
    this.language = this.languageService.getCurrentLang();

    this.responsive.observe('(max-width: 700px)')
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

  @HostListener('document:scroll', ['$event'])
  public onViewportScroll() {
    const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

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

  onLanguageChanged(newLang: string) {
    this.language = newLang;
    this.closeMenu();
  }
}
