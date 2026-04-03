import { Component } from '@angular/core';
import { IgSizeDirective } from './ig-size.directive';
import { TestBed, ComponentFixture } from '@angular/core/testing';

@Component({
  template: `<div [igSize]="size">Test Element</div>`,
  imports: [IgSizeDirective],
})
class TestComponent {
  public size: 'small' | 'medium' | 'large';
}

describe('IgSizeDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let divElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
    });

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    divElement = fixture.nativeElement.querySelector('div');
    fixture.detectChanges();
  });

  it('should apply the correct --ig-size inline style for each size', () => {
    const sizeMap = {
      small: 'var(--ig-size-small)',
      medium: 'var(--ig-size-medium)',
      large: 'var(--ig-size-large)',
    };

    // Loop through each size and verify the inline style
    for (const size in sizeMap) {
      testComponent.size = size as 'small' | 'medium' | 'large';
      fixture.detectChanges();

      // Check if the --ig-size style is applied correctly
      expect(divElement.style.getPropertyValue('--ig-size')).toBe(sizeMap[size]);
    }
  });
});
