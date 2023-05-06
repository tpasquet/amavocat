import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { BrowserModule } from '@angular/platform-browser';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { ContactSummaryComponent } from './components/contact-summary/contact-summary.component';
import { MessageFormComponent } from './components/message-form/message-form.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { environment } from './environments/environment';
import { LayoutModule } from './modules/layout.module';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { PostsComponent } from './pages/posts/posts.component';
import { PostDetailsComponent } from './pages/post-details/post-details.component';
import { RoutingModule } from './routing/routing.module';
import { RouterModule } from '@angular/router';
import {  } from './components/burger-menu/burger-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ContactComponent,
    MessageFormComponent,
    ContactSummaryComponent,
    PostsComponent,
    PostCardComponent,
    PostDetailsComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule,
    LayoutModule,
    RouterModule,
    RoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
