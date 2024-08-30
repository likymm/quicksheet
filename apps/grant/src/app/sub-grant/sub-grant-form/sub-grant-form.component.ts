import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { RouterModule } from '@angular/router';
import {
  AcitivityComponent,
  AwardCardComponent,
  BtpFormGroup,
  BtpInputType,
  FormComponent,
  FormOutput,
} from '@btp/web-component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  remixEyeLine as eye,
  remixSaveLine as save,
} from '@ng-icons/remixicon';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    RouterModule,
    FormComponent,
    NgIconComponent,
    AwardCardComponent,
    AcitivityComponent,
  ],
  templateUrl: './sub-grant-form.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ eye, save })],
})
export class SubGrantFormComponent {
  form: BtpFormGroup<never>[] = [
    {
      label: 'Award',
      type: BtpInputType.group,
      children: [
        {
          type: BtpInputType.lookup,
          label: 'Award',
          required: true,
          field: 'award',
        },
      ],
    },
    {
      label: 'Sub grantee award details',
      type: BtpInputType.group,
      children: [
        {
          type: BtpInputType.text,
          label: 'Sub grantee',
          required: true,
          field: 'subGrantee',
        },
        {
          type: BtpInputType.text,
          label: 'Sub grantee award name',
          required: true,
          field: 'subGranteeAwardName',
        },
        {
          type: BtpInputType.date,
          label: 'Start date',
          required: true,
          field: 'startDate',
        },
        {
          type: BtpInputType.date,
          label: 'End date',
          required: true,
          field: 'endDate',
        },
        {
          type: BtpInputType.select,
          label: 'Sub grantee type',
          field: 'subGranteeType',
        },
        {
          type: BtpInputType.select,
          label: 'Status',
          field: 'status',
        },
        {
          type: BtpInputType.multiselect,
          label: 'Sub grantee award number',
          field: 'subGranteeAwardNumber',
        },
        {
          type: BtpInputType.text,
          label: 'Financial dimension',
          required: true,
          field: 'financialDimension',
        },
      ],
    },
    {
      label: 'Amount',
      type: BtpInputType.group,
      children: [
        {
          type: BtpInputType.number,
          label: 'Prosposed amount',
          required: true,
          field: 'proposedAmount',
        },
        {
          type: BtpInputType.number,
          label: 'Cost share amount',
          inShowMore: true,
          field: 'costShareAmount',
        },
        {
          type: BtpInputType.number,
          label: 'Ceiling Amount',
          inShowMore: true,
          field: 'ceilingAmount',
        },
        {
          type: BtpInputType.number,
          label: 'Sub grantee award amount',
          required: true,
          field: 'subGranteeAwardAmount',
        },
        {
          type: BtpInputType.number,
          label: 'Obligated amount',
          inShowMore: true,
          field: 'obligatedAmount',
        },
      ],
    },
    {
      label: 'Organization',
      type: BtpInputType.group,
      children: [
        {
          type: BtpInputType.text,
          label: 'Project manager',
          field: 'projectManager',
        },
        {
          type: BtpInputType.text,
          label: 'Program title',
          field: 'programTitle',
        },
        {
          type: BtpInputType.text,
          label: 'Office mission',
          field: 'officeMission',
        },
        {
          type: BtpInputType.userGroup,
          label: 'Team members',
          field: 'teamMembers',
        },
      ],
    },
  ];

  isShowMore = signal(false);

  onToggleShowMore(): void {
    this.isShowMore.set(!this.isShowMore());
  }

  onValueChange(changed: FormOutput): void {
    console.log(changed);
  }
}
