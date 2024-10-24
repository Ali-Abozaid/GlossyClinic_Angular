import { TestBed } from '@angular/core/testing';

import { BookDashboardService } from './book-dashboard.service';

describe('BookDashboardService', () => {
  let service: BookDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
