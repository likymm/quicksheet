import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  remixAddLine as add,
  remixFileCopyLine as copy,
  remixDeleteBin2Line as deleteBin,
} from '@ng-icons/remixicon';
import {
  BillingTypeDto,
  TimesheetDetailDto,
  TimeSheetUi,
  WeekDayUi,
} from '@grant/data-service';
import { CommonModule } from '@angular/common';
import { BtpFormAsyncOptions } from '@btp/web-component';
import { DecimalTimeFormatPipe, Locale } from '@btp/libs/shared';
import { TimeInfoComponent } from '../time-info/time-info.component';
import { TimesheetUtils } from '../time.utils';

@Component({
  selector: 'tms-timegrid-report',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIconComponent,
    CommonModule,
    DecimalTimeFormatPipe,
    TimeInfoComponent,
  ],
  templateUrl: './timegrid-report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ add, copy, deleteBin })],
})
export class TimegridReportComponent {
  isFormDisabled = input(false);
  isApproving = input(false);
  isSaving = input(false);
  isFetching = input(false);
  isDeleting = input(false);
  formOptions = input<BtpFormAsyncOptions>({});
  weekdays = input<WeekDayUi[]>([]);
  timesheets = input<TimeSheetUi[]>([]);
  weekdaysTotals = input<number[]>([]);
  weekdayIndex = input<number | undefined>(undefined);
  billingTypes = input<BillingTypeDto[] | undefined>([]);

  @Output() editTask = new EventEmitter<TimeSheetUi>();
  @Output() deleteTask = new EventEmitter<TimeSheetUi>();
  @Output() editDailyTask = new EventEmitter<TimesheetDetailDto>();
  @Output() deleteTimesheetDetail = new EventEmitter<TimesheetDetailDto>();
  @Output() returnTimesheetDetal = new EventEmitter<TimesheetDetailDto>();
  @Output() approveTimesheetDetal = new EventEmitter<TimesheetDetailDto>();
  @Output() addTask = new EventEmitter<TimesheetDetailDto | undefined>();
  @Output() timesheetChange = new EventEmitter<TimesheetDetailDto>();
  @Output() duplicate = new EventEmitter<TimeSheetUi>();

  locale = inject(Locale);
  timesheetUtils = inject(TimesheetUtils);
  inlineEditId = signal<number | undefined>(undefined);

  isToday(date: Date): boolean {
    return this.timesheetUtils.isToday(date);
  }

  isFuture(date: Date): boolean {
    return this.timesheetUtils.isFuture(date);
  }

  onAddProject(preset?: TimesheetDetailDto): void {
    this.addTask.emit(preset);
  }

  onDuplicate(toDuplicate: TimeSheetUi): void {
    this.duplicate.emit(toDuplicate);
  }

  onDelete(toDelete: TimeSheetUi): void {
    this.deleteTask.emit(toDelete);
  }
}
