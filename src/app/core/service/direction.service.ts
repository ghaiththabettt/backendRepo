import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectionService {
  private data = new BehaviorSubject('ltr');
  currentData = this.data.asObservable();

  constructor() {
    const direction = localStorage.getItem('direction') || 'ltr';
    this.data.next(direction);
  }

  updateDirection(item: string) {
    localStorage.setItem('direction', item);
    this.data.next(item);
  }
}
