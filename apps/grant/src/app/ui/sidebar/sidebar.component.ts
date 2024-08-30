import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  remixHome2Line as home,
  remixDashboardLine as dashboard,
  remixLoginBoxLine as login,
  remixInstanceFill as instance,
  remixAwardLine as award,
  remixMoneyDollarBoxLine as money,
} from '@ng-icons/remixicon';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { map } from 'rxjs';

interface Menu {
  path: string;
  text: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'btp-sidebar',
  standalone: true,
  imports: [RouterModule, NgIconComponent, TranslocoModule],
  templateUrl: './sidebar.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ home, dashboard, login, instance, award, money })],
})
export class SidebarComponent {
  translocoService = inject(TranslocoService);

  menu = toSignal(
    this.translocoService
      .selectTranslate([
        'sys.home',
        'sys.dashboard',
        'sys.logout',
        'sys.award',
        'sys.subGrant',
      ])
      .pipe(
        map(([home, dashboard, logout, award, subGrant]) => {
          return [
            {
              text: home,
              path: './home',
              icon: 'home',
            },
            {
              text: dashboard,
              path: './dashboard',
              icon: 'dashboard',
              badge: 'New',
            },
            {
              text: award,
              path: 'award',
              icon: 'award',
            },
            {
              text: subGrant,
              path: 'sub-grant',
              icon: 'money',
              badge: '3',
            },
            {
              text: logout,
              path: './login',
              icon: 'login',
            },
          ] as Menu[];
        })
      )
  );
}
