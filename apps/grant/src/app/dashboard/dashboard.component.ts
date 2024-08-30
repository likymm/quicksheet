import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { RouterModule } from '@angular/router';
import { WidgetComponent, ChartComponent } from '@btp/web-component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { remixHourglass2Fill as hourglass } from '@ng-icons/remixicon';

@Component({
  selector: 'btp-dashboard',
  standalone: true,
  imports: [
    TranslocoModule,
    RouterModule,
    WidgetComponent,
    ChartComponent,
    NgIconComponent,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ hourglass })],
})
export class DashboardComponent {}
