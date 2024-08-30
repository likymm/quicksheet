import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import {
  remixMoonLine as moon,
  remixSunLine as sun,
  remixGlobalLine as global,
} from '@ng-icons/remixicon';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ThemeService } from '@grant/data-service';

@Component({
  selector: 'btp-header',
  standalone: true,
  imports: [RouterModule, NgIconComponent, TranslocoModule],
  templateUrl: './header.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ moon, sun, global })],
})
export class HeaderComponent {
  translocoService = inject(TranslocoService);
  themeService = inject(ThemeService);

  themeIcon = computed(() => {
    return this.themeService.theme() === 'dark' ? 'sun' : 'moon';
  });

  onChangeLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
  }

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
