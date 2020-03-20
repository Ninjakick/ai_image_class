import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainageComponent } from './trainage.component';

describe('TrainageComponent', () => {
  let component: TrainageComponent;
  let fixture: ComponentFixture<TrainageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
