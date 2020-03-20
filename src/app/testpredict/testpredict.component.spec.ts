import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestpredictComponent } from './testpredict.component';

describe('TestpredictComponent', () => {
  let component: TestpredictComponent;
  let fixture: ComponentFixture<TestpredictComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestpredictComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestpredictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
