import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BaseProgressDirective } from './progressbar.component';

@Component({
    template: ``,
})
class TestComponent extends BaseProgressDirective {}

describe('BaseProgressDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let nativeElement: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestComponent],  // Declare the test component
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        nativeElement = fixture.nativeElement;
        fixture.detectChanges();
    });

    it('should initialize with default values', () => {
        expect(component.indeterminate).toBe(false);
        expect(component.animationDuration).toBe(2000);
        expect(component.max).toBe(100);
        expect(component.value).toBe(0);
        expect(component.animate).toBe(true);
    });

    it('should correctly update the value within range', () => {
        component.value = 50;
        expect(component.value).toBe(50);

        // Value below range is not allowed
        component.value = -10;
        expect(component.value).toBe(0);

        // Value above range is not allowed
        component.value = 150;
        expect(component.value).toBe(100);
    });

    it('should update value if indeterminate is true', () => {
        component.indeterminate = true;
        component.value = 50;
        expect(component.value).toBe(50);
    });

    it('should correctly calculate value in percentage', () => {
        component.value = 50;
        expect(component.valueInPercent).toBe(50);

        component.value = 25;
        component.max = 200;
        expect(component.valueInPercent).toBe(12.5);
    });

    it('should not exceed maximum or minimum value when max is updated', () => {
        component.value = 80;

        component.max = 50; // Reduce max below value
        expect(component.value).toBe(50);

        component.max = 200; // Increase max
        expect(component.value).toBe(50);
    });

    it('should handle floating-point numbers correctly', () => {
        component.max = 2.5;
        component.value = 2.67;

        // Expect value to be clamped to max
        expect(component.value).toBe(2.5);
        expect(component.valueInPercent).toBe(100);

        component.value = -0.3;

        // Expect value to be clamped to 0
        expect(component.value).toBe(0);
        expect(component.valueInPercent).toBe(0);
    });

    it('should handle max set to 0 correctly', () => {
        component.max = 0;

        // Expect value to be clamped to max
        component.value = 10;
        expect(component.value).toBe(0);
        expect(component.valueInPercent).toBe(0);
    });

    it('should calculate step as 1% of max by default', () => {
        const defaultStep = component.max * 0.01;
        expect(component.step).toBe(defaultStep);
    });

    it('should not allow step larger than max', () => {
        component.step = 150;
        expect(component.step).toBe(component.max * 0.01);
    });

    it('should not constantly update progress value when value and max differ', () => {
        component.max = 3.25;
        component.value = 2.55;

        fixture.detectChanges();

        const progressBar = fixture.debugElement.nativeElement;
        expect(parseFloat(progressBar.attributes['aria-valuenow'].textContent)).toBe(component.value);
        expect(component.value).toBe(2.55);
    });

    it('should adjust value correctly when max is decreased', () => {
        component.max = 100;
        component.value = 80;

        component.max = 50; // Decrease max below value
        expect(component.value).toBe(50);
    });

    it('should not adjust value when max is increased', () => {
        component.max = 50;
        component.value = 40;

        component.max = 100; // Increase max
        expect(component.value).toBe(40);
    });

    it('should correctly calculate step based on max', () => {
        expect(component.step).toBe(1); // Default step is 1% of max (100)

        component.max = 200;
        expect(component.step).toBe(2); // 1% of 200

        component.step = 10; // Custom step
        expect(component.step).toBe(10);
    });

    it('should correctly toggle animation', () => {
        component.animate = false;
        expect(component.animate).toBe(false);

        component.animate = true;
        expect(component.animate).toBe(true);
    });

    it('should correctly update host styles', fakeAsync(() => {
        component.value = 50;

        tick(50);

        fixture.detectChanges();

        expect(nativeElement.style.getPropertyValue('--_progress-integer')).toBe('50');
        expect(nativeElement.style.getPropertyValue('--_progress-fraction')).toBe('0');
        expect(nativeElement.style.getPropertyValue('--_progress-whole')).toBe('50.00');
        expect(nativeElement.style.getPropertyValue('--_transition-duration')).toBe('2000ms');
    }));

    it('should correctly calculate fraction and integer values for progress', fakeAsync(() => {
        component.value = 75.25;

        tick(50);
        fixture.detectChanges();

        expect(nativeElement.style.getPropertyValue('--_progress-integer')).toBe('75');
        expect(nativeElement.style.getPropertyValue('--_progress-fraction')).toBe('25');
        expect(nativeElement.style.getPropertyValue('--_progress-whole')).toBe('75.25');
    }));

    it('should trigger progressChanged event when value changes', () => {
        spyOn(component.progressChanged, 'emit');

        component.value = 30;
        expect(component.progressChanged.emit).toHaveBeenCalledWith({
            previousValue: 0,
            currentValue: 30,
        });

        component.value = 50;
        expect(component.progressChanged.emit).toHaveBeenCalledWith({
            previousValue: 30,
            currentValue: 50,
        });
    });

    it('should not trigger progressChanged event when value remains the same', () => {
        spyOn(component.progressChanged, 'emit');

        component.value = 0; // Default value is already 0
        expect(component.progressChanged.emit).not.toHaveBeenCalled();
    });

    it('should trigger progressChanged event when indeterminate is true', () => {
        spyOn(component.progressChanged, 'emit');

        component.indeterminate = true;
        component.value = 30;
        expect(component.progressChanged.emit).toHaveBeenCalled();
    });
});
