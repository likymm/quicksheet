import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { RouterModule } from '@angular/router';
import {
  AcitivityComponent,
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
    AcitivityComponent,
  ],
  templateUrl: './award-form.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ eye, save })],
})
export class AwardFormComponent {
  form: BtpFormGroup<never>[] = [
    {
      label: 'Detail',
      type: BtpInputType.group,
      children: [
        {
          type: BtpInputType.text,
          label: 'Donor',
          required: true,
          field: 'donor',
        },
        {
          type: BtpInputType.text,
          label: 'Award name',
          required: true,
          field: 'awardName',
        },
        {
          type: BtpInputType.multiselect,
          label: 'Donor main contact',
          field: 'donorMainContact',
        },
        {
          type: BtpInputType.date,
          label: 'Start date',
          required: true,
          field: 'startDate',
        },
      ],
    },
    {
      label: 'Amount',
      type: BtpInputType.group,
      children: [
        {
          type: BtpInputType.number,
          label: 'Award amount',
          required: true,
          field: 'awardAmount',
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
