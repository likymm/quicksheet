import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'btp-organization',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './organization.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrginizationComponent {}
