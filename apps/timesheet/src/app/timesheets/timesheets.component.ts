import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  DATE_FB_FORMAT,
  DecimalTimeFormatPipe,
  Locale,
  StatusBgPipe,
} from '@btp/libs/shared';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { TranslocoModule } from '@ngneat/transloco';
import { GridModule } from '@progress/kendo-angular-grid';
import { remixArrowDownSLine as arrowDown } from '@ng-icons/remixicon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  AuthService,
  TimesheetDetailQuerysService,
  TimesheetHeaderDto,
  TimesheetStatus,
} from '@grant/data-service';
import { DateTime } from 'luxon';
import { merge } from 'lodash';
import { ApproverRemarksComponent } from '../shared/approver-remarks/approver-remarks.component';
import { TimesheetUtils } from '../shared/time/time.utils';
import { SortDescriptor } from '@progress/kendo-data-query';

@Component({
  selector: 'tms-timesheets',
  standalone: true,
  imports: [
    TranslocoModule,
    GridModule,
    DecimalTimeFormatPipe,
    CommonModule,
    RouterModule,
    NgIconComponent,
    ReactiveFormsModule,
    ApproverRemarksComponent,
    StatusBgPipe,
  ],
  templateUrl: './timesheets.component.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ arrowDown })],
})
export class TimesheetsComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);
  locale = inject(Locale);
  auth = inject(AuthService);
  timesheetService = inject(TimesheetDetailQuerysService);
  timesheetUtils = inject(TimesheetUtils);

  userId = this.auth.loggedUserId;
  entity = signal(this.auth.getUserEntityLocalStorage());
  status = signal<TimesheetStatus>(TimesheetStatus.Saved);
  sort = signal<SortDescriptor[]>(this.initTimesheetSort());

  timesheetHeaders = toSignal(
    this.timesheetService.getTimesheetHeaders(
      this.userId,
      this.entity,
      this.status
    )
  );

  toAddDate = new FormControl<string | null>(null);

  toAddDateValue = toSignal(this.toAddDate.valueChanges);

  savingHeader = signal(false);

  saveHeaderQeury = this.timesheetService.saveHeader(
    signal(0),
    this.savingHeader,
    newId => {
      this.timesheetUtils.navigateToTimesheetDetails(newId);
    }
  );

  timesheets = signal<TimesheetHeaderDto[]>([]);

  statusFilter: TimesheetStatus[] = [
    TimesheetStatus.All,
    TimesheetStatus.Saved,
    TimesheetStatus.Return,
    TimesheetStatus.Reviewing,
    TimesheetStatus.Submitted,
    TimesheetStatus.Approved,
    TimesheetStatus.Posted,
  ];

  constructor() {
    toObservable(this.timesheetHeaders).subscribe(data => {
      this.timesheets.set(data?.data || []);
    });
  }

  saveHeader(toSave: TimesheetHeaderDto): void {
    this.saveHeaderQeury.mutate(
      merge(
        {
          UserID: this.userId(),
          Entity: this.entity(),
          CreatedBy: this.userId(),
        },
        toSave
      )
    );
  }

  onAddForCurrentWeek(): void {
    const currentDate = DateTime.now();
    const isoWeek = currentDate.toISOWeekDate();
    this.toAddDate.setValue(isoWeek);
    this.onAddHeader();
  }

  onAddHeader(): void {
    const inputValue = this.toAddDateValue();

    const weekdayDate = this.timesheetUtils.weekDayToDate(inputValue);

    this.saveHeader({
      TMPeriodStartDate: weekdayDate?.startOf('week').toFormat(DATE_FB_FORMAT),
      TMPeriodEndDate: weekdayDate?.endOf('week').toFormat(DATE_FB_FORMAT),
      TMTotalHours: 0,
      TMHeaderID: 0,
      IsSubmit: false,
    } as TimesheetHeaderDto);
  }

  onGoToTodaysWeek(): void {
    this.timesheetUtils.onGoToTodaysWeek(this.timesheetHeaders()?.data ?? []);
  }

  initTimesheetSort(): SortDescriptor[] {
    try {
      return JSON.parse(
        localStorage.getItem('timesheets-sort') || '[]'
      ) as SortDescriptor[];
    } catch {
      return [];
    }
  }

  onSortChange(e: SortDescriptor[]): void {
    this.sort.set(e);
    localStorage.setItem('timesheets-sort', JSON.stringify(e));
  }
}
