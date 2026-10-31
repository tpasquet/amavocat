import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MAIN_CONTENT_ID, PageFocusService } from './page-focus.service';

describe('PageFocusService', () => {
  let service: PageFocusService;
  let document: Document;
  let main: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(PageFocusService);
    document = TestBed.inject(DOCUMENT);
    main = document.createElement('main');
    main.id = MAIN_CONTENT_ID;
    document.body.appendChild(main);
  });

  afterEach(() => main.remove());

  it('focuses the main content without adding it to the Tab order', () => {
    expect(service.focusMainContent({ scroll: false })).toBeTrue();
    expect(document.activeElement).toBe(main);
    expect(main.getAttribute('tabindex')).toBe('-1');
  });

  it('reports a page without main content', () => {
    main.remove();
    expect(service.focusMainContent({ scroll: false })).toBeFalse();
  });
});
