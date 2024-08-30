import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DecimalTimeFormatPipe, Locale, StatusBgPipe } from '@btp/libs/shared';
import {
  AuthService,
  TimesheetDetailQuerysService,
  TimesheetHeaderDto,
  TimesheetStatus,
} from '@grant/data-service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { TranslocoModule } from '@ngneat/transloco';
import { GridModule } from '@progress/kendo-angular-grid';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ModalComponent } from '@btp/web-component';
import {
  remixSearchEyeLine as review,
  remixCheckLine as check,
  remixArrowGoBackLine as arrowBack,
} from '@ng-icons/remixicon';

@Component({
  standalone: true,
  imports: [
    TranslocoModule,
    GridModule,
    DecimalTimeFormatPipe,
    CommonModule,
    RouterModule,
    NgIconComponent,
    ReactiveFormsModule,
    ModalComponent,
    ReactiveFormsModule,
    StatusBgPipe,
    NgIconComponent,
  ],
  templateUrl: './review.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      review,
      check,
      arrowBack,
    }),
  ],
})
export class ReviewComponent {
  locale = inject(Locale);
  router = inject(Router);
  route = inject(ActivatedRoute);
  auth = inject(AuthService);
  timesheetService = inject(TimesheetDetailQuerysService);

  loggedUserId = this.auth.loggedUserId;
  userId = signal(null);
  headerId = signal<number | undefined>(undefined);
  entity = signal(this.auth.getUserEntityLocalStorage());
  status = signal<TimesheetStatus>(TimesheetStatus.Submitted);
  statusEnum = TimesheetStatus;

  isReturnModalOpen = signal(false);

  remarksInput = new FormControl<string>('');

  timesheetHeaders = toSignal(
    this.timesheetService.getTimesheetHeaders(
      this.userId,
      this.entity,
      this.status,
      signal(true),
      signal(false)
    )
  );

  timesheetApproval = this.timesheetService.approval(this.headerId);

  timesheets = signal<TimesheetHeaderDto[]>([]);

  onApproved(headerId: number): void {
    this.headerId.set(headerId);
    this.timesheetApproval.mutate({
      action: TimesheetStatus.Approved,
      headerId,
      remarks: '',
    });
  }

  statusFilter: TimesheetStatus[] = [
    TimesheetStatus.Submitted,
    TimesheetStatus.Reviewing,
  ];

  onStartReview(header: TimesheetHeaderDto): void {
    if (header.Status !== TimesheetStatus.Reviewing) {
      this.headerId.set(header.TMHeaderID);
      this.timesheetApproval.mutate({
        action: TimesheetStatus.Reviewing,
        headerId: header.TMHeaderID,
        remarks: '',
      });
    }

    this.router.navigate(['/time/date'], {
      queryParams: { id: header.TMHeaderID, approving: 1 },
    });
  }

  onReject(headerId: number): void {
    this.isReturnModalOpen.set(true);
    this.headerId.set(headerId);
  }

  onConfirmReturn(): void {
    this.timesheetApproval.mutate({
      action: TimesheetStatus.Return,
      headerId: this.headerId(),
      remarks: this.remarksInput.value || '',
    });
    this.remarksInput.reset();
  }

  constructor() {
    toObservable(this.timesheetHeaders).subscribe(data => {
      this.timesheets.set(data?.data || []);
    });
  }
}
