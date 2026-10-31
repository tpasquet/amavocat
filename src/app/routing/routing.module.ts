import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Constants } from '../global/constant';
import { LanguageGuard } from '../guards/language.guard';
import { SelectLanguageGuard } from '../guards/select-language.guard';
import { ContactComponent } from '../pages/contact/contact.component';
import { DomainsComponent } from '../pages/domains/domains.component';
import { HomeComponent } from '../pages/home/home.component';
import { LegalComponent } from '../pages/legal/legal.component';
import { PrivacyComponent } from '../pages/privacy/privacy.component';
import { AccessibilityComponent } from '../pages/accessibility/accessibility.component';

const routes: Routes = [
  {
    path: ':lang',
    canActivate: [LanguageGuard],
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        // Ancienne URL de l'accueil : redirigée pour éviter un doublon de /:lang
        path: 'accueil',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: 'domaines',
        component: DomainsComponent,
      },
      {
        path: 'contact',
        component: ContactComponent
      },
      {
        path: 'mentions-legales',
        component: LegalComponent
      },
      {
        path: 'politique-confidentialite',
        component: PrivacyComponent
      },
      {
        path: 'accessibilite',
        component: AccessibilityComponent
      },
      {
        // Lazy: the chunk embeds every published article (generated/articles.json)
        path: 'articles',
        loadChildren: () => import('../pages/articles/articles.module').then(m => m.ArticlesModule)
      },
    ]
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [SelectLanguageGuard],
    component: HomeComponent,
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
