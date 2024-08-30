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
import { AuthService, ThemeService } from '@grant/data-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Locale } from '@btp/libs/shared';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tms-header',
  standalone: true,
  imports: [
    RouterModule,
    NgIconComponent,
    TranslocoModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ moon, sun, global })],
})
export class HeaderComponent {
  translocoService = inject(TranslocoService);
  themeService = inject(ThemeService);
  auth = inject(AuthService);
  locale = inject(Locale);

  themeCheckbox = new FormControl<boolean>(
    this.themeService.theme() === 'dark'
  );

  user = toSignal(this.auth.getLoggedUser());

  isManager = computed<boolean>(() => {
    return this.user()?.data?.UserRole === 'Manager';
  });

  onChangeLang(lang: string): void {
    this.locale.setLocale(lang);
    this.translocoService.setActiveLang(lang);
  }

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogout(): void {
    this.auth.logout();
  }
}
