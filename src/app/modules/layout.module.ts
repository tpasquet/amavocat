import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { BurgerMenuComponent } from '../components/burger-menu/burger-menu.component';
import { LayoutComponent } from '../components/layout/layout.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { RoutingModule } from '../routing/routing.module';
import { IconologoComponent } from '../components/iconologo/iconologo.component';
import { FooterComponent } from '../components/footer/footer.component';



@NgModule({
  declarations: [
    NavbarComponent,
    LayoutComponent,
    BurgerMenuComponent,
    IconologoComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    NgbCollapseModule,
    RoutingModule
  ],
  exports: [
    LayoutComponent
  ]
})
export class LayoutModule { }
