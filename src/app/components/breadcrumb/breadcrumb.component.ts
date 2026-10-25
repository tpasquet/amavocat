import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BreadcrumbService, BreadcrumbItem } from '../../services/breadcrumb.service';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    standalone: false
})
export class BreadcrumbComponent {
  readonly breadcrumbs$: Observable<BreadcrumbItem[]>;

  constructor(breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = breadcrumbService.breadcrumbs$;
  }
}
