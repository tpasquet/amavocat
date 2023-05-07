import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/services/language.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  language: string;
  showBurgerMenu = false;
  showNavbarLinks = true;
  menuOpened = false;
  isMobile = false;
  showMobileNavbar = true;

  constructor(private languageService: LanguageService, private responsive: BreakpointObserver, private router: Router) {
    this.language = this.languageService.getCurrentLang();

    this.responsive.observe([
      Breakpoints.Small,
      Breakpoints.XSmall,
    ])
      .subscribe(result => {

        this.showBurgerMenu = false;
        this.showNavbarLinks = true;
        this.isMobile = false;
        if (result.matches) {
          this.showBurgerMenu = true;
          this.showNavbarLinks = false;
          this.isMobile = true;
        }
      });
  }

  
  redirectTo(path: string) {
    this.menuOpened = false;
    this.router.navigate(['/' + this.language + '/' + path]);
  }

  @HostListener('document:scroll', ['$event'])
  public onViewportScroll() {
    const windowHeight = window.innerHeight;
    const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (verticalOffset > windowHeight && this.isMobile) {
      this.showMobileNavbar = false;
    } else {
      this.showMobileNavbar = true;
    }
  }

  onMenuClick() {
    console.log("menu click")
    this.menuOpened = !this.menuOpened;
    console.log(this.menuOpened)
  }
}
