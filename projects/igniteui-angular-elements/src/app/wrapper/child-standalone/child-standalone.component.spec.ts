import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildStandaloneComponent } from './child-standalone.component';

describe('ChildStandaloneComponent', () => {
  let component: ChildStandaloneComponent;
  let fixture: ComponentFixture<ChildStandaloneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChildStandaloneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildStandaloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
