import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { TimegridComponent } from '../shared/time/timegrid/timegrid.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateTime } from 'luxon';
import {
  AuthService,
  TimeSheetUi,
  TimesheetDetailQuerysService,
  TimesheetHeaderDto,
  WeekDayUi,
  WeekViewUi,
  TimesheetDetailDto,
  ProjectQueryService,
  TimesheetStatus,
} from '@grant/data-service';
import { CommonModule } from '@angular/common';
import { BtpFormAsyncOptions, ModalComponent } from '@btp/web-component';
import { TimesheetFormComponent } from '../shared/time/timesheet-form/timesheet-form.component';
import {
  DATE_FB_FORMAT,
  DecimalTimeFormatPipe,
  Locale,
} from '@btp/libs/shared';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DailyItemFormComponent } from '../shared/time/daily-item-form/daily-item-form.component';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { merge } from 'lodash';
import { TimesheetForm } from '../shared/time/timesheet-form/timesheet-form.model';
import { TimegridDailyComponent } from '../shared/time/timegrid-daily/timegrid.component';
import { TimegridReportComponent } from '../shared/time/timegrid-report/timegrid-report.component';
import { IsFetchingService, IsMutatingService } from '@ngneat/query';
import { ApproverRemarksComponent } from '../shared/approver-remarks/approver-remarks.component';
import { HeadingComponent } from '../shared/time/heading/heading.component';
import { filter } from 'rxjs';
import { TimesheetUtils } from '../shared/time/time.utils';
import { TimeStatsComponent } from '../shared/time/time-stats/time-stats.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'tms-time',
  standalone: true,
  imports: [
    TranslocoModule,
    TimegridComponent,
    TimegridDailyComponent,
    FormsModule,
    CommonModule,
    ModalComponent,
    TimesheetFormComponent,
    DecimalTimeFormatPipe,
    RouterModule,
    DailyItemFormComponent,
    TimegridReportComponent,
    ReactiveFormsModule,
    ApproverRemarksComponent,
    HeadingComponent,
    TimeStatsComponent,
  ],
  templateUrl: './time.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeComponent {
  locale = inject(Locale);
  router = inject(Router);
  route = inject(ActivatedRoute);
  timesheetService = inject(TimesheetDetailQuerysService);
  projectService = inject(ProjectQueryService);
  auth = inject(AuthService);
  timesheetUtils = inject(TimesheetUtils);

  isFetchingService = inject(IsFetchingService);
  isMutatingervice = inject(IsMutatingService);
  isFetching = toSignal(this.isFetchingService.use());
  isMutating = toSignal(this.isMutatingervice.use());
  loggedUserId = this.auth.loggedUserId;
  entity = signal(this.auth.getUserEntityLocalStorage());

  user = toSignal(this.auth.getLoggedUser());

  headerUserId = computed<string | null>(() => {
    if (this.isApproving()) {
      return null;
    }
    return this.loggedUserId();
  });

  isManager = computed<boolean>(() => {
    return this.user()?.data?.UserRole === 'Manager';
  });

  isCurrentUsersTimesheet = computed(() => {
    return (
      this.currentTimesheetHeader()?.UserID?.trim() ===
      this.user()?.data?.UserID?.trim()
    );
  });

  disabledOkTask = signal(false);

  timesheetHeaders = toSignal(
    this.timesheetService.getTimesheetHeaders(
      this.headerUserId,
      this.entity,
      computed(() => (this.isApproving() ? TimesheetStatus.Submitted : null))
    )
  );

  templates = toSignal(
    this.timesheetService.getTimesheetTemplateHeaders(
      this.loggedUserId,
      this.entity
    )
  );

  isProjectModalOpen = signal<boolean>(false);
  isDeleteTimeSheetModalOpen = signal<boolean>(false);
  isDeleteTaskModalOpen = signal<boolean>(false);
  isDeleteTimesheetDetailModalOpen = signal<boolean>(false);
  isReturnModalOpen = signal(false);

  currentDate = DateTime.now();

  resetTimesheetForm = signal<number>(1);

  currentTimesheetDetail = signal<TimesheetDetailDto | undefined>(undefined);
  timesheetDetailModalFormInput = signal<TimesheetForm | undefined>(undefined);
  timesheetDetailModalFormOutput = signal<TimesheetForm | undefined>(undefined);
  changeFromForm = signal<Partial<TimesheetForm>>({});

  willUseTemplate = signal<boolean>(false);

  startDateOfTimesheet = computed<Date>(() => {
    if (this.currentTimesheetHeader()?.TMPeriodStartDate) {
      const startDate = DateTime.fromJSDate(
        new Date(this.currentTimesheetHeader()!.TMPeriodStartDate!)
      );
      return this.timesheetUtils.getClosestPreviousMonday(startDate);
    }
    return new Date();
  });

  queryParams = toSignal(this.route.queryParams);

  headerId = computed<number>(() => {
    const idString = this.queryParams()?.['id'] as string;
    return idString ? Number(idString) : 0;
  });

  templateHeaderId = signal<number | undefined>(undefined);

  isApproving = computed<boolean>(() => {
    const isApproving = this.queryParams()?.['approving'] as string;
    return (
      Boolean(isApproving) &&
      this.isManager() &&
      [
        TimesheetStatus.Reviewing,
        TimesheetStatus.Submitted,
        TimesheetStatus.Return,
      ].includes(this.currentTimesheetHeader()?.Status as TimesheetStatus)
    );
  });

  currentTimesheetHeaderRequest = toSignal(
    this.timesheetService.getHeaderById(this.headerId)
  );

  timesheetApproval = this.timesheetService.approval(this.headerId);

  timesheetDetailRemarksInput = new FormControl<string>('');

  billTypes = toSignal(this.projectService.getBillTypes());
  projectCode = signal<string>('');
  projects = toSignal(
    this.projectService.getUserProjects(this.loggedUserId, this.entity)
  );
  tasks = toSignal(
    this.projectService.getUserTask(
      this.loggedUserId,
      this.entity,
      this.projectCode
    )
  );

  savingHeader = signal(false);
  saveHeaderQeury = this.timesheetService.saveHeader(
    this.headerId,
    this.savingHeader,
    () => {
      this.router.navigate(['/time']);
    }
  );

  saveTemplateQeury = this.timesheetService.saveHeader(
    this.headerId,
    this.savingHeader,
    newTemplateHeaderId => {
      const newTemplateDetail = this.timesheetDetails()?.data?.map(details => {
        return {
          ...details,
          TMHeaderID: newTemplateHeaderId,
          TMDetailID: 0,
        };
      });
      this.saveTimesheetDetailsQuery.mutate(newTemplateDetail);
    }
  );

  currrentWeekdayIndex = computed<number>(() => {
    const weekdayParams = Number(this.queryParams()?.['index']);
    if (!isNaN(weekdayParams)) {
      return weekdayParams;
    }
    return DateTime.now().weekday - 1;
  });

  timesheetFormOptions = computed<BtpFormAsyncOptions>(() => {
    return {
      ProjectCode: this.projects()?.data ?? [],
      TaskCode: this.tasks()?.data ?? [],
      BillingType: this.billTypes()?.data ?? [],
    };
  });

  currentTimesheetHeader = computed<TimesheetHeaderDto | undefined>(() => {
    return this.currentTimesheetHeaderRequest()?.data;
  });

  loadingTimesheetHeader = computed<boolean>(() => {
    return !!this.currentTimesheetHeaderRequest()?.isLoading;
  });

  weekView = signal<WeekViewUi>(
    (localStorage.getItem('week-view') as WeekViewUi) || 'weekdays'
  );

  weekdays = computed<WeekDayUi[]>(() => {
    if (!this.currentTimesheetHeader()?.TMPeriodStartDate) {
      return [];
    }

    const currentWeekdays: WeekDayUi[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = DateTime.fromJSDate(this.startDateOfTimesheet()).plus(
        {
          days: i,
        }
      );
      const dayOfWeekName = currentDate.toFormat('EEE');
      currentWeekdays.push({
        name: dayOfWeekName,
        date: currentDate.toJSDate(),
      });
    }
    return currentWeekdays;
  });

  weekdaysTotals = computed<number[]>(() => {
    const result: number[] = [];
    this.timesheets().forEach(timesheet => {
      timesheet.times.forEach((time, index) => {
        if (time) {
          result[index] = (result[index] || 0) + (time.Hours || 0);
        }
      });
    });
    return result;
  });

  weekTotalHours = computed<number>(() => {
    return this.weekdaysTotals().reduce((x, y) => x + y);
  });

  deleteHeaderByIdQuery = this.timesheetService.deleteHeaders();

  isDeletingTimesheetDetails = signal(false);

  deleteTimesheetDetailsQuery = this.timesheetService.deleteTimesheetDetails(
    this.currentTimesheetHeader,
    () => this.isDeletingTimesheetDetails.set(false)
  );

  saveTimesheetDetailsQuery = this.timesheetService.saveTimesheetDetails(
    this.headerId,
    () => {
      this.isAddingNewTimesheetDetail.set(false);
      this.isMutatingTimesheetDetail.set(false);
    }
  );

  timesheetDetails = toSignal(
    this.timesheetService.getTimesheetDetails(this.headerId)
  );

  isLoadingTimesheetDetails = computed(() => {
    return this.timesheetDetails()?.isLoading;
  });

  isFetchinfTimesheetDetails = computed(() => {
    return !!this.timesheetDetails()?.isFetching;
  });

  templateDetails = toSignal(
    this.timesheetService.getTimesheetDetails(this.templateHeaderId)
  );

  tasksUnique = computed<TimesheetDetailDto[]>(() => {
    if (!this.timesheetDetails()?.data) {
      return [];
    }
    const taskCodes = this.timesheetDetails()!.data!.map(x => x.TaskCode!);
    const uniqueCodes = [...new Set(taskCodes)];
    return uniqueCodes?.map(
      taskCode =>
        this.timesheetDetails()!.data!.find(x => x.TaskCode === taskCode)!
    );
  });

  timesheets = computed<TimeSheetUi[]>(() => {
    if (!this.timesheetDetails()?.data?.length) {
      return [];
    }
    if (!this.currentTimesheetHeader()) {
      return [];
    }
    return this.timesheetUtils.convertTmDetailsToUi(
      this.timesheetDetails()!.data!,
      this.currentTimesheetHeader()!,
      this.startDateOfTimesheet()
    );
  });

  timesheetDetail$ = toObservable(this.timesheetDetails);

  timesheetToDelete = signal<TimeSheetUi | undefined>(undefined);
  timesheetDetailToDelete = signal<TimesheetDetailDto | undefined>(undefined);

  isAddingNewTimesheetDetail = signal<boolean>(false);
  isMutatingTimesheetDetail = signal<boolean>(false);

  canEdit = computed<boolean>(() => {
    return (
      this.currentTimesheetHeader()?.Status === TimesheetStatus.Saved ||
      this.currentTimesheetHeader()?.Status === TimesheetStatus.Return
    );
  });

  canBeApproved = computed<boolean>(
    () =>
      !this.timesheetDetails()?.data?.some(
        x => x.LineItemStatus === TimesheetStatus.Return
      )
  );

  isApproved = computed<boolean>(() => {
    return this.currentTimesheetHeader()?.Status === TimesheetStatus.Approved;
  });

  isFormDisabled = computed<boolean>(() => !this.canEdit());

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['index']) {
        return;
      }
      if (!params['approving']) {
        return;
      }
      this.weekView.set('report');
    });

    // Cascade task and select the first task as default
    // Cascade billing based on the default of the newly selected task
    toObservable(this.tasks).subscribe(taskQuery => {
      const firstTaskOption = taskQuery?.data?.[0];
      if (!firstTaskOption) {
        return;
      }
      if (this.changeFromForm().ProjectCode) {
        const newValue: TimesheetForm = {
          ...this.timesheetDetailModalFormInput()!,
          TaskCode: firstTaskOption?.TaskCode,
          BillingType: firstTaskOption?.BillingType,
          ProjectCode: this.changeFromForm()?.ProjectCode,
        };
        this.timesheetDetailModalFormInput.set(newValue);
      }
    });

    // Append the template after they are fetched
    toObservable(this.templateDetails)
      .pipe(filter(() => this.willUseTemplate()))
      .subscribe(() => this.appendTemplateDetailsToTimesheetDetails());
  }

  onTimesheetChange(timesheet: TimesheetDetailDto): void {
    timesheet = { ...timesheet, Hours: timesheet.Hours ?? 0 };
    this.isAddingNewTimesheetDetail.set(!timesheet.TMDetailID);
    this.saveTimesheetDetailsQuery.mutate([
      merge(
        {
          TMDate: DateTime.fromJSDate(new Date()).toFormat(DATE_FB_FORMAT),
        } as TimesheetDetailDto,
        timesheet
      ),
    ]);
  }

  onAddTask(preset?: TimesheetDetailDto): void {
    this.openTimesheetDetailFormModal(preset);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEditTask(timesheet: TimeSheetUi): void {
    // todo: edit the whole row
    this.isProjectModalOpen.set(true);
  }

  onEditTimesheetDetails(timesheet?: TimesheetDetailDto): void {
    this.setEditingTimesheetDetails(timesheet);
  }

  setEditingTimesheetDetails(timesheet?: TimesheetDetailDto): void {
    this.currentTimesheetDetail.set(timesheet);

    // Init new form value
    this.timesheetDetailModalFormInput.set({
      ...timesheet,
      isEntireWeek: false,
    });

    if (timesheet?.ProjectCode) {
      this.projectCode.set(timesheet?.ProjectCode);
    }
  }

  openTimesheetDetailFormModal(timesheet?: TimesheetDetailDto): void {
    this.setEditingTimesheetDetails({
      ...timesheet,
      TMDate:
        timesheet?.TMDate ||
        DateTime.fromJSDate(this.startDateOfTimesheet()).toFormat(
          DATE_FB_FORMAT
        ),
    });
    this.isProjectModalOpen.set(true);
  }

  onDeleteHeader(): void {
    this.isDeleteTimeSheetModalOpen.set(true);
  }

  onDeleteTask(timesheet: TimeSheetUi): void {
    this.timesheetToDelete.set(timesheet);
    this.isDeleteTaskModalOpen.set(true);
  }

  onConfirmDeleteTask(): void {
    if (this.timesheetToDelete()?.times?.length) {
      const ids = this.timesheetToDelete()
        ?.times.map(x => x.TMDetailID!)
        .filter(id => !!id);
      this.isDeletingTimesheetDetails.set(true);
      this.deleteTimesheetDetailsQuery.mutate(ids);
    }
  }

  appendTemplateDetailsToTimesheetDetails(): void {
    const orderNumbers = this.timesheetDetails()?.data?.length
      ? this.timesheetDetails()?.data?.map(x => x.OrderNumber || 0)
      : [0];
    const nextOrderNumber = Math.max(...new Set(orderNumbers)) + 1;

    if (this.templateDetails()?.data?.length) {
      const toAddFromTemplateDetails = this.templateDetails()?.data?.map(
        detail => {
          return {
            ...detail,
            TMHeaderID: this.currentTimesheetHeader()?.TMHeaderID,
            TMHeaderCodeID: this.currentTimesheetHeader()?.TMHeaderCodeID,
            TMHeaderCode: this.currentTimesheetHeader()?.TMHeaderCode,
            TMHeaderDescription:
              this.currentTimesheetHeader()?.TMHeaderDescription,
            TMDetailID: 0,
            TMDate: this.timesheetUtils.getTimesheetEquivalentDay(
              detail.TMDate!,
              this.startDateOfTimesheet()
            ),
            OrderNumber: nextOrderNumber + (detail.OrderNumber || 0),
          } as TimesheetDetailDto;
        }
      );
      this.saveTimesheetDetailsQuery.mutate(toAddFromTemplateDetails);
      this.willUseTemplate.set(false);
      this.templateHeaderId.set(undefined);
    }
  }

  onAddNewStateTask(timesheetDetail?: TimesheetDetailDto): void {
    if (!timesheetDetail) {
      this.openTimesheetDetailFormModal();
    } else {
      this.isAddingNewTimesheetDetail.set(true);
      this.currentTimesheetDetail.set(timesheetDetail);
      this.timesheetDetailModalFormOutput.set(timesheetDetail as TimesheetForm);
      this.onConfirmAddTask();
    }
  }

  onConfirmAddTask(): void {
    if (
      !this.timesheetDetailModalFormOutput() ||
      !this.currentTimesheetHeader() ||
      !this.currentTimesheetDetail() ||
      !this.startDateOfTimesheet()
    ) {
      return;
    }

    const toSaveMany = this.timesheetUtils.normalizeToSaveTmDetails({
      currentTimesheetDetail: this.currentTimesheetDetail()!,
      timesheetDetailModalFormOutput: this.timesheetDetailModalFormOutput()!,
      headerId: this.headerId(),
      currentTimesheetHeader: this.currentTimesheetHeader()!,
      startDateOfTimesheet: this.startDateOfTimesheet()!,
      timesheets: this.timesheets(),
      weekView: this.weekView(),
    });

    this.saveTimesheetDetailsQuery.mutate(toSaveMany);
    this.resetFormTrigger();
  }

  resetFormTrigger(): void {
    this.resetTimesheetForm.update(v => v + 1);
    this.changeFromForm.set({});
    this.timesheetDetailModalFormInput.set(undefined);
    this.currentTimesheetDetail.set(undefined);
  }

  onSubmitHeader(): void {
    this.saveHeaderQeury.mutate({
      ...this.currentTimesheetHeader(),
      IsSubmit: true,
    });
  }

  onRecallTimesheet(): void {
    this.timesheetApproval.mutate({
      action: TimesheetStatus.Saved,
      headerId: this.headerId(),
      remarks: '',
    });
  }

  onConfirmDeleteHeader(): void {
    if (this.currentTimesheetHeader()?.TMHeaderID) {
      this.deleteHeaderByIdQuery.mutate([
        this.currentTimesheetHeader()!.TMHeaderID!,
      ]);
      this.router.navigate(['./time']);
    }
  }

  viewIn(view: WeekViewUi): void {
    this.weekView.set(view);
    localStorage.setItem('week-view', view);

    if (!this.currentTimesheetDetail()?.TMDetailID) {
      this.currentTimesheetDetail.set(undefined);
    }
  }

  timesheetFormModalChange(changeFromForm: Partial<TimesheetForm>): void {
    this.changeFromForm.set(changeFromForm);

    const formValue = {
      ...this.timesheetDetailModalFormInput(),
      ...(changeFromForm as TimesheetForm),
    };

    // Update the `timesheetDetailModalFormInput` when the `billingType` cascaded
    // so it will update the form value based on the cascaded `billingType`
    if (
      changeFromForm.TaskCode &&
      this.timesheetDetailModalFormInput()?.BillingType !==
        formValue.BillingType
    ) {
      const selectedTaskCodeDefaultBillingType = this.tasks()?.data?.find(
        b => b.TaskCode === formValue.TaskCode
      )?.BillingType;
      this.timesheetDetailModalFormInput.set({
        ...this.timesheetDetailModalFormInput()!,
        BillingType: selectedTaskCodeDefaultBillingType,
      });
    }

    // Set project new value for the task to cascade
    if (this.projectCode() !== formValue.ProjectCode) {
      this.projectCode.set(formValue.ProjectCode || '');
    }

    this.timesheetDetailModalFormOutput.set({
      ...this.timesheetDetailModalFormInput()!,
      ...changeFromForm,
    });
  }

  onDeleteTimesheetDetail(value: TimesheetDetailDto): void {
    this.timesheetDetailToDelete.set(value);
    this.isDeleteTimesheetDetailModalOpen.set(true);
  }

  onConfirmDeleteTimesheetDetail(): void {
    const id = this.timesheetDetailToDelete()?.TMDetailID;
    if (!id) {
      return;
    }
    this.isDeletingTimesheetDetails.set(true);
    this.deleteTimesheetDetailsQuery.mutate([id]);
  }

  onApproveHeader(): void {
    this.timesheetApproval.mutate({
      action: TimesheetStatus.Approved,
      headerId: this.headerId(),
      remarks: '',
    });
    this.router.navigate(['/review']);
  }

  onReturnHeader(remarks: string): void {
    this.timesheetApproval.mutate({
      action: TimesheetStatus.Return,
      headerId: this.headerId(),
      remarks,
    });
    this.router.navigate(['/review']);
  }

  onApproveTimesheetDetails(details: TimesheetDetailDto): void {
    this.timesheetApproval.mutate({
      action: TimesheetStatus.Approved,
      detailId: details.TMDetailID,
      remarks: '',
    });

    this.onStartReview();
  }

  onConfirmReturnTimesheetDetails(): void {
    // Return the details
    this.timesheetApproval.mutate({
      action: TimesheetStatus.Return,
      detailId: this.currentTimesheetDetail()?.TMDetailID,
      remarks: this.timesheetDetailRemarksInput.value || '',
    });
    this.timesheetDetailRemarksInput.reset();

    this.onStartReview();
  }

  onReturnTimesheetDetails(timesheetDetail: TimesheetDetailDto): void {
    this.isReturnModalOpen.set(true);
    this.currentTimesheetDetail.set(timesheetDetail);
  }

  onSelectDay(index: number): void {
    this.router.navigate([], {
      queryParams: { index },
      queryParamsHandling: 'merge',
    });
  }

  onAddTemplate(templateDescription: string): void {
    const template: TimesheetHeaderDto = {
      ...this.currentTimesheetHeader(),
      TMHeaderDescription: templateDescription,
      TMHeaderID: 0,
      IsTemplate: true,
    };
    this.saveTemplateQeury.mutate(template);
  }

  onUseTemplate(template: TimesheetHeaderDto): void {
    this.willUseTemplate.set(true);
    this.templateHeaderId.set(template.TMHeaderID);
  }

  onDeleteTemplate(template: TimesheetHeaderDto): void {
    if (!template?.TMHeaderID) {
      return;
    }
    this.deleteHeaderByIdQuery.mutate([template.TMHeaderID]);
  }

  nextTimesheet(isNext: boolean): void {
    if (!this.timesheetHeaders()?.data) {
      return;
    }
    const index =
      this.timesheetHeaders()?.data!.findIndex(
        x => x.TMHeaderID === this.currentTimesheetHeader()?.TMHeaderID
      ) ?? 0;

    const newIndex = isNext ? index + 1 : index - 1;
    const newTimesheetHeader =
      this.timesheetHeaders()?.data![newIndex]?.TMHeaderID;

    if (newTimesheetHeader) {
      this.timesheetUtils.navigateToTimesheetDetails(newTimesheetHeader);
    }
  }

  onGoToTodaysWeek(): void {
    this.timesheetUtils.onGoToTodaysWeek(this.timesheetHeaders()?.data ?? []);
  }

  onTaskFormValidChange(isValid: boolean): void {
    this.disabledOkTask.set(!isValid);
  }

  onStartReview(): void {
    this.timesheetApproval.mutate({
      action: TimesheetStatus.Reviewing,
      headerId: this.currentTimesheetHeader()?.TMHeaderID,
      remarks: '',
    });
  }

  exportToExcel(): void {
    const data = this.timesheetDetails()
      ?.data as unknown as TimesheetDetailDto[];
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${data[0].TMHeaderCodeID}.xlsx`);
  }

  onImport(data: TimesheetDetailDto[]): void {
    if (!this.currentTimesheetHeader()) {
      return;
    }

    const toSave = this.timesheetUtils.normalizeImport(
      data,
      this.currentTimesheetHeader()!
    );
    if (!toSave.length) {
      return;
    }
    this.saveTimesheetDetailsQuery.mutate(toSave);
  }

  onDuplicate(timesheetUi: TimeSheetUi): void {
    this.isMutatingTimesheetDetail.set(true);

    const toSaveMany = this.timesheetUtils.generateDuplicates(
      timesheetUi,
      this.timesheets().flatMap(x => x.times),
      this.startDateOfTimesheet()
    );

    this.saveTimesheetDetailsQuery.mutate(toSaveMany);
  }
}
