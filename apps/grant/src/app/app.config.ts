import {
  ApplicationConfig,
  LOCALE_ID,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { provideTransloco } from '@ngneat/transloco';
import { provideQueryClient } from '@ngneat/query';
import { queryClientPersister, translocoOptions } from '@btp/libs/shared';
import localeJa from '@angular/common/locales/ja';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import {
  AUTH_INTERCEPTOR_PROVIDER,
  ERROR_INTERCEPTOR_PROVIDER,
} from '@grant/data-service';

registerLocaleData(localeJa);
registerLocaleData(localeEn);
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideTransloco(translocoOptions),
    provideExperimentalZonelessChangeDetection(),

    // Http client and interceptors
    provideHttpClient(withInterceptorsFromDi()),
    AUTH_INTERCEPTOR_PROVIDER,
    ERROR_INTERCEPTOR_PROVIDER,

    // Angular query
    provideQueryClient(queryClientPersister()),

    // Locale
    { provide: LOCALE_ID, useValue: 'en-US' },
    { provide: LOCALE_ID, useValue: 'es-Es' },
    { provide: LOCALE_ID, useValue: 'ja-JP' },
  ],
};
