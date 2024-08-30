import {
  Injectable,
  inject,
  WritableSignal,
  Signal,
  signal,
  computed,
} from '@angular/core';
import { SecurityService, UserCredentialsDto, UserDto } from '../../../api';
import { BaseService } from '../base.service';
import { Router } from '@angular/router';
import { QueryClientService, UseMutation } from '@ngneat/query';
import { switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService {
  private auth = inject(SecurityService);
  private router = inject(Router);
  private mutation = inject(UseMutation);
  private _loggedUserId = signal<string | null>(this.getUserIdLocalStorage());
  private queryClient = inject(QueryClientService);
  loggedUserId = computed(() => this._loggedUserId());

  login() {
    return this.mutation(
      (user: UserCredentialsDto) => {
        this.storeUserAndToken(user, null);
        return this.auth.login({
          body: user,
        });
      },
      {
        onSuccess: async res => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const token = (res as any)?.Token;
          if (token) {
            this.storeUserAndToken(null, token);
            await this.router.navigate(['/time']);
          }
        },
      }
    );
  }

  getLoggedUser() {
    return this.getUserById(this._loggedUserId);
  }

  getUserById(
    userId: WritableSignal<string | null> | Signal<string | null>,
    enable = signal(true)
  ) {
    return this.signalsToObservable([userId, enable]).pipe(
      switchMap(() => {
        return this.useQuery({
          queryKey: ['user', userId()],
          queryFn: () => {
            return this.auth.getUserByUserId$Json({
              userId: userId()!,
            });
          },
          enabled: Boolean(userId() && enable()),
        }).result$;
      })
    );
  }

  isLoggedIn(): boolean {
    return Boolean(this.getUserTokenLocalStorage());
  }

  storeUserAndToken(user: UserCredentialsDto | null, token: string | null) {
    if (user?.UserID) {
      this._loggedUserId.set(user.UserID);
      localStorage.setItem('user-id', user.UserID);
    }
    if (user?.Entity) {
      localStorage.setItem('user-entity', user.Entity);
    }
    if (token) {
      localStorage.setItem('ts-token', token);
    }
  }

  getLoggedUserLocalStorage(): UserDto | undefined {
    if (!localStorage.getItem('ts-user')) {
      return undefined;
    }
    try {
      return JSON.parse(localStorage.getItem('ts-user')!);
    } catch {
      return undefined;
    }
  }

  getUserTokenLocalStorage(): string | null {
    return localStorage.getItem('ts-token');
  }

  private getUserIdLocalStorage(): string | null {
    return localStorage.getItem('user-id');
  }

  getUserEntityLocalStorage(): string | null {
    return localStorage.getItem('user-entity');
  }

  logout(): void {
    localStorage.removeItem('ts-token');
    localStorage.removeItem('user-id');
    this.router.navigate(['/login']);
    this.queryClient.clear();
  }
}
