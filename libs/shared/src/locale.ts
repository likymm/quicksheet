import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Locale {
  localeMapper: Record<string, string> = {
    en: 'en-US',
    jp: 'ja-JP',
    es: 'es-ES',
  };
  currentLocale = signal('en-US');

  setLocale(locale: string) {
    this.currentLocale.set(this.localeMapper[locale] || navigator.language);
  }
}
