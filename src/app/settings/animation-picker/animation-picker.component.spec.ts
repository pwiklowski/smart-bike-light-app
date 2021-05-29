import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationPickerComponent } from './animation-picker.component';

describe('AnimationPickerComponent', () => {
  let component: AnimationPickerComponent;
  let fixture: ComponentFixture<AnimationPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimationPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
