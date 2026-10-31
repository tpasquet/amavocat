import { Component, Input } from '@angular/core';

interface ExpertiseItem {
  /** Translation key suffix of the item, appended to `itemsKey` */
  key: string;
  /** Bootstrap Icons class */
  icon: string;
}

interface ExpertiseGroup {
  /** Translation key suffix of the group, under `expertise.groups` */
  key: string;
  items: ExpertiseItem[];
}

/**
 * The situations the firm handles, as cards grouped by area of law.
 * The item texts come from the page's own translations (`itemsKey`), the group labels are shared.
 */
@Component({
  selector: 'app-expertise-grid',
  templateUrl: './expertise-grid.component.html',
  styleUrls: ['./expertise-grid.component.scss'],
  standalone: false
})
export class ExpertiseGridComponent {
  /** Translation key of the object holding the item texts, e.g. `home.expertise.items` */
  @Input({ required: true }) itemsKey!: string;

  readonly groups: ExpertiseGroup[] = [
    {
      key: 'labor',
      items: [
        { key: 'litigation', icon: 'bi-briefcase' },
        { key: 'safety', icon: 'bi-shield-check' },
        { key: 'harassment', icon: 'bi-person-exclamation' },
        { key: 'inaptitude', icon: 'bi-clipboard2-pulse' }
      ]
    },
    {
      key: 'socialSecurity',
      items: [
        { key: 'accidents', icon: 'bi-bandaid' },
        { key: 'diseases', icon: 'bi-lungs' },
        { key: 'disability', icon: 'bi-percent' },
        { key: 'organisms', icon: 'bi-building' }
      ]
    },
    {
      key: 'personalInjury',
      items: [
        { key: 'trafficAccidents', icon: 'bi-car-front' }
      ]
    }
  ];
}
