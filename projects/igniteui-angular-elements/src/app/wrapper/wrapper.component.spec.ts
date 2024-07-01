import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateWrapperComponent } from './wrapper.component';

describe('WrapperComponent', () => {
  let component: TemplateWrapperComponent;
  let fixture: ComponentFixture<TemplateWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TemplateWrapperComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
