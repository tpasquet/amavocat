import { Component } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { translateTestingModule } from '../../testing/test-helpers';
import { BreadcrumbService } from './breadcrumb.service';

@Component({ template: '', standalone: true })
class DummyComponent { }

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [translateTestingModule],
      providers: [provideRouter([{ path: ':lang', children: [{ path: '', component: DummyComponent }, { path: 'contact', component: DummyComponent }] }])]
    });
    TestBed.inject(TranslateService).use('fr');
    service = TestBed.inject(BreadcrumbService);
  });

  it('builds translated breadcrumbs from the URL', async () => {
    await TestBed.inject(Router).navigateByUrl('/fr/contact');
    const breadcrumbs = await firstValueFrom(service.breadcrumbs$.pipe(filter(b => b.length > 1)));

    expect(breadcrumbs).toEqual([
      { label: 'Accueil', url: '/fr' },
      { label: 'Contact', url: '/fr/contact' }
    ]);
    const jsonLd = TestBed.inject(DOCUMENT).getElementById('breadcrumb-structured-data');
    expect(JSON.parse(jsonLd!.textContent!).itemListElement.length).toBe(2);
  });

  it('has a single crumb on the home page', async () => {
    await TestBed.inject(Router).navigateByUrl('/fr');
    expect(await firstValueFrom(service.breadcrumbs$)).toEqual([{ label: 'Accueil', url: '/fr' }]);
  });
});
