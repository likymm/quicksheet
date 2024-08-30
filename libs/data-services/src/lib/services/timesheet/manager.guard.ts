import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs';
import { SecurityService } from '../../../api/gen/timesheet/services';

export const managerGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  // Todo: this is the one that works but not cached
  return inject(SecurityService)
    .getUserByUserId$Json({
      userId: '1000',
    })
    .pipe(
      map(user => {
        const isManager = user?.UserRole === 'Manager';

        if (isManager) {
          return true;
        }
        router.navigate(['/time']);
        return false;
      })
    );

  //// Todo: should be using this one because this one is cached
  // return auth.getLoggedUser().pipe(
  //   map(user => {
  //     const isManager = user.data?.UserRole === 'Manager';

  //     if (isManager) {
  //       return true;
  //     }
  //     router.navigate(['/time']);
  //     return false;
  //   })
  // );
};
