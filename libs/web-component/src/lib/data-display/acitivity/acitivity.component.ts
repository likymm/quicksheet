import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'btp-acitivity',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './acitivity.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcitivityComponent {}
