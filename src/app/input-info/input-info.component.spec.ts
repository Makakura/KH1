import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputInfoComponent } from './input-info.component';

describe('InputInfoComponent', () => {
  let component: InputInfoComponent;
  let fixture: ComponentFixture<InputInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
