import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { RouterModule } from '@angular/router';
import { GridModule } from '@progress/kendo-angular-grid';
import { remixAttachment2 as file } from '@ng-icons/remixicon';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'btp-task',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    RouterModule,
    GridModule,
    NgIconComponent,
  ],
  templateUrl: './task.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ file })],
})
export class TaskComponent {
  public gridData = [
    {
      Id: '0001',
      AttachCount: 2,
      NeededDocument: 'Background check',
      StartDate: new Date('2020-01-01'),
      EndDate: new Date('2020-01-01'),
      DueDate: new Date('2020-01-01'),
      Status: 'New',
      Progress: 10,
    },
    {
      Id: '0001',
      AttachCount: 3,
      NeededDocument: 'Background check',
      StartDate: new Date('2020-01-01'),
      EndDate: new Date('2020-01-01'),
      DueDate: new Date('2020-01-01'),
      Status: 'New',
      Progress: 57,
    },
    {
      Id: '0001',
      AttachCount: 1,
      NeededDocument: 'Background check',
      StartDate: new Date('2020-01-01'),
      EndDate: new Date('2020-01-01'),
      DueDate: new Date('2020-01-01'),
      Status: 'New',
      Progress: 18,
    },
  ];
}
