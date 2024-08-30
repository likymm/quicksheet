import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  remixHourglassFill as hourGlass,
  remixEdit2Line as edit,
  remixHandCoinLine as type,
  remixAttachment2 as file,
  remixCalendar2Line as calendar,
  remixWallet3Line as wallet,
  remixDeleteBin6Line as deleteIcon,
} from '@ng-icons/remixicon';
import { TranslocoModule } from '@ngneat/transloco';
import { RouterModule } from '@angular/router';
import { GridModule } from '@progress/kendo-angular-grid';
import {
  AcitivityComponent,
  AwardCardComponent,
  OrginizationComponent,
  TaskComponent,
} from '@btp/web-component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    TranslocoModule,
    RouterModule,
    GridModule,
    TaskComponent,
    OrginizationComponent,
    AwardCardComponent,
    AcitivityComponent,
  ],
  templateUrl: './sub-grant-profile.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ hourGlass, edit, type, file, calendar, wallet, deleteIcon }),
  ],
})
export class SubGrantProfileComponent {
  public gridData = [
    {
      Id: '0001',
      AttachCount: 2,
      NeededDocument: 'Background check',
      StartDate: new Date('2020-01-01'),
      EndDate: new Date('2020-01-01'),
      DueDate: new Date('2020-01-01'),
      Status: 'New',
      Progress: 10,
    },
    {
      Id: '0001',
      AttachCount: 3,
      NeededDocument: 'Background check',
      StartDate: new Date('2020-01-01'),
      EndDate: new Date('2020-01-01'),
      DueDate: new Date('2020-01-01'),
      Status: 'New',
      Progress: 57,
    },
    {
      Id: '0001',
      AttachCount: 1,
      NeededDocument: 'Background check',
      StartDate: new Date('2020-01-01'),
      EndDate: new Date('2020-01-01'),
      DueDate: new Date('2020-01-01'),
      Status: 'New',
      Progress: 18,
    },
  ];
}
