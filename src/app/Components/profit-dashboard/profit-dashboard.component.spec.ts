import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitDashboardComponent } from './profit-dashboard.component';

describe('ProfitDashboardComponent', () => {
  let component: ProfitDashboardComponent;
  let fixture: ComponentFixture<ProfitDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfitDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfitDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
