import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutComponent } from '../components/layout/layout.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { RoutingModule } from '../routing/routing.module';



@NgModule({
  declarations: [
    NavbarComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    RoutingModule,
    NgbCollapseModule,
  ],
  exports: [
    LayoutComponent
  ]
})
export class LayoutModule { }
