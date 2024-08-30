import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@ngneat/transloco';
import { HttpClient } from '@angular/common/http';
import { Locale } from './locale';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);
  private locale = inject(Locale);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/i18n/${lang}.json`).pipe(
      tap(() => {
        this.locale.setLocale(lang);
      })
    );
  }
}
