import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  DATE_FB_FORMAT,
  DecimalTimeFormatPipe,
  Locale,
} from '@btp/libs/shared';
import { TimesheetDetailQuerysService, UserDto } from '@grant/data-service';
import { TranslocoModule } from '@ngneat/transloco';
import { GridModule } from '@progress/kendo-angular-grid';
import { DateTime } from 'luxon';
import { TimesheetUtils } from '../shared/time/time.utils';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    GridModule,
    DecimalTimeFormatPipe,
    CommonModule,
    TranslocoModule,
    ReactiveFormsModule,
  ],
  templateUrl: './no-timesheets.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoTimesheetsComponent {
  locale = inject(Locale);
  timesheetService = inject(TimesheetDetailQuerysService);
  timesheetsUtils = inject(TimesheetUtils);

  lastWeeksMonday = DateTime.fromJSDate(
    this.timesheetsUtils.getClosestPreviousMonday(
      DateTime.now().minus({
        week: 1,
      })
    )
  );

  today = this.timesheetsUtils.dateToWeek(new Date());

  noTimesheetsUser = signal<UserDto[]>([]);

  weekDateInput = new FormControl<string | null>(null);

  weekDateFormatted = computed<(Date | undefined)[]>(() => {
    return this.weekDateToDateRange().map(date => {
      return date
        ? DateTime.fromFormat(date, DATE_FB_FORMAT)?.toJSDate()
        : undefined;
    });
  });

  weekdateInputValue = toSignal(this.weekDateInput.valueChanges);

  weekDateToDateRange = computed<(string | undefined)[]>(() => {
    const from = this.timesheetsUtils
      .weekDayToDate(this.weekdateInputValue())
      ?.toFormat(DATE_FB_FORMAT);

    const to = this.timesheetsUtils
      .weekDayToDate(this.weekdateInputValue(), false)
      ?.toFormat(DATE_FB_FORMAT);

    return [from, to];
  });

  noTimesheetUsersQuery = toSignal(
    this.timesheetService.getEmployeeNoTimesheet(this.weekDateToDateRange)
  );

  constructor() {
    toObservable(this.noTimesheetUsersQuery).subscribe(data => {
      this.noTimesheetsUser.set(data?.data || []);
    });

    this.weekDateInput.setValue(
      this.lastWeeksMonday.toISOWeekDate()?.substring(0, 8) || null
    );
  }
}
