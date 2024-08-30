import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DecimalTimeFormatPipe, StatusBgPipe } from '@btp/libs/shared';
import {
  TimesheetDetailDto,
  TimesheetHeaderDto,
  TimesheetStatus,
  WeekViewUi,
} from '@grant/data-service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { TranslocoModule } from '@ngneat/transloco';
import {
  remixCheckLine as save,
  remixDeleteBinLine as deleteIcon,
  remixArrowLeftSLine as arrowLeft,
  remixArrowRightSLine as arrowRight,
  remixTimeLine as time,
  remixMailSendLine as mail,
  remixFileCopy2Line as templateFile,
  remixArrowGoBackLine as arrowBack,
  remixSearchEyeLine as searchEye,
  remixCheckDoubleLine as checkDouble,
  remixCheckLine as check,
  remixArrowDownSLine as arrowDown,
  remixUploadLine as upload,
  remixDownloadLine as download,
  remixFileExcel2Line as excel,
} from '@ng-icons/remixicon';
import { ModalComponent } from '@btp/web-component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'tms-heading',
  standalone: true,
  imports: [
    TranslocoModule,
    CommonModule,
    NgIconComponent,
    DecimalTimeFormatPipe,
    ReactiveFormsModule,
    ModalComponent,
    StatusBgPipe,
  ],
  templateUrl: './heading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      save,
      deleteIcon,
      arrowLeft,
      arrowRight,
      time,
      mail,
      templateFile,
      arrowBack,
      searchEye,
      checkDouble,
      check,
      arrowDown,
      upload,
      download,
      excel,
    }),
  ],
})
export class HeadingComponent {
  timesheetHeader = input<TimesheetHeaderDto>();
  templates = input<TimesheetHeaderDto[]>();
  timesheets = input<TimesheetDetailDto[]>();
  locale = input.required<string>();
  weekdayIndex = input.required<number>();
  weekView = input<WeekViewUi>();
  isFormDisabled = input<boolean>();
  isApproving = input<boolean>();
  isApproved = input<boolean>();
  canEdit = input<boolean>();
  canBeApproved = input<boolean>();
  loading = input<boolean>();
  isManager = input<boolean>();
  isCurrentUsersTimesheet = input<boolean>();

  @Output() selectDay = new EventEmitter<number>();
  @Output() viewIn = new EventEmitter<WeekViewUi>();
  @Output() deleteTimesheet = new EventEmitter<void>();
  @Output() submitTimesheet = new EventEmitter<void>();
  @Output() startReview = new EventEmitter<void>();
  @Output() recallTimesheet = new EventEmitter<void>();
  @Output() approveTimesheet = new EventEmitter<void>();
  @Output() returnTimesheet = new EventEmitter<string>();
  @Output() addTemplate = new EventEmitter<string>();
  @Output() useTemplate = new EventEmitter<TimesheetHeaderDto>();
  @Output() deleteTemplate = new EventEmitter<TimesheetHeaderDto>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() goToTodaysWeek = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() import = new EventEmitter<TimesheetDetailDto[]>();

  templateDescriptionInput = viewChild<ElementRef<HTMLInputElement>>(
    'templateDescriptionInput'
  );

  uploadTimesheetInput = viewChild<ElementRef<HTMLInputElement>>(
    'uploadTimesheetInput'
  );

  remarksInput = new FormControl<string>('');
  templateForm = new FormGroup({
    description: new FormControl(null, Validators.required),
  });
  isAddingAsTemplate = signal(false);
  isDeleteTemplateModalOpen = signal<boolean>(false);
  isAppendTemplateModalOpen = signal<boolean>(false);
  currentTemplate = signal<TimesheetHeaderDto | undefined>(undefined);

  isSubmitted = computed(() => {
    return this.timesheetHeader()?.Status === TimesheetStatus.Submitted;
  });

  isReviewing = computed(() => {
    return this.timesheetHeader()?.Status === TimesheetStatus.Reviewing;
  });

  onNext(): void {
    if (this.weekView() === 'daily') {
      this.onNextDay();
    } else {
      this.next.emit();
    }
  }

  onNextDay(): void {
    const index = this.weekdayIndex() + 1;
    if (index >= 7) {
      return;
    }

    this.selectDay.emit(index);
  }

  onPrevious(): void {
    if (this.weekView() === 'daily') {
      this.onPreviousDay();
    } else {
      this.previous.emit();
    }
  }

  onPreviousDay(): void {
    const index = this.weekdayIndex() - 1;
    if (index === -1) {
      return;
    }

    this.selectDay.emit(index);
  }

  onViewIn(view: WeekViewUi): void {
    this.viewIn.emit(view);
  }

  onDelete(): void {
    this.deleteTimesheet.emit();
  }

  onSubmit(): void {
    this.submitTimesheet.emit();
  }

  onApprove(): void {
    this.approveTimesheet.emit();
  }

  onRejectTimesheet(): void {
    this.returnTimesheet.emit(this.remarksInput.value ?? '');
  }

  onAddTemplate(): void {
    if (this.isAddingAsTemplate() && this.templateForm.valid) {
      this.addTemplate.emit(this.templateForm.value.description ?? '');
      this.isAddingAsTemplate.set(false);
      this.templateForm.reset();
      return;
    }
    this.isAddingAsTemplate.set(true);

    setTimeout(() => {
      this.templateDescriptionInput()?.nativeElement.focus();
    });
  }

  onUseTemplate(template: TimesheetHeaderDto): void {
    if (!this.canEdit()) {
      return;
    }
    this.isAppendTemplateModalOpen.set(true);
    this.currentTemplate.set(template);
  }

  onDeleteTemplate(template: TimesheetHeaderDto): void {
    this.isDeleteTemplateModalOpen.set(true);
    this.currentTemplate.set(template);
  }

  onConfirmDeleteTemplate(): void {
    this.deleteTemplate.emit(this.currentTemplate());
  }

  onConfirmAppendTemplate(): void {
    this.useTemplate.emit(this.currentTemplate());
  }

  onGoToTodaysWeek(): void {
    this.goToTodaysWeek.emit();
  }

  onRecall(): void {
    this.recallTimesheet.emit();
  }

  onStartReview(): void {
    this.startReview.emit();
  }

  onDownload(): void {
    this.export.emit();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.readFile(file);
    }
  }

  readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const uploadedData = this.sheetToArrayOfWorkbook(
        XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      );

      this.import.emit(uploadedData);

      if (this.uploadTimesheetInput()) {
        this.uploadTimesheetInput()!.nativeElement.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  sheetToArrayOfWorkbook(jsonData: any[]): TimesheetDetailDto[] {
    const headers = jsonData.shift() || [];
    const rows = [];

    for (const row of jsonData) {
      const obj: { [key: string]: any } = {};
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = row[i];
      }
      rows.push(obj);
    }

    return rows;
  }
}
