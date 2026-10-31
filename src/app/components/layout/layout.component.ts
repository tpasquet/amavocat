import { Component, DestroyRef } from '@angular/core';
import { PageFocusService } from 'src/app/services/page-focus.service';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    standalone: false
})
export class LayoutComponent {
  constructor(pageFocus: PageFocusService, destroyRef: DestroyRef) {
    pageFocus.focusMainContentOnNavigation(destroyRef);
  }
}
