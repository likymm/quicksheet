import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { TranslocoModule } from '@ngneat/transloco';
import { RouterModule } from '@angular/router';
import { TableComponent } from '@btp/web-component';

@Component({
  standalone: true,
  imports: [GridModule, TranslocoModule, RouterModule, TableComponent],
  templateUrl: './sub-grant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubGrantComponent {
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
