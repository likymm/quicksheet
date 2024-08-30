import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalTimeFormatPipe, TimeAgoPipe } from '@btp/libs/shared';
import { TimesheetHeaderDto } from '@grant/data-service';
import { TranslocoModule } from '@ngneat/transloco';
import { ApproverRemarksComponent } from '../../approver-remarks/approver-remarks.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { remixTimeLine as time } from '@ng-icons/remixicon';

@Component({
  selector: 'tms-time-stats',
  standalone: true,
  imports: [
    TranslocoModule,
    CommonModule,
    DecimalTimeFormatPipe,
    ApproverRemarksComponent,
    NgIconComponent,
    TimeAgoPipe,
  ],
  templateUrl: './time-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ time })],
})
export class TimeStatsComponent {
  timesheetHeader = input<TimesheetHeaderDto | undefined>(undefined);
  isApproving = input<boolean>(false);
  locale = input.required<string>();
}
