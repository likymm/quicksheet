import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { AuthService } from '@grant/data-service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  remixLoginBoxLine as login,
  remixTimeLine as time,
  remixSurveyLine as review,
  remixGroupLine as group,
} from '@ng-icons/remixicon';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

interface Menu {
  path: string;
  text: string;
  icon: string;
  badge?: string;
  invisible?: boolean;
}

@Component({
  selector: 'tms-sidebar',
  standalone: true,
  imports: [RouterModule, NgIconComponent, TranslocoModule],
  templateUrl: './sidebar.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ login, time, review, group })],
})
export class SidebarComponent {
  translocoService = inject(TranslocoService);
  auth = inject(AuthService);

  user = toSignal(this.auth.getLoggedUser());

  isManager = computed<boolean>(() => {
    return this.user()?.data?.UserRole === 'Manager';
  });

  translated = toSignal(
    this.translocoService.selectTranslate<string[]>([
      'sys.logout',
      'sys.time',
      'sys.review',
      'sys.noTimesheets',
    ])
  );

  userMenu = computed<Menu[]>(() => {
    const [logout, time, review, noTimesheets] = this.translated() || [];
    return [
      {
        text: time,
        path: 'time',
        icon: 'time',
      },
      {
        text: review,
        path: 'review',
        icon: 'review',
        invisible: !this.isManager(),
      },
      {
        text: noTimesheets,
        path: 'no-timesheets',
        icon: 'group',
        invisible: !this.isManager(),
      },
      {
        text: logout,
        path: './login',
        icon: 'login',
      },
    ];
  });
}
