import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Call / write bar fixed at the bottom of small screens, so a visitor can reach the firm without
 * scrolling to the contact block. Hidden on the contact page, which already shows these actions.
 */
@Component({
  selector: 'app-mobile-action-bar',
  templateUrl: './mobile-action-bar.component.html',
  styleUrls: ['./mobile-action-bar.component.scss'],
  standalone: false
})
export class MobileActionBarComponent implements OnInit {
  visible = true;

  constructor(private router: Router, private destroyRef: DestroyRef) { }

  ngOnInit(): void {
    this.updateVisibility(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.updateVisibility(event.urlAfterRedirects));
  }

  private updateVisibility(url: string): void {
    this.visible = !/^\/[a-z]{2}\/contact(\/|\?|#|$)/.test(url);
  }
}
