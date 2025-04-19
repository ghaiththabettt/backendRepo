import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLang.asObservable();

  constructor() {
    const savedLang = localStorage.getItem('lang') || 'en';
    this.currentLang.next(savedLang);
  }

  setLanguage(lang: string) {
    localStorage.setItem('lang', lang);
    this.currentLang.next(lang);
  }

  getCurrentLang(): string {
    return this.currentLang.value;
  }
}
