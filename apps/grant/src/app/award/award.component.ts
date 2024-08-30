import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { RouterModule } from '@angular/router';
import { GridModule } from '@progress/kendo-angular-grid';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';

@Component({
  standalone: true,
  imports: [
    TranslocoModule,
    RouterModule,
    GridModule,
    ButtonsModule,
    InputsModule,
  ],
  templateUrl: './award.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwardComponent {
  public gridData = [
    {
      Id: '0001',
      SubGrantee: 'COSTCO',
      SubGranteeAwardName: 'Strategic Planning',
      SubGranteeAwardNumber: '0001',
      SubGranteeType: 'SubGrant',
      Status: 'Approved',
    },
    {
      Id: '0002',
      SubGrantee: 'test',
      SubGranteeAwardName: 'Strategic Planning',
      SubGranteeAwardNumber: '0002',
      SubGranteeType: 'SubGrant',
      Status: 'Approved',
    },
    {
      Id: '0003',
      SubGrantee: 'some',
      SubGranteeAwardName: 'Strategic Planning',
      SubGranteeAwardNumber: '0003',
      SubGranteeType: 'SubGrant',
      Status: 'Approved',
    },
  ];
}
