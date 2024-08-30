import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { remixInstanceFill as instance } from '@ng-icons/remixicon';
import { TranslocoModule } from '@ngneat/transloco';
import {
  AuthService,
  ThemeService,
  UserCredentialsDto,
} from '@grant/data-service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'btp-login',
  standalone: true,
  imports: [NgIconComponent, TranslocoModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ instance })],
})
export class LoginComponent {
  themeService = inject(ThemeService);
  auth = inject(AuthService);
  loading = signal(false);

  form = new FormGroup<{ [K in keyof UserCredentialsDto]: FormControl }>({
    Entity: new FormControl(''),
    UserID: new FormControl(''),
    UserPassword: new FormControl(''),
  });

  onLogin(): void {
    this.auth.login().mutate(this.form.value);
  }
}
