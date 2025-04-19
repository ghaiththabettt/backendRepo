import { Routes } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';

export const PERKS_ROUTES: Routes = [
  {
    path: 'all-perks',
    loadComponent: () =>
      import('app/admin/perks/all-perks/all-perks.component').then((m) => m.AllPerksComponent),
  },
  {
    path: 'add-perks',
    loadComponent: () =>
      import('app/admin/perks/add-perks/add-perks.component').then((m) => m.AddPerksComponent),
  },
  {
    path: 'edit-perks/:id',
    loadComponent: () =>
      import('app/admin/perks/edit-perks/edit-perks.component').then((m) => m.EditPerksComponent),
  },
  { path: '**', component: Page404Component },
];
