import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Constants } from '../global/constant';
import { MetaService } from './meta.service';

describe('MetaService', () => {
  let service: MetaService;
  let document: Document;

  const href = (selector: string) => document.head.querySelector(selector)?.getAttribute('href');

  beforeEach(() => {
    service = TestBed.inject(MetaService);
    document = TestBed.inject(DOCUMENT);
    service.setPageMeta({
      title: 'Domains',
      description: 'description',
      ogTitle: 'Domains',
      ogDescription: 'description',
      canonical: `${Constants.HOSTNAME}/en/domaines`
    });
  });

  it('sets the title and canonical URL', () => {
    expect(document.title).toBe('Domains');
    expect(href('link[rel="canonical"]')).toBe(`${Constants.HOSTNAME}/en/domaines`);
  });

  it('points hreflang links to the same page in each language', () => {
    expect(href('link[rel="alternate"][hreflang="fr"]')).toBe(`${Constants.HOSTNAME}/fr/domaines`);
    expect(href('link[rel="alternate"][hreflang="en"]')).toBe(`${Constants.HOSTNAME}/en/domaines`);
    expect(href('link[rel="alternate"][hreflang="x-default"]')).toBe(`${Constants.HOSTNAME}/fr/domaines`);
    expect(document.head.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe('en_GB');
  });
});
