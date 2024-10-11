import { TestBed } from '@angular/core/testing';

import { PropertyChangeService } from './property-change.service';

describe('PropertyChangeService', () => {
  let service: PropertyChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
