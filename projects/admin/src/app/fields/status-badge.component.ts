import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Entry } from '../core/models';

@Component({
  selector: 'app-status-badge',
  imports: [DatePipe],
  template: `
    @switch (entry().status) {
      @case ('published') {
        <span class="badge badge-published">Publié</span>
      }
      @case ('scheduled') {
        <span class="badge badge-scheduled">Programmé le {{ entry().publishAt | date: 'd MMM y, HH:mm' }}</span>
      }
      @default {
        <span class="badge">Brouillon</span>
      }
    }
  `,
})
export class StatusBadgeComponent {
  readonly entry = input.required<Pick<Entry, 'status' | 'publishAt'>>();
}
