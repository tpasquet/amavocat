import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MessageFormComponent } from 'src/app/components/message-form/message-form.component';
import { Constants } from 'src/app/global/constant';
import { environment } from 'src/app/environments/environment';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

const ContactMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Contact & Appointments | Aurélie Manier, Lawyer in Lyon',
    description: 'Book an appointment with Aurélie Manier, employment and personal injury lawyer: office at 90 rue Servient, Lyon 3rd, or by video call or phone.',
    ogTitle: 'Contact & Appointments | Aurélie Manier, Lawyer in Lyon',
    ogDescription: 'Book an appointment with Aurélie Manier, employment and personal injury lawyer: office at 90 rue Servient, Lyon 3rd, or by video call or phone.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en/contact`
  },
  fr: {
    title: 'Contact et rendez-vous | Aurélie Manier, avocate à Lyon',
    description: 'Prenez rendez-vous avec Maître Aurélie Manier, avocate en droit social et dommage corporel : cabinet au 90 rue Servient, Lyon 3e, en visio ou par téléphone.',
    ogTitle: 'Contact et rendez-vous | Aurélie Manier, avocate à Lyon',
    ogDescription: 'Prenez rendez-vous avec Maître Aurélie Manier, avocate en droit social et dommage corporel : cabinet au 90 rue Servient, Lyon 3e, en visio ou par téléphone.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/fr/contact`
  }
};
@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss'],
    standalone: false
})
export class ContactComponent implements AfterViewInit {
  readonly contactForm = environment.contactForm;

  /** Fragment used by the "write a message" calls to action across the site */
  static readonly FORM_FRAGMENT = 'message';

  @ViewChild(MessageFormComponent) private messageForm?: MessageFormComponent;

  xSmall = false;
  small = false;
  
  constructor(
    private languageService: LanguageService,
    private metaService: MetaService,
    private destroyRef: DestroyRef,
    private responsive: BreakpointObserver,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.responsive.observe([
      Breakpoints.Small,
      Breakpoints.XSmall,
    ])
      .subscribe(result => {
        if (result.matches) {
          this.xSmall = true;
          this.small = true;
        } else {
          this.xSmall = true;
          this.small = true;
        }
      });
  }

  ngOnInit() {
    // Le composant est réutilisé quand seule la langue change (/fr/x -> /en/x) : on suit la langue
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.metaService.setPageMeta(ContactMetaTranslations[lang]));
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // /:lang/contact#message: go straight to the form, ready to type
    this.route.fragment
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(fragment => {
        if (fragment === ContactComponent.FORM_FRAGMENT) {
          setTimeout(() => this.messageForm?.focusForm());
        }
      });
  }
}
