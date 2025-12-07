import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
  private routerSubscription?: Subscription;

  constructor(
    private languageService: LanguageService,
    private responsive: BreakpointObserver,
    private router: Router,
    private translate: TranslateService
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

  ngOnInit() {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.language = this.languageService.getCurrentLang();
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
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
    console.log("menu click")
    this.menuOpened = !this.menuOpened;
    console.log(this.menuOpened)
  }

  closeMenu() {
    this.menuOpened = false;
  }

  onLanguageChanged(newLang: string) {
    this.language = newLang;
    this.closeMenu();
  }

  switchLanguageMobile(lang: string) {
    this.translate.use(lang);
    this.languageService.setCurrentLang(lang);
    this.language = lang;

    const urlSegments = this.router.url.split('/').filter(seg => seg);
    const pathWithoutLang = urlSegments.slice(1);

    if (pathWithoutLang.length > 0) {
      this.router.navigate([lang, ...pathWithoutLang]);
    } else {
      this.router.navigate([lang]);
    }

    this.closeMenu();
  }
}
