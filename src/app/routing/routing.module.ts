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
// import { PostDetailsComponent } from '../pages/post-details/post-details.component';
// import { PostsComponent } from '../pages/posts/posts.component';

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
        path: 'accueil',
        component: HomeComponent
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
      // {
      //   path: 'posts',
      //   component: PostsComponent,
      //   children: [
      //     {
      //       path: 'posts/:id',
      //       component: PostDetailsComponent
      //     },
      //   ]
      // },
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
