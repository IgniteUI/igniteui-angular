import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseProgressDirective } from './progressbar.component';

@Component({
    template: '',
})
class TestProgressComponent extends BaseProgressDirective {
    // Expose the protected property for testing
    public get exposedHasFraction(): boolean {
        return this.hasFraction;
    }
}

describe('BaseProgressDirective', () => {
    let fixture: ComponentFixture<TestProgressComponent>;
    let baseDirective: TestProgressComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestProgressComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestProgressComponent);
        baseDirective = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should initialize with default values', () => {
        expect(baseDirective.indeterminate).toBe(false);
        expect(baseDirective.animationDuration).toBe(2000);
        expect(baseDirective.max).toBe(100);
        expect(baseDirective.value).toBe(0);
        expect(baseDirective.animate).toBe(true);
    });

    it('should correctly update the value within range', () => {
        baseDirective.value = 50;
        expect(baseDirective.value).toBe(50);

        // Value below range is not allowed
        baseDirective.value = -10;
        expect(baseDirective.value).toBe(0);

        // Value above range is not allowed
        baseDirective.value = 150;
        expect(baseDirective.value).toBe(100);
    });

    it('should not update value if indeterminate is true', () => {
        baseDirective.indeterminate = true;
        baseDirective.value = 50;
        expect(baseDirective.value).toBe(0);
    });

    it('should correctly calculate value in percentage', () => {
        baseDirective.value = 50;
        expect(baseDirective.valueInPercent).toBe(50);

        baseDirective.value = 25;
        baseDirective.max = 200;
        expect(baseDirective.valueInPercent).toBe(12.5);
    });

    it('should not exceed maximum or minimum value when max is updated', () => {
        baseDirective.value = 80;

        baseDirective.max = 50; // Reduce max below value
        expect(baseDirective.value).toBe(50);

        baseDirective.max = 200; // Increase max
        expect(baseDirective.value).toBe(50);
    });

    it('should handle floating-point numbers correctly', () => {
        baseDirective.max = 2.5;
        baseDirective.value = 2.67;

        // Expect value to be clamped to max
        expect(baseDirective.value).toBe(2.5);
        expect(baseDirective.valueInPercent).toBe(100);

        baseDirective.value = -0.3;

        // Expect value to be clamped to 0
        expect(baseDirective.value).toBe(0);
        expect(baseDirective.valueInPercent).toBe(0);
    });

    it('should handle max set to 0 correctly', () => {
        baseDirective.max = 0;

        // Expect value to be clamped to max
        baseDirective.value = 10;
        expect(baseDirective.value).toBe(0);
        expect(baseDirective.valueInPercent).toBe(0);
    });

    it('should calculate step as 1% of max by default', () => {
        const defaultStep = baseDirective.max * 0.01;
        expect(baseDirective.step).toBe(defaultStep);
    });

    it('should not allow step larger than max', () => {
        baseDirective.step = 150;
        expect(baseDirective.step).toBe(baseDirective.max * 0.01);
    });

    it('should not constantly update progress value when value and max differ', () => {
        baseDirective.max = 3.25;
        baseDirective.value = 2.55;

        fixture.detectChanges();

        const progressBar = fixture.debugElement.nativeElement;
        expect(parseFloat(progressBar.attributes['aria-valuenow'].textContent)).toBe(baseDirective.value);
        expect(baseDirective.value).toBe(2.55);
    });

    it('should adjust value correctly when max is decreased', () => {
        baseDirective.max = 100;
        baseDirective.value = 80;

        baseDirective.max = 50; // Decrease max below value
        expect(baseDirective.value).toBe(50);
    });

    it('should not adjust value when max is increased', () => {
        baseDirective.max = 50;
        baseDirective.value = 40;

        baseDirective.max = 100; // Increase max
        expect(baseDirective.value).toBe(40);
    });

    it('should correctly calculate step based on max', () => {
        expect(baseDirective.step).toBe(1); // Default step is 1% of max (100)

        baseDirective.max = 200;
        expect(baseDirective.step).toBe(2); // 1% of 200

        baseDirective.step = 10; // Custom step
        expect(baseDirective.step).toBe(10);
    });

    it('should correctly toggle animation', () => {
        baseDirective.animate = false;
        expect(baseDirective.animate).toBe(false);

        baseDirective.animate = true;
        expect(baseDirective.animate).toBe(true);
    });

    it('should correctly update host styles', async () => {
        baseDirective.value = 50;
        fixture.detectChanges();

        // Wait for async updates in the directive to complete
        await fixture.whenStable();

        const styles = baseDirective.hostStyles;

        expect(styles['--_progress-integer']).toBe('50'); // Validate integer part
        expect(styles['--_progress-fraction']).toBe('0'); // Validate fraction part
        expect(styles['--_progress-whole']).toBe('50.00'); // Validate whole value
        expect(styles['--_transition-duration']).toBe('2000ms'); // Validate animation duration
    });

    it('should correctly calculate fraction and integer values for progress', () => {
        baseDirective.value = 75.25;
        fixture.detectChanges();

        const styles = baseDirective.hostStyles;
        expect(styles['--_progress-integer']).toBe('75');
        expect(styles['--_progress-fraction']).toBe('25');
        expect(styles['--_progress-whole']).toBe('75.25');
    });

    it('should trigger progressChanged event when value changes', () => {
        spyOn(baseDirective.progressChanged, 'emit');

        baseDirective.value = 30;
        expect(baseDirective.progressChanged.emit).toHaveBeenCalledWith({
            previousValue: 0,
            currentValue: 30,
        });

        baseDirective.value = 50;
        expect(baseDirective.progressChanged.emit).toHaveBeenCalledWith({
            previousValue: 30,
            currentValue: 50,
        });
    });

    it('should not trigger progressChanged event when value remains the same', () => {
        spyOn(baseDirective.progressChanged, 'emit');

        baseDirective.value = 0; // Default value is already 0
        expect(baseDirective.progressChanged.emit).not.toHaveBeenCalled();
    });

    it('should not trigger progressChanged event when indeterminate is true', () => {
        spyOn(baseDirective.progressChanged, 'emit');

        baseDirective.indeterminate = true;
        baseDirective.value = 30; // Attempting to change value
        expect(baseDirective.progressChanged.emit).not.toHaveBeenCalled();
    });
});
