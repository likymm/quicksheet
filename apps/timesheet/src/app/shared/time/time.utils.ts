import { DateTime } from 'luxon';
import { Injectable, inject, signal } from '@angular/core';
import { DATE_FB_FORMAT } from '@btp/libs/shared';
import { Router } from '@angular/router';
import {
  TimeSheetUi,
  TimesheetDetailDto,
  TimesheetHeaderDto,
  TimesheetStatus,
  WeekViewUi,
} from '@grant/data-service';
import { TimesheetForm } from './timesheet-form/timesheet-form.model';

@Injectable({ providedIn: 'root' })
export class TimesheetUtils {
  router = inject(Router);
  today = signal(DateTime.now());

  constructor() {
    setInterval(() => {
      this.today.set(DateTime.now());
    }, 5000);
  }

  /* Get the closest previous Monday for a given date */
  getClosestPreviousMonday(date: DateTime): Date {
    // Calculate the difference in days from the current day to Monday (1 for Monday, 2 for Tuesday, etc.)
    const dayOfWeekDiff = (date.weekday - 1 + 7) % 7;

    // Use minus method to subtract the calculated difference in days
    const closestPreviousMonday = date.minus({ days: dayOfWeekDiff });

    return closestPreviousMonday.toJSDate();
  }

  getTimesheetEquivalentDay(date: string, startDateOfTimesheet: Date): string {
    return DateTime.fromJSDate(startDateOfTimesheet)
      .plus({
        day: DateTime.fromJSDate(new Date(date)).weekday - 1,
      })
      .toFormat(DATE_FB_FORMAT);
  }

  isDayExist(date: Date, dates: Date[]): boolean {
    return dates.some(dateToCompare =>
      DateTime.fromJSDate(date).hasSame(
        DateTime.fromJSDate(dateToCompare),
        'day'
      )
    );
  }

  isDateEquals(date1: Date, date2: Date): boolean {
    return (
      DateTime.fromJSDate(date1).toFormat(DATE_FB_FORMAT) ===
      DateTime.fromJSDate(date2).toFormat(DATE_FB_FORMAT)
    );
  }

  navigateToTimesheetDetails(id: number): void {
    this.router.navigate(['/time/date'], {
      queryParams: {
        id,
      },
      queryParamsHandling: 'merge',
    });
  }

  onGoToTodaysWeek(timesheetHeaders: TimesheetHeaderDto[]): void {
    const todaysMonday = this.getClosestPreviousMonday(DateTime.now());
    const withTheSameWeek = timesheetHeaders?.find(x =>
      this.isDateEquals(new Date(x.TMPeriodStartDate!), todaysMonday)
    );
    if (withTheSameWeek?.TMHeaderID) {
      this.navigateToTimesheetDetails(withTheSameWeek.TMHeaderID);
    }
  }

  weekDayToDate(
    weekDate?: string | null,
    startDay = true
  ): DateTime | undefined {
    if (!weekDate) {
      return undefined;
    }

    // Parse the ISO week string // Extract year and week number from ISO week string
    const [yearStr, weekStr] = weekDate.split('-W');
    const year = parseInt(yearStr);
    const week = parseInt(weekStr);

    // Create a DateTime object for the first day of the given week
    const luxonDate = DateTime.fromObject({
      weekYear: year,
      weekNumber: week,
      weekday: startDay ? 1 : 7,
    });

    return luxonDate;
  }

  dateToWeek(date: Date): string | undefined {
    return DateTime.fromJSDate(date).toISOWeekDate()?.substring(0, 8);
  }

