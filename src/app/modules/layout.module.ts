import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BurgerMenuComponent } from '../components/burger-menu/burger-menu.component';
import { LayoutComponent } from '../components/layout/layout.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../components/footer/footer.component';
import { BreadcrumbComponent } from '../components/breadcrumb/breadcrumb.component';
import { LanguageSelectorComponent } from '../components/language-selector/language-selector.component';
import { ContactCtaComponent } from '../components/contact-cta/contact-cta.component';
import { ExpertiseGridComponent } from '../components/expertise-grid/expertise-grid.component';
import { MobileActionBarComponent } from '../components/mobile-action-bar/mobile-action-bar.component';



@NgModule({
  declarations: [
    NavbarComponent,
    LayoutComponent,
    BurgerMenuComponent,
    FooterComponent,
    BreadcrumbComponent,
    LanguageSelectorComponent,
    ContactCtaComponent,
    ExpertiseGridComponent,
    MobileActionBarComponent
  ],
  imports: [
    CommonModule,
    // RouterModule, not RoutingModule: lazy modules import LayoutModule and must not re-register the routes
    RouterModule,
    FormsModule,
    TranslateModule
  ],
  exports: [
    LayoutComponent,
    LanguageSelectorComponent,
    ContactCtaComponent,
    ExpertiseGridComponent
  ]
})
export class LayoutModule { }
