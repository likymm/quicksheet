import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TimeAgoPipe } from '@btp/libs/shared';
import { TimesheetDetailDto } from '@grant/data-service';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'tms-approver-remarks',
  standalone: true,
  imports: [CommonModule, TranslocoModule, TimeAgoPipe],
  templateUrl: './approver-remarks.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproverRemarksComponent {
  timesheetDetails = input<TimesheetDetailDto | undefined>();
  locale = input.required<string>();
}
