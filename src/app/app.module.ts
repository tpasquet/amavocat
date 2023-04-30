import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutModule } from './modules/layout.module';
import { ContactSummaryComponent } from './components/contact-summary/contact-summary.component';
import { MessageFormComponent } from './components/message-form/message-form.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ContactComponent,
    MessageFormComponent,
    ContactSummaryComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    LayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
