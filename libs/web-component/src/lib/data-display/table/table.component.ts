import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { GridModule } from '@progress/kendo-angular-grid';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'btp-table',
  standalone: true,
  imports: [TranslocoModule, GridModule, RouterModule],
  templateUrl: './table.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
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
