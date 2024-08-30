import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<'light' | 'dark'>('light');

  private loggingEffect = effect(() => {
    localStorage.setItem('grant-theme', this.theme());
    document.querySelector('html')?.setAttribute('data-theme', this.theme());
  });

  constructor() {
    this.theme.set(this.isDarkMode() ? 'dark' : 'light');
  }

  private isDarkMode(): boolean {
    return (
      localStorage.getItem('grant-theme') === 'dark' ||
      window.matchMedia?.('prefers-color-scheme: dark')?.matches
    );
  }

  toggleTheme(): void {
    this.theme.set(this.isDarkMode() ? 'light' : 'dark');
  }
}
