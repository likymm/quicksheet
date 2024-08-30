import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalTimeFormatPipe, StatusBgPipe } from '@btp/libs/shared';
import { BillingTypeDto, TimesheetDetailDto } from '@grant/data-service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { TranslocoModule } from '@ngneat/transloco';
import { DateTime } from 'luxon';
import {
  remixAddLine as add,
  remixDeleteBin2Line as deleteBin,
  remixPencilLine as pencil,
  remixCheckLine as check,
  remixArrowGoBackLine as close,
  remixLoader4Line as loader,
} from '@ng-icons/remixicon';
import { ApproverRemarksComponent } from '../../approver-remarks/approver-remarks.component';

@Component({
  selector: 'tms-time-info',
  standalone: true,
  imports: [
    TranslocoModule,
    StatusBgPipe,
    CommonModule,
    DecimalTimeFormatPipe,
    NgIconComponent,
    ApproverRemarksComponent,
  ],
  templateUrl: './time-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ add, deleteBin, pencil, check, close, loader })],
})
export class TimeInfoComponent {
  timesheetDetail = input.required<TimesheetDetailDto>();
  isFormDisabled = input(false);
  billingTypes = input<BillingTypeDto[] | undefined>([]);
  locale = input.required<string>();
  isApproving = input<boolean>(false);
  isSaving = input<boolean>(false);
  isFetching = input<boolean>(false);
  isDeleting = input<boolean>(false);

  @Output() editDailyTask = new EventEmitter<TimesheetDetailDto>();
  @Output() deleteTimesheetDetail = new EventEmitter<TimesheetDetailDto>();
  @Output() returnTimesheetDetal = new EventEmitter<TimesheetDetailDto>();
  @Output() approveTimesheetDetal = new EventEmitter<TimesheetDetailDto>();
  @Output() addTask = new EventEmitter<TimesheetDetailDto | undefined>();
  @Output() timesheetChange = new EventEmitter<TimesheetDetailDto>();

  gridEditingHour = viewChild<ElementRef<HTMLInputElement>>('gridEditingHour');
  inlineEditTimesheetDetail = viewChild<ElementRef<HTMLInputElement>>(
    'inlineEditTimesheetDetail'
  );

  today = DateTime.now();
  isToday(date: Date): boolean {
    return DateTime.fromJSDate(date).toISODate() === this.today.toISODate();
  }
  isEditingTime = signal(false);
  isEditingNotes = signal(false);

  onHourClick(): void {
    setTimeout(() => {
      this.gridEditingHour()?.nativeElement.focus();
    });
    this.isEditingTime.set(true);
  }

  onChangeHour(e: FocusEvent, edit?: TimesheetDetailDto): void {
    const hour = (e.target as HTMLInputElement).valueAsNumber;
    if (hour === edit?.Hours) {
      this.isEditingTime.set(false);
      return;
    }
    const newEdit: TimesheetDetailDto = {
      ...edit,
      Hours: hour || 0,
    };
    this.timesheetChange.emit(newEdit);
    this.isEditingTime.set(false);
  }

  getBillingTypeName(type?: string | null): string {
    return (
      this.billingTypes()?.find(x => x.BillingType === type)?.BillingTypeName ||
      ''
    );
  }

  onChangeBillingType(
    billingType: string | null | undefined,
    edit?: TimesheetDetailDto
  ): void {
    const newEdit: TimesheetDetailDto = {
      ...edit,
      BillingType: billingType,
    };
    this.timesheetChange.emit(newEdit);
  }

  onInlineEditTimesheetDetail(): void {
    if (this.isFormDisabled()) {
      return;
    }
    setTimeout(() => {
      this.inlineEditTimesheetDetail()?.nativeElement?.focus();
    });
    this.isEditingNotes.set(true);
  }

  onBlurInlineEdit(e: FocusEvent, edit?: TimesheetDetailDto): void {
    const paragraph = (e.target as HTMLInputElement).value.trim();
    this.isEditingNotes.set(false);
    if (paragraph === edit?.BillingNotes?.trim()) {
      return;
    }
    const newEdit: TimesheetDetailDto = {
      ...edit,
      BillingNotes: paragraph,
    };
    this.timesheetChange.emit(newEdit);
  }

  onApproved(timesheetDetail: TimesheetDetailDto): void {
    this.approveTimesheetDetal.emit(timesheetDetail);
  }

  onReject(timesheetDetail: TimesheetDetailDto): void {
    this.returnTimesheetDetal.emit(timesheetDetail);
  }

  onEditTimesheetDetail(preset?: TimesheetDetailDto): void {
    this.editDailyTask.emit(preset);
  }

  onAddProject(preset?: TimesheetDetailDto): void {
    this.addTask.emit(preset);
  }

  onDeleteTimehseetDetail(toDelete: TimesheetDetailDto): void {
    this.deleteTimesheetDetail.emit(toDelete);
  }
}
