import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Output,
  signal,
} from '@angular/core';
import {
  BtpFormAsyncOptions,
  BtpFormGroup,
  BtpInputType,
  FormComponent,
  FormOutput,
} from '@btp/web-component';
import {
  AuthService,
  BillingTypeDto,
  ProjectQueryService,
  TimesheetHeaderDto,
  UserProjectTaskDto,
} from '@grant/data-service';
import { TranslocoModule } from '@ngneat/transloco';
import { TimesheetForm } from './timesheet-form.model';
import { DateTime } from 'luxon';
import { ApproverRemarksComponent } from '../../approver-remarks/approver-remarks.component';
import { DATE_FB_FORMAT, StatusBgPipe } from '@btp/libs/shared';

@Component({
  selector: 'tms-timesheet-form',
  standalone: true,
  imports: [
    TranslocoModule,
    FormComponent,
    CommonModule,
    ApproverRemarksComponent,
    StatusBgPipe,
  ],
  templateUrl: './timesheet-form.component.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetFormComponent {
  timesheetDetail = input<TimesheetForm | undefined>();
  locale = input.required<string>();
  timesheetHeader = input<TimesheetHeaderDto>();
  resetFormCount = input(0);
  projects = input<UserProjectTaskDto[] | undefined>([]);
  tasks = input<UserProjectTaskDto[] | undefined>([]);
  billingTypes = input<BillingTypeDto[] | undefined>([]);

  @Output() changeTimesheetDetail = new EventEmitter<Partial<TimesheetForm>>();
  @Output() validChange = new EventEmitter<boolean>();

  auth = inject(AuthService);
  projectService = inject(ProjectQueryService);

  userId = this.auth.loggedUserId();
  entity = signal(this.auth.getUserEntityLocalStorage());
  minDate = computed(() => {
    return this.timesheetHeader()
      ? DateTime.fromJSDate(
          new Date(this.timesheetHeader()!.TMPeriodStartDate!)
        ).toFormat(DATE_FB_FORMAT)
      : undefined;
  });
  maxDate = computed(() => {
    return this.timesheetHeader()
      ? DateTime.fromJSDate(
          new Date(this.timesheetHeader()!.TMPeriodEndDate!)
        ).toFormat(DATE_FB_FORMAT)
      : undefined;
  });

  hasOrderNumber = computed(() => {
    return typeof this.timesheetDetail()?.OrderNumber === 'number';
  });

  formOptions = computed<BtpFormAsyncOptions>(() => {
    return {
      ProjectCode: this.projects() ?? [],
      TaskCode: this.tasks() ?? [],
      BillingType: this.billingTypes() ?? [],
    };
  });

  form = computed<BtpFormGroup<TimesheetForm>[]>(() => {
    return [
      {
        type: BtpInputType.select,
        label: 'Project',
        required: true,
        field: 'ProjectCode',
        optionValue: 'ProjectCode' as keyof UserProjectTaskDto,
        optionLabel: 'ProjectName' as keyof UserProjectTaskDto,
        value: this.timesheetDetail()?.ProjectCode,
      },
      {
        type: BtpInputType.select,
        label: 'Task',
        required: true,
        field: 'TaskCode',
        optionValue: 'TaskCode' as keyof UserProjectTaskDto,
        optionLabel: 'TaskName' as keyof UserProjectTaskDto,
        value: this.timesheetDetail()?.TaskCode,
        hidden: !this.timesheetDetail()?.ProjectCode,
      },
      {
        type: BtpInputType.number,
        label: 'Hours',
        field: 'Hours',
        value: this.timesheetDetail()?.Hours,
      },
      {
        type: BtpInputType.select,
        label: 'Billing type',
        field: 'BillingType',
        optionLabel: 'BillingTypeName' as keyof BillingTypeDto,
        optionValue: 'BillingType' as keyof BillingTypeDto,
        required: true,
        value: this.timesheetDetail()?.BillingType,
        hidden: !this.timesheetDetail()?.ProjectCode,
      },
      {
        type: BtpInputType.textarea,
        label: 'Note',
        field: 'BillingNotes',
        value: this.timesheetDetail()?.BillingNotes,
      },
      {
        type: BtpInputType.checkbox,
        label: 'Apply to entire week',
        field: 'isEntireWeek',
        value: this.timesheetDetail()?.isEntireWeek,
        hidden: !!this.timesheetDetail()?.TMDetailID || this.hasOrderNumber(),
      },
      {
        type: BtpInputType.date,
        label: 'Date',
        field: 'TMDate',
        minDate: this.minDate(),
        maxDate: this.maxDate(),
        value: this.timesheetDetail()?.TMDate,
      },
    ];
  });

  onValueChange(value: FormOutput): void {
    this.changeTimesheetDetail.emit(value);
  }

  onValidChange(isValid: boolean): void {
    this.validChange.emit(isValid);
  }
}
