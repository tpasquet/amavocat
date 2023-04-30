import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Constants } from '../global/constant';
import { LanguageGuard } from '../guards/language.guard';
import { SelectLanguageGuard } from '../guards/select-language.guard';
import { ContactComponent } from '../pages/contact/contact.component';
import { HomeComponent } from '../pages/home/home.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [SelectLanguageGuard],
    component: HomeComponent,
  },
  {
    path: ':lang', // Language-specific route
    canActivate: [LanguageGuard],
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'contact',
        component: ContactComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: `/${Constants.DEFAULT_LANG}`,
  }
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class RoutingModule { }