  /**
   * Generate order number based on the availablility of the order number
   * @returns new order number
   */
  generateOrderNumber(
    timesheetDetail?: TimesheetDetailDto,
    timesheetDetails?: TimesheetDetailDto[],
    startDateOfTimesheet?: Date
  ): number {
    if (!timesheetDetail) {
      return 0;
    }

    if (!startDateOfTimesheet) {
      return 0;
    }

    if (typeof timesheetDetail.OrderNumber === 'number') {
      return timesheetDetail.OrderNumber;
    }

    // Get the `timesheetDetail` that is in exactly the same spot (project, task, and day)
    // and no `TMDetailID` yet, meaning that it is vacant and spot is available
    const theSameProject = timesheetDetails?.find(
      detail =>
        detail.ProjectCode === timesheetDetail.ProjectCode &&
        detail.TaskCode === timesheetDetail.TaskCode &&
        !detail.TMDetailID &&
        this.isDateEquals(
          new Date(detail.TMDate!),
          new Date(timesheetDetail.TMDate!)
        )
    );
    if (theSameProject && typeof theSameProject.OrderNumber === 'number') {
      return theSameProject.OrderNumber;
    }

    // Generate a new order number and make sure the new timesheet detail
    // will be appended and has the heighest order number of all timesheet details
    const weeksdays = [1, 2, 3, 4, 5, 6, 7].map(weekday => {
      return DateTime.fromJSDate(startDateOfTimesheet)
        .plus({
          day: weekday - 1,
        })
        .toJSDate();
    });
    const isSameDayOrderNumbers =
      timesheetDetails
        ?.filter(detail => this.isDayExist(new Date(detail.TMDate!), weeksdays))
        .map(detail => detail.OrderNumber || 0) || [];

    if (!isSameDayOrderNumbers.length) {
      return 0;
    }

    const highestOrderNumber = Math.max(...isSameDayOrderNumbers);

    return highestOrderNumber + 1;
  }

  generateDuplicates(
    timesheetUi: TimeSheetUi,
    timesheetDetails?: TimesheetDetailDto[],
    startDateOfTimesheet?: Date
  ): TimesheetDetailDto[] {
    let orderNumber: number | undefined;
    const toSaveMany: TimesheetDetailDto[] = [];
    timesheetUi.times.forEach(timesheetDetail => {
      if (!timesheetDetail.TMDetailID) {
        return;
      }

      // Generate new order number for the duplicates to be appended as a new line
      if (typeof orderNumber !== 'number') {
        orderNumber = this.generateOrderNumber(
          {
            ...timesheetDetail,
            OrderNumber: undefined,
          } as TimesheetDetailDto,
          timesheetDetails,
          startDateOfTimesheet
        );
      }

      toSaveMany.push({
        ...timesheetDetail,
        OrderNumber: orderNumber,
        TMDetailID: 0,
        Hours: 0,
        BillingNotes: '',
        ApprovedBy: '',
        ApprovedByUsername: '',
        LineItemStatus: TimesheetStatus.Saved,
        Remarks: '',
      } as TimesheetDetailDto);
    });

    return toSaveMany;
  }

  normalizeImport(
    data: TimesheetDetailDto[],
    currentTimesheetHeader: TimesheetHeaderDto
  ): TimesheetDetailDto[] {
    const toSave = data.map(x => {
      return {
        ...x,
        TMDetailID: 0,
        TMHeaderID: currentTimesheetHeader?.TMHeaderID,
        TMHeaderCodeID: currentTimesheetHeader?.TMHeaderCodeID,
      };
    });

    const hasError = toSave.some(x => {
      if (!currentTimesheetHeader?.TMPeriodStartDate) {
        return true;
      }
      if (!currentTimesheetHeader?.TMPeriodEndDate) {
        return true;
      }
      if (!x.TMDate) {
        return true;
      }
      const startDate = new Date(currentTimesheetHeader!.TMPeriodStartDate!);
      const endDate = new Date(currentTimesheetHeader!.TMPeriodEndDate!);
      const dateToCheck = new Date(x.TMDate);
      const isWithinRange = dateToCheck >= startDate && dateToCheck <= endDate;

      return !isWithinRange;
    });

    if (hasError) {
      alert('Mismatched dates! Please check your file dates.');
      return [];
    }

    return toSave;
  }

