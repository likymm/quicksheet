import { CommonModule } from '@angular/common';
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
import { DecimalTimeFormatPipe, Locale, StatusBgPipe } from '@btp/libs/shared';
import {
  BtpFormAsyncOptions,
  BtpFormGroup,
  BtpInputType,
  FormComponent,
} from '@btp/web-component';
import { BillingTypeDto, TimesheetDetailDto } from '@grant/data-service';
import { TranslocoModule } from '@ngneat/transloco';
import { ApproverRemarksComponent } from '../../approver-remarks/approver-remarks.component';
import {
  remixDeleteBin2Line as deleteBin,
  remixPencilLine as pencil,
} from '@ng-icons/remixicon';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'tms-daily-item-form',
  standalone: true,
  imports: [
    TranslocoModule,
    FormComponent,
    DecimalTimeFormatPipe,
    CommonModule,
    ApproverRemarksComponent,
    StatusBgPipe,
    NgIconComponent,
  ],
  templateUrl: './daily-item-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ deleteBin, pencil })],
})
export class DailyItemFormComponent {
  locale = inject(Locale);

  isFormDisabled = input(false);
  isDailyLayout = input(false);
  billingTypes = input<BillingTypeDto[]>([]);
  timesheetDetail = input<TimesheetDetailDto | undefined>();
  formOptions = input<BtpFormAsyncOptions>({});

  @Output() timesheetChange = new EventEmitter<TimesheetDetailDto>();
  @Output() timesheetDelete = new EventEmitter<TimesheetDetailDto>();
  @Output() timesheetEdit = new EventEmitter<TimesheetDetailDto>();

  form = computed<BtpFormGroup<TimesheetDetailDto>[]>(() => {
    return [
      {
        type: BtpInputType.select,
        label: 'Billing type',
        field: 'BillingType',
        value: this.timesheetDetail()?.BillingType,
        optionLabel: 'BillingTypeName' as keyof BillingTypeDto,
        optionValue: 'BillingType' as keyof BillingTypeDto,
      },
      {
        type: BtpInputType.textarea,
        label: 'Note',
        field: 'BillingNotes',
        value: this.timesheetDetail()?.BillingNotes,
      },
    ];
  });

  markAsPrestineCount = signal(1);

  onValueChange(value: TimesheetDetailDto): void {
    this.markAsPrestineCount.update(v => v + 1);
    this.timesheetChange.emit({
      ...this.timesheetDetail()!,
      BillingNotes:
        typeof value.BillingNotes === 'undefined'
          ? this.timesheetDetail()?.BillingNotes
          : value.BillingNotes || '',
      BillingType:
        typeof value.BillingType === 'undefined'
          ? this.timesheetDetail()?.BillingType
          : value?.BillingType ?? '',
    });
  }

  onDelete(): void {
    this.timesheetDelete.emit(this.timesheetDetail());
  }

  onEdit(): void {
    this.timesheetEdit.emit(this.timesheetDetail());
  }
}
