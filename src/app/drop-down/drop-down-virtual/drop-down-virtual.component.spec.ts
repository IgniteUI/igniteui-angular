import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownVirtualComponent } from './drop-down-virtual.component';

describe('DropDownVirtualComponent', () => {
  let component: DropDownVirtualComponent;
  let fixture: ComponentFixture<DropDownVirtualComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropDownVirtualComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropDownVirtualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