  normalizeToSaveTmDetails({
    timesheetDetailModalFormOutput,
    headerId,
    currentTimesheetHeader,
    currentTimesheetDetail,
    timesheets,
    weekView,
    startDateOfTimesheet,
  }: {
    timesheetDetailModalFormOutput: TimesheetForm;
    headerId: number;
    currentTimesheetHeader: TimesheetHeaderDto;
    currentTimesheetDetail: TimesheetDetailDto;
    timesheets: TimeSheetUi[];
    weekView: WeekViewUi;
    startDateOfTimesheet: Date;
  }): TimesheetDetailDto[] {
    const toSaveMany: TimesheetDetailDto[] = [];
    let toSave: TimesheetDetailDto = {
      ...timesheetDetailModalFormOutput,
      TMHeaderID: headerId,
      TMDate:
        timesheetDetailModalFormOutput.TMDate ||
        DateTime.fromJSDate(
          new Date(currentTimesheetHeader.TMPeriodStartDate!)
        ).toFormat(DATE_FB_FORMAT),
    };

    toSave = {
      ...toSave,
      OrderNumber: this.generateOrderNumber(
        {
          ...toSave,
          // Change the order number to `undefined` if Project or Task is changed
          // so `generateOrderNumber` will create a new order
          OrderNumber:
            toSave.ProjectCode === currentTimesheetDetail.ProjectCode &&
            toSave.TaskCode === currentTimesheetDetail.TaskCode &&
            this.isDateEquals(
              new Date(toSave.TMDate!),
              new Date(currentTimesheetDetail.TMDate!)
            )
              ? toSave.OrderNumber
              : undefined,
        },
        timesheets.flatMap(x => x.times),
        startDateOfTimesheet
      ),
    };

    // If entire week is checked, create entries for the rest of the days within the week
    const weeksdays =
      weekView === 'week' ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5];
    if (timesheetDetailModalFormOutput.isEntireWeek) {
      weeksdays.forEach(weekday => {
        toSaveMany.push({
          ...toSave,
          TMDate: DateTime.fromJSDate(startDateOfTimesheet)
            .plus({
              day: weekday - 1,
            })
            .toFormat(DATE_FB_FORMAT)!,
        });
      });
    } else {
      toSaveMany.push(toSave);
    }
    return toSaveMany;
  }

  convertTmDetailsToUi(
    timesheetDetails: TimesheetDetailDto[],
    currentTimesheetHeader: TimesheetHeaderDto,
    startDateOfTimesheet: Date
  ): TimeSheetUi[] {
    const timesheetUi: TimeSheetUi[] = [];

    timesheetDetails?.forEach(timesheetDetail => {
      const timesFromDb: TimesheetDetailDto[] = [];
      const timesheetDetailsByTask = timesheetDetails?.filter(
        x => x.OrderNumber === timesheetDetail.OrderNumber
      );
      timesheetDetailsByTask
        ?.filter(x => x.TaskCode === timesheetDetail.TaskCode)
        .forEach(detail => {
          const dateIndex = DateTime.fromJSDate(
            new Date(detail.TMDate!)
          ).weekday;
          timesFromDb[dateIndex] = detail;
        });

      const times = [1, 2, 3, 4, 5, 6, 7].map(weekday => {
        if (timesFromDb[weekday]) {
          return timesFromDb[weekday];
        }
        // Set initial values for days that are not inputted yet
        return {
          Hours: undefined,
          TMDetailID: 0,
          BillingNotes: '',
          BillingType: timesheetDetail.BillingType,
          ProjectCode: timesheetDetail.ProjectCode,
          TaskCode: timesheetDetail.TaskCode,
          TMHeaderID: currentTimesheetHeader?.TMHeaderID,
          TMDate: DateTime.fromJSDate(startDateOfTimesheet)
            .plus({
              day: weekday - 1,
            })
            .toFormat(DATE_FB_FORMAT),
          OrderNumber: timesheetDetail.OrderNumber,
        } as TimesheetDetailDto;
      });

      timesheetUi[timesheetDetail.OrderNumber!] = {
        project: timesheetDetail.ProjectCode!,
        task: timesheetDetail.TaskCode!,
        times: times,
        orderNumber: timesheetDetail.OrderNumber,
      };
    });

    return timesheetUi.filter(x => !!x);
  }

  isToday(date: Date): boolean {
    return DateTime.fromJSDate(date).toISODate() === this.today().toISODate();
  }

  isFuture(date: Date): boolean {
    return (
      DateTime.fromJSDate(date).toJSDate().getTime() >
      this.today().toJSDate().getTime()
    );
  }
}
