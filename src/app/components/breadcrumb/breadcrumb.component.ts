import { Component, OnInit } from '@angular/core';
import { BreadcrumbService, BreadcrumbItem } from '../../services/breadcrumb.service';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    standalone: false
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];
  structuredData: string = '';

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbs = this.breadcrumbService.getBreadcrumbs();
    this.structuredData = this.breadcrumbService.getStructuredData();
  }
}
