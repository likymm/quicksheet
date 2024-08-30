import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AcitivityComponent,
  AwardCardComponent,
  OrginizationComponent,
  TaskComponent,
} from '@btp/web-component';
import {
  remixHourglassFill as hourGlass,
  remixEdit2Line as edit,
  remixHandCoinLine as type,
  remixAttachment2 as file,
  remixCalendar2Line as calendar,
  remixWallet3Line as wallet,
  remixDeleteBin6Line as deleteIcon,
} from '@ng-icons/remixicon';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { TranslocoModule } from '@ngneat/transloco';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    TranslocoModule,
    RouterModule,
    NgIconComponent,
    OrginizationComponent,
    AwardCardComponent,
    TaskComponent,
    AcitivityComponent,
  ],
  templateUrl: './award-profile.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ hourGlass, edit, type, file, calendar, wallet, deleteIcon }),
  ],
})
export class AwardProfileComponent {}
