import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultManagementComponent } from './result-management.component';

describe('ResultManagementComponent', () => {
  let component: ResultManagementComponent;
  let fixture: ComponentFixture<ResultManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
