import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  remixAddLine as add,
  remixDeleteBin2Line as deleteBin,
  remixPencilLine as pencil,
  remixStickyNoteFill as note,
  remixErrorWarningFill as warning,
  remixFileCopyLine as copy,
} from '@ng-icons/remixicon';
import {
  TimesheetDetailDto,
  TimeSheetUi,
  WeekDayUi,
  WeekViewUi,
} from '@grant/data-service';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import { BtpFormAsyncOptions, ModalComponent } from '@btp/web-component';
import {
  DATE_FB_FORMAT,
  DecimalTimeFormatPipe,
  Locale,
} from '@btp/libs/shared';
import { DailyItemFormComponent } from '../daily-item-form/daily-item-form.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { TimesheetUtils } from '../time.utils';

@Component({
  selector: 'tms-timegrid',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoModule,
    NgIconComponent,
    CommonModule,
    ModalComponent,
    DecimalTimeFormatPipe,
    DailyItemFormComponent,
  ],
  templateUrl: './timegrid.component.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ add, deleteBin, pencil, note, warning, copy })],
})
export class TimegridComponent {
  timesheetDetails = input<TimesheetDetailDto[] | undefined>([]);
  timesheets = input<TimeSheetUi[]>([]);
  isFormDisabled = input<boolean>(false);
  formOptions = input<BtpFormAsyncOptions>({});
  weekdays = input<WeekDayUi[]>([]);
  weekdaysTotals = input<number[]>([]);
  weekView = input<WeekViewUi>('weekdays');
  timesheetDetail = input<TimesheetDetailDto | undefined>(undefined);
  weekdayIndex = input<number>(0);
  isSaving = input(false);

  @Output() timesheetChange = new EventEmitter<TimesheetDetailDto>();
  @Output() addTask = new EventEmitter();
  @Output() editTask = new EventEmitter<TimeSheetUi>();
  @Output() deleteTask = new EventEmitter<TimeSheetUi>();
  @Output() editDailyTask = new EventEmitter<TimesheetDetailDto | undefined>();
  @Output() deleteTimesheetDetail = new EventEmitter<TimesheetDetailDto>();
  @Output() selectDay = new EventEmitter<number>();
  @Output() duplicate = new EventEmitter<TimeSheetUi>();

  locale = inject(Locale);
  timesheetUtils = inject(TimesheetUtils);
  today = signal(DateTime.now());

  isWeekView = computed<boolean>(() => {
    return this.weekView() === 'week';
  });

  isWeekdaysView = computed<boolean>(() => {
    return this.weekView() === 'weekdays';
  });

  constructor() {
    // Refocus on the edting timesheet detail to update the newly saved id
    toObservable(this.timesheetDetails).subscribe(timesheets => {
      let foundOne = false;
      timesheets?.forEach(timesheet => {
        if (this.isCurrentDailyTask(timesheet)) {
          this.onFocus(timesheet);
          foundOne = true;
        }
      });
      // Focus out if the timesheet detail was deleted
      if (!foundOne) {
        this.onFocus(undefined);
      }
    });
  }

  onTimeChange(changed: TimesheetDetailDto, timesheet: TimeSheetUi): void {
    if (!changed.TMDetailID && !changed.Hours) {
      return;
    }
    this.timesheetChange.emit({
      ...changed,
      ProjectCode: timesheet.project,
      TaskCode: timesheet.task,
    });
  }

  onAddProject(): void {
    this.addTask.emit();
  }

  isToday(date: Date): boolean {
    return this.timesheetUtils.isToday(date);
  }

  isFuture(date: Date): boolean {
    return this.timesheetUtils.isFuture(date);
  }

  onEdit(toEdit: TimeSheetUi): void {
    this.editTask.emit(cloneDeep(toEdit));
  }

  onFocus(focusedTimesheet?: TimesheetDetailDto): void {
    this.editDailyTask.emit(cloneDeep(focusedTimesheet));
  }

  onSelectDay(index: number): void {
    this.selectDay.emit(index);
  }

  onDelete(toDelete: TimeSheetUi): void {
    this.deleteTask.emit(toDelete);
  }

  onDuplicate(toDuplicate: TimeSheetUi): void {
    this.duplicate.emit(toDuplicate);
  }

  isCurrentDailyTask(timesheet: TimesheetDetailDto): boolean {
    if (!this.timesheetDetail()?.TMDate) {
      return false;
    }
    if (!timesheet.TMDate) {
      return false;
    }

    const timesheetDetailDate = DateTime.fromJSDate(
      new Date(this.timesheetDetail()!.TMDate!)
    ).toFormat(DATE_FB_FORMAT);

    const selectTimesheetDate = DateTime.fromJSDate(
      new Date(timesheet.TMDate)
    ).toFormat(DATE_FB_FORMAT);

    const isTheSameDate = timesheetDetailDate === selectTimesheetDate;

    return (
      this.timesheetDetail()!.OrderNumber === timesheet.OrderNumber &&
      this.timesheetDetail()!.ProjectCode === timesheet.ProjectCode &&
      isTheSameDate
    );
  }

  onDeleteTimehseetDetail(): void {
    this.deleteTimesheetDetail.emit(this.timesheetDetail());
  }
}
