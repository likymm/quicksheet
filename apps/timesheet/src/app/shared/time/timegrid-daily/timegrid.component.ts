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
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  remixAddLine as add,
  remixDeleteBin2Line as deleteBin,
  remixPencilLine as pencil,
  remixStickyNoteFill as note,
  remixFileWarningLine as warning,
} from '@ng-icons/remixicon';
import {
  TimesheetDetailDto,
  TimeSheetUi,
  WeekDayUi,
} from '@grant/data-service';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import { BtpFormAsyncOptions, ModalComponent } from '@btp/web-component';
import { DecimalTimeFormatPipe, Locale, StatusBgPipe } from '@btp/libs/shared';
import { DailyItemFormComponent } from '../daily-item-form/daily-item-form.component';
import { ApproverRemarksComponent } from '../../approver-remarks/approver-remarks.component';

@Component({
  selector: 'tms-timegrid-daily',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoModule,
    NgIconComponent,
    CommonModule,
    ModalComponent,
    DecimalTimeFormatPipe,
    DailyItemFormComponent,
    ApproverRemarksComponent,
    StatusBgPipe,
  ],
  templateUrl: './timegrid.component.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ add, deleteBin, pencil, note, warning })],
})
export class TimegridDailyComponent {
  isFormDisabled = input<boolean>(false);
  isSaving = input(false);
  isFetching = input(false);
  isDeleting = input(false);
  formOptions = input<BtpFormAsyncOptions>({});
  weekdays = input<WeekDayUi[]>([]);
  timesheets = input<TimeSheetUi[]>([]);
  weekdaysTotals = input<number[]>([]);
  timesheetDetail = input<TimesheetDetailDto | undefined>(undefined);
  weekdayIndex = input<number>(0);

  @Output() timesheetChange = new EventEmitter<TimesheetDetailDto>();
  @Output() addTask = new EventEmitter<TimesheetDetailDto | undefined>();
  @Output() deleteTimesheetDetails = new EventEmitter<TimesheetDetailDto>();
  @Output() editDailyTask = new EventEmitter<TimesheetDetailDto>();
  @Output() deleteTimesheetDetail = new EventEmitter<TimesheetDetailDto>();
  @Output() selectDay = new EventEmitter<number>();
  @Output() timesheetEdit = new EventEmitter<TimesheetDetailDto>();

  locale = inject(Locale);
  today = DateTime.now();
  isDeleteTimeSheetModalOpen = signal<boolean>(false);
  toDeleteTask = signal<TimeSheetUi | undefined>(undefined);

  onTimeChange(changed: TimesheetDetailDto, timesheet: TimeSheetUi): void {
    this.timesheetChange.emit({
      ...changed,
      ProjectCode: timesheet.project,
      TaskCode: timesheet.task,
    });
  }

  onAddProject(timesheet?: TimesheetDetailDto): void {
    if (!timesheet) {
      this.addTask.emit();
      return;
    }
    this.addTask.emit({
      TMDate: timesheet!.TMDate,
    });
  }

  isCurrentDay(dateString?: string | Date): boolean {
    if (!dateString) {
      return false;
    }
    return (
      DateTime.fromJSDate(new Date(dateString)).weekday ===
      (this.weekdayIndex() ?? 0) + 1
    );
  }

  onSelectDay(index: number): void {
    this.selectDay.emit(index);
  }

  isToday(dateString?: string | Date): boolean {
    if (!dateString) {
      return false;
    }
    return (
      DateTime.fromJSDate(new Date(dateString)).toISODate() ===
      this.today.toISODate()
    );
  }

  isFuture(dateString?: string | Date): boolean {
    if (!dateString) {
      return false;
    }
    return (
      DateTime.fromJSDate(new Date(dateString)).toJSDate().getTime() >
      this.today.toJSDate().getTime()
    );
  }

  onFocus(focusedTimesheet: TimesheetDetailDto): void {
    this.editDailyTask.emit(focusedTimesheet);
  }

  onDelete(toDelete: TimesheetDetailDto): void {
    this.deleteTimesheetDetails.emit(toDelete);
  }

  onEdit(toEdit: TimesheetDetailDto): void {
    this.timesheetEdit.emit(toEdit);
  }

  onDeleteTimehseetDetail(): void {
    this.deleteTimesheetDetail.emit(this.timesheetDetail());
  }
}
