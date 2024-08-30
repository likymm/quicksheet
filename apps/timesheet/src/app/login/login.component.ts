import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { remixInstanceFill as instance } from '@ng-icons/remixicon';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import {
  AuthService,
  ThemeService,
  UserCredentialsDto,
} from '@grant/data-service';
import { IsMutatingService } from '@ngneat/query';
import { toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe, NgClass } from '@angular/common';
import { BtpFormGroup, BtpInputType, FormComponent } from '@btp/web-component';
import { map, tap } from 'rxjs';

@Component({
  selector: 'tms-login',
  standalone: true,
  imports: [NgIconComponent, TranslocoModule, JsonPipe, NgClass, FormComponent],
  templateUrl: './login.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ instance })],
})
export class LoginComponent {
  translocoService = inject(TranslocoService);
  mutatingService = inject(IsMutatingService);
  themeService = inject(ThemeService);
  auth = inject(AuthService);
  loading = toSignal(this.mutatingService.use());
  loginQuery = this.auth.login();
  results = toSignal(this.loginQuery.result$);
  errorMessage = computed<string>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.results()?.data as unknown as any)?.ErrorMessage;
  });

  loginUserInput = viewChild<ElementRef<HTMLInputElement>>('loginUserInput');

  loginForm = toSignal(
    this.translocoService
      .selectTranslate(['sys.userName', 'sys.password'])
      .pipe(
        map(([userName, password]): BtpFormGroup<UserCredentialsDto>[] => {
          return [
            {
              type: BtpInputType.text,
              field: 'UserID',
              placeholder: userName,
              required: true,
            },
            {
              type: BtpInputType.password,
              field: 'UserPassword',
              placeholder: password,
              required: true,
            },
          ];
        }),
        tap(() => {
          setTimeout(() => {
            const firstInput = this.loginUserInput()
              ?.nativeElement.querySelectorAll('input, textarea, select')
              .item(0) as HTMLInputElement | undefined;

            if (firstInput) {
              firstInput?.focus();
            }
          });
        })
      )
  );

  isLoginFormValid = signal(false);
  formValue = signal<UserCredentialsDto>({
    Entity: 'BTP',
  });

  onLogin(e: Event): void {
    e.preventDefault();
    this.loginQuery.mutate(this.formValue());
  }

  onIsValidChange(isValid: boolean): void {
    this.isLoginFormValid.set(isValid);
  }

  onValueChange(value: UserCredentialsDto): void {
    this.formValue.set({
      ...this.formValue(),
      ...value,
    });
  }
}
