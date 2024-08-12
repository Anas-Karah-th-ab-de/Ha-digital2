import { TestBed } from '@angular/core/testing';

import { AuftragService } from './auftrag.service';

describe('AuftragService', () => {
  let service: AuftragService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuftragService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
