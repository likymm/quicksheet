import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('../app/layout/admin/admin.component').then(c => c.AdminComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            c => c.DashboardComponent
          ),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.component').then(c => c.HomeComponent),
      },
      {
        path: 'award',
        loadComponent: () =>
          import('./award/award.component').then(c => c.AwardComponent),
      },
      {
        path: 'award/profile',
        loadComponent: () =>
          import('./award/award-profile/award-profile.component').then(
            c => c.AwardProfileComponent
          ),
      },
      {
        path: 'award/award-form',
        loadComponent: () =>
          import('./award/award-form/award-form.component').then(
            c => c.AwardFormComponent
          ),
      },
      {
        path: 'sub-grant',
        loadComponent: () =>
          import('./sub-grant/sub-grant.component').then(
            c => c.SubGrantComponent
          ),
      },
      {
        path: 'sub-grant/sub-grant-form',
        loadComponent: () =>
          import('./sub-grant/sub-grant-form/sub-grant-form.component').then(
            c => c.SubGrantFormComponent
          ),
      },
      {
        path: 'sub-grant/profile',
        loadComponent: () =>
          import(
            './sub-grant/sub-grant-profile/sub-grant-profile.component'
          ).then(c => c.SubGrantProfileComponent),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(c => c.LoginComponent),
  },
];
