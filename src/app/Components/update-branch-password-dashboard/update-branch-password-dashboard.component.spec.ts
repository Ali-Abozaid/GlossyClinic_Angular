import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBranchPasswordDashboardComponent } from './update-branch-password-dashboard.component';

describe('UpdateBranchPasswordDashboardComponent', () => {
  let component: UpdateBranchPasswordDashboardComponent;
  let fixture: ComponentFixture<UpdateBranchPasswordDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBranchPasswordDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBranchPasswordDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
