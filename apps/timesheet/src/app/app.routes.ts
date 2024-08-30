import { Route } from '@angular/router';
import { authGuard, managerGuard } from '@grant/data-service';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'time',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(x => x.LoginComponent),
  },

  {
    path: '',
    loadComponent: () =>
      import('../app/layout/admin/admin.component').then(c => c.AdminComponent),
    children: [
      {
        path: 'time',
        loadComponent: () =>
          import('./timesheets/timesheets.component').then(
            x => x.TimesheetsComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'time/:date',
        loadComponent: () =>
          import('./time/time.component').then(x => x.TimeComponent),
        canActivate: [authGuard],
      },
      {
        path: 'review',
        loadComponent: () =>
          import('./review/review.component').then(x => x.ReviewComponent),
        canActivate: [authGuard, managerGuard],
      },
      {
        path: 'no-timesheets',
        loadComponent: () =>
          import('./no-timesheets/no-timesheets.component').then(
            x => x.NoTimesheetsComponent
          ),
        canActivate: [authGuard, managerGuard],
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./expenses/expenses.component').then(
            x => x.ExpensessComponent
          ),
        canActivate: [authGuard],
      },
    ],
  },
];
