import { TestBed } from '@angular/core/testing';

import { TimeTrackingAlertService } from './time-tracking-alert.service';

describe('TimeTrackingAlertService', () => {
  let service: TimeTrackingAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeTrackingAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
