import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeKey = 'theme';
  
  private activeTheme = 'dark';
  private isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem(this.themeKey);
      if (savedTheme) {
        this.activeTheme = savedTheme;
      }
      this.applyTheme(this.activeTheme);
    }
  }

  getTheme(): string {
    return this.activeTheme;
  }

  isDarkTheme(): boolean {
    return this.activeTheme === 'dark';
  }

  toggleTheme() {
    this.activeTheme = this.activeTheme === 'dark' ? 'light' : 'dark';
    if (this.isBrowser) {
      localStorage.setItem(this.themeKey, this.activeTheme);
    }
    this.applyTheme(this.activeTheme);
  }

  private applyTheme(theme: string) {
    if (!this.isBrowser) return;

    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
  }
}
