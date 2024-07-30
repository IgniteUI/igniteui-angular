import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DotmaticsComponent } from './hound.component';

describe('DotmaticsComponent', () => {
  let component: DotmaticsComponent;
  let fixture: ComponentFixture<DotmaticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DotmaticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DotmaticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
