import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'content/article' },
      {
        path: 'content/:type',
        loadComponent: () => import('./pages/entry-list/entry-list.component').then((m) => m.EntryListComponent),
      },
      {
        // ":id" is "new" when creating; one route so the page survives the switch to the saved entry's URL
        path: 'content/:type/:id',
        loadComponent: () => import('./pages/entry-edit/entry-edit.component').then((m) => m.EntryEditComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
