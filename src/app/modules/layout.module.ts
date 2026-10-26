import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BurgerMenuComponent } from '../components/burger-menu/burger-menu.component';
import { LayoutComponent } from '../components/layout/layout.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { RoutingModule } from '../routing/routing.module';
import { FooterComponent } from '../components/footer/footer.component';
import { BreadcrumbComponent } from '../components/breadcrumb/breadcrumb.component';
import { LanguageSelectorComponent } from '../components/language-selector/language-selector.component';
import { ContactCtaComponent } from '../components/contact-cta/contact-cta.component';



@NgModule({
  declarations: [
    NavbarComponent,
    LayoutComponent,
    BurgerMenuComponent,
    FooterComponent,
    BreadcrumbComponent,
    LanguageSelectorComponent,
    ContactCtaComponent
  ],
  imports: [
    CommonModule,
    RoutingModule,
    FormsModule,
    TranslateModule
  ],
  exports: [
    LayoutComponent,
    LanguageSelectorComponent,
    ContactCtaComponent
  ]
})
export class LayoutModule { }
