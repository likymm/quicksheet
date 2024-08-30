import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'btp-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetComponent {
  title = input('');
  value = input('');
  type = input<'' | 'error' | 'warning'>('');
  badge = input('');
  isHover = input(false);
}
