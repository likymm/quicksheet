import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  remixHandCoinLine as type,
  remixCalendar2Line as calendar,
  remixWallet3Line as wallet,
  remixAwardLine as award,
} from '@ng-icons/remixicon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'btp-award-card',
  standalone: true,
  imports: [RouterModule, TranslocoModule, NgIconComponent],
  templateUrl: './award-card.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ type, calendar, wallet, award })],
})
export class AwardCardComponent {}
