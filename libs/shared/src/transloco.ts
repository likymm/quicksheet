import { isDevMode } from '@angular/core';
import { TranslocoHttpLoader } from './transloco-loader';
import { PartialTranslocoConfig } from '@ngneat/transloco/lib/transloco.config';

export const translocoOptions = {
  config: {
    availableLangs: ['en', 'es', 'jp'],
    defaultLang: 'en',
    reRenderOnLangChange: true,
    prodMode: !isDevMode(),
  } as PartialTranslocoConfig,
  loader: TranslocoHttpLoader,
};
